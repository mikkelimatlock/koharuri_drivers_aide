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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/rikka_public/main.html');
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/rikka_public/dash/dash.html');
});

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

// client type map, for identifying admin and agent clients
let clientTypes = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  logClients(veorbose=true);
  ws.send('Successfully connected to WebSocket server');

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if(data.type === 'admin') {
      // Admin message
      if (data.message) {
        console.log('Admin message: ', data.message);
      }
      if (data.message == 'connected') {
        clientTypes.set(ws, 'admin');
      }
      if (data.action === 'speedLimitUpdate') {
        console.log(`Speed limit updated to ${data.speedLimit} km/h`);
        const speedLimitUpdatePacket = {
          type: 'speedLimitUpdate',
          speedLimit: data.speedLimit
        }
        broadcastToAgents(speedLimitUpdatePacket, verbose=true);
      } else if (data.action === 'turnCall') {
        // Turn call
        console.log(`Turn call: ${data.direction}, ${data.distant ? '500m' : 'here'}`);
        const turnCallPacket = {
          type: 'turnCall',
          direction: data.direction,
          distant: data.distant
        }
        broadcastToAgents(turnCallPacket, verbose=true);
      } else if (data.action === 'warnStopSign') {
        // Warn about stop sign
        console.log(`Stop sign ahead`);
        const stopSignPacket = {
          type: 'warnStopSign'
        };
        broadcastToAgents(stopSignPacket, verbose=true);

      } else if (data.action === 'commentDriving') {
        // Comment on driving
        const commentPacket = {
          type: 'commentDriving',
          praise: data.praise // true or false
        };
        broadcastToAgents(commentPacket, verbose=true);
      } else if (data.action === 'genericPrompt') {
        // Generic prompt
        const genericPromptPacket = {
          type: 'genericPrompt',
          prompt: data.prompt
        };
        broadcastToAgents(genericPromptPacket, verbose=true);
      }
    } else if (data.type === 'agent') {
      // Agent message
      console.log('Agent message: ', data.message);
      if (data.message === 'connected') {
        clientTypes.set(ws, 'agent');
      }
    }
    
  });

});

wss.on('error', (error) => {
  console.log('WebSocket error: ', error);
});

function broadcast(data, verbose=false){
  wss.clients.forEach((client) => {
    if (client.readyState == 1) {
      client.send(JSON.stringify(data));
      if (verbose) {
        console.log(`Sent data to client ${client._socket.remoteAddress}:${client._socket.remotePort}`);
      }
    }
  });
}

function broadcastToAgents(data, verbose=false) {
  wss.clients.forEach((client) => {
    if (client.readyState == 1) {
      if (clientTypes.get(client) === 'agent') {
        client.send(JSON.stringify(data));
        if (verbose) {
          console.log(`Sent data to agent ${client._socket.remoteAddress}:${client._socket.remotePort}`);
        }
      }
    }
  });

}

function logClients(verbose=false){
  if (verbose) {
    console.log(`Number of connected clients: ${wss.clients.size}`);
    wss.clients.forEach((client, index) => {
      console.log(`Client ${index + 1} at ${client._socket.remoteAddress} readyState: ${client.readyState}`);
    });
  }
}

// throttling function from somewhere probably stolen and amalgated by Copilot
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
  // outGaugeData.gear = String.fromCharCode(msg[10]);
  outGaugeData.gear = msg[10];
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
  // console.log(`Speed: ${outGaugeData.speed.toFixed(2)} km/h, brake: ${(outGaugeData.brake * 100).toFixed(1)}%`);
  logClients();
  outGaugeData.type = 'outGaugeData';
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
  udpServer.bind(beamngPort, '0.0.0.0');
}

startUdpServer();
/* ************ */