const express = require('express');
const morgan = require('morgan');
const dgram = require('dgram');
const app = express();
const httpPort = 5860; // You can use any port that's open
const beamngPort = 4444;

/* ************* */
/* THE HTTP PART */
// Use morgan to log HTTP requests 
app.use(morgan('dev'));

// Serve static files from 'rikka_public' directory
app.use(express.static('rikka_public'));

// Start the server
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

/* ************ */
/* THE UDP PART */
// Set up the UDP server for OutGauge
function startUdpServer() {
  const udpServer = dgram.createSocket('udp4');

  udpServer.on('error', (err) => {
    console.log(`UDP Server error: ${err.stack}`);
    udpServer.close();
  });

  udpServer.on('message', (msg, rinfo) => {
    // console.log(`UDP Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    // Parsing the OutGauge data
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
    console.log(`Speed: ${outGaugeData.speed} km/h`);
  });

  udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`UDP Server listening ${address.address}:${address.port}`);
  });

  // Bind UDP server to the appropriate port
  udpServer.bind(beamngPort);
}

startUdpServer();
/* ************ */