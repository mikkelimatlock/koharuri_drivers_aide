const express = require('express');
const morgan = require('morgan');
const dgram = require('dgram');
const { createServer } = require('http');
const { Server } = require('ws');
// const WebSocket = require('ws');

const app = express();
const httpPort = 5860; // Kind of sounds like koharu rikka, I guess
const beamngPort = 4444;
const wsPort = 5861;

/* ************* */
/* THE HTTP PART */
// Use morgan to log HTTP requests 
app.use(morgan('dev'));

// Serve static files from 'rikka_public' directory
app.use(express.static('rikka_public'));

// Start the HTTP server
app.listen(httpPort, () => {
  console.log(`Server running at http://localhost:${httpPort}/`);
});
/* ************* */

var outGaugeData = {
  time: 0,
  carName: '',
  flags: 0,
  gear: '',
  playerId: '', 
  speed: 0.,
  rpm: 0.,
  turbo: 0.,
  engTemp: 0.,
  fuel: 0.,
  oilPressure: 0., 
  oilTemp: 0.,
  dashLights: 0,
  showLights: 0,
  throttle: 0.,
  brake: 0.,
  clutch: 0.,
  // Someone (https://github.com/therealshark/outgauge2html) says this is not right but it doesn't matter
  display: [ '', '' ]
};

const httpServer = createServer(app);

/* ************ */
/* THE UDP and WebSocket PART */

// Set up the WebSocket server and broadcasting function


// const wss = new Server({ server: httpServer });
const wss = new Server({ port: wsPort });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  ws.send('Successfully connected to WebSocket server');

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });

});

wss.on('error', (error) => {
  console.log('WebSocket error: ', error);
});

function broadcast(data){
  wss.clients.forEach((client) => {
    if (client.readyState == 1) {
      client.send(JSON.stringify(data));
      console.log(`Sent data to client ${client._socket.remoteAddress}:${client._socket.remotePort}`);
    }
  });
}

function logClients(){
  console.log(`Number of connected clients: ${wss.clients.size}`);
  wss.clients.forEach((client, index) => {
    console.log(`Client ${index + 1} readyState: ${client.readyState}`);
  });
}

// throttling function from somewhere prolly stolen and amalgated by Copilot
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

function parseOutGaugeData(msg) {
  outGaugeData.time = msg.readUInt32LE(0);
  outGaugeData.carName = msg.toString('ascii', 4, 8);
  outGaugeData.flags = msg.readUInt16LE(8);
  outGaugeData.gear = String.fromCharCode(msg[10]);
  outGaugeData.playerId = String.fromCharCode(msg[11]);
  outGaugeData.speed = msg.readFloatLE(12) * 3.6;
  outGaugeData.rpm = msg.readFloatLE(16);
  outGaugeData.turbo = msg.readFloatLE(20); // in bars
  outGaugeData.engTemp = msg.readFloatLE(24); // in celcius
  outGaugeData.fuel = msg.readFloatLE(28); // percentage (0, 1)
  outGaugeData.oilPressure = msg.readFloatLE(32); // in bars
  outGaugeData.oilTemp = msg.readFloatLE(36); // in celcius
  outGaugeData.dashLights = msg.readUInt32LE(40);
  outGaugeData.showLights = msg.readUInt32LE(44);
  outGaugeData.throttle = msg.readFloatLE(48); // percentage (0, 1)
  outGaugeData.brake = msg.readFloatLE(52); // percentage (0, 1)
  outGaugeData.clutch = msg.readFloatLE(56); // percentage (0, 1)
  // Someone (https://github.com/therealshark/outgauge2html) says this is not right but it doesn't matter
  outGaugeData.display = [
    msg.toString('ascii', 60, 76),
    msg.toString('ascii', 76, 92)
  ];
  console.log(`Speed: ${outGaugeData.speed.toFixed(2)} km/h, brake: ${(outGaugeData.brake * 100).toFixed(1)}%`);
  logClients();
  broadcast(outGaugeData);
}

const throttledParseOutGaugeData = throttle(parseOutGaugeData, 500);

// Set up the UDP server for OutGauge



function startUdpServer() {
  const udpServer = dgram.createSocket('udp4');

  udpServer.on('error', (err) => {
    console.log(`UDP Server error: ${err.stack}`);
    udpServer.close();
  });

  udpServer.on('message', (msg, rinfo) => {
    throttledParseOutGaugeData(msg);
  });

  udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP Server listening ${address.address}:${address.port}`);
  });
  
  // Watchdog, 1 sec reboot
  udpServer.on('close', () => {
    console.log('UDP Server closed, restarting in 1...');
    setTimeout(startUdpServer, 1000);
  });

  // Bind UDP server to the appropriate port
  udpServer.bind(beamngPort);
}

startUdpServer();
/* ************ */