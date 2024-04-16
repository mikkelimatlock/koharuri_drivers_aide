const dgram = require('dgram');
const client = dgram.createSocket('udp4');

// Replace these with your actual data
let outGaugeData = {
  time: 0,
  carName: 'test',
  flags: 0,
  gear: 'N',
  playerId: '0',
  speed: 6,
  rpm: 750,
  turbo: 0,
  engTemp: 0,
  fuel: 0,
  oilPressure: 0,
  oilTemp: 0,
  dashLights: 0,
  showLights: 0,
  throttle: 0,
  brake: 0,
  clutch: 0,
  display: ['Test', 'Test']
};

const args = process.argv.slice(2);
let targetHost = 'localhost'; // Default host
let beamngPort = 4444;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-h' && i + 1 < args.length) {
    targetHost = args[i + 1];
  }
  if (args[i] === '-p' && i + 1 < args.length) {
    beamngPort = parseInt(args[i + 1]);
  }
  if (args[i] === '-s' && i + 1 < args.length) {
    outGaugeData.speed = parseFloat(args[i + 1]);
  }
}



const buffer = Buffer.alloc(92);
buffer.writeUInt32LE(outGaugeData.time, 0);
buffer.write(outGaugeData.carName, 4, 'ascii');
buffer.writeUInt16LE(outGaugeData.flags, 8);
buffer.write(outGaugeData.gear, 10);
buffer.write(outGaugeData.playerId, 11);
buffer.writeFloatLE(outGaugeData.speed, 12);
buffer.writeFloatLE(outGaugeData.rpm, 16);
buffer.writeFloatLE(outGaugeData.turbo, 20);
buffer.writeFloatLE(outGaugeData.engTemp, 24);
buffer.writeFloatLE(outGaugeData.fuel, 28);
buffer.writeFloatLE(outGaugeData.oilPressure, 32);
buffer.writeFloatLE(outGaugeData.oilTemp, 36);
buffer.writeUInt32LE(outGaugeData.dashLights, 40);
buffer.writeUInt32LE(outGaugeData.showLights, 44);
buffer.writeFloatLE(outGaugeData.throttle, 48);
buffer.writeFloatLE(outGaugeData.brake, 52);
buffer.writeFloatLE(outGaugeData.clutch, 56);
buffer.write(outGaugeData.display[0], 60, 'ascii');
buffer.write(outGaugeData.display[1], 76, 'ascii');

client.send(buffer, beamngPort, targetHost, (err) => {
  client.close();
});