const wsPort = 5861;
const wsHost = location.hostname;

function isValidJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// WebSocket
const socket = new WebSocket(`ws://${wsHost}:${wsPort}`); 
socket.onopen = () => {
  socket.send(JSON.stringify({type: 'admin', message: 'connected'}));
}
socket.addEventListener('message', function (event) {
  if (isValidJSON(event.data)) {
    const receivedData = JSON.parse(event.data);
    if (receivedData.type === 'outGaugeData') {
      const outGaugeData = receivedData;
      console.log(`Speed: ${outGaugeData.speed.toFixed(2)} km/h, brake: ${(outGaugeData.brake * 100).toFixed(1)}%`);
      processData(outGaugeData);
    }
    // if (receivedData.type === 'speedLimitUpdate') {
    //   console.log(`Speed limit updated to ${receivedData.speedLimit} km/h`);
    //   speed_limit = receivedData.speedLimit;
    // }
  }
  else {
    console.log(event.data);
  }
});

button_60 = document.getElementById('button_60kph');
button_80 = document.getElementById('button_80kph');

button_60.addEventListener('click', function() {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'speedLimitUpdate',
    speedLimit: 60
  }));
});
button_80.addEventListener('click', function() {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'speedLimitUpdate',
    speedLimit: 80
  }));
});