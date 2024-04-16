const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const beamngPort = 4444;

// Replace these with your actual data
const outGaugeData = {
  time: 0,
  carName: 'Test',
  flags: 0,
  gear: 'N',
  playerId: '0',
  speed: 0,
  rpm: 0,
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

client.send(buffer, beamngPort, 'localhost', (err) => {
  client.close();
});