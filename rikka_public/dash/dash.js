const wsPort = 5861;

// WebSocket
const socket = new WebSocket(`ws://localhost:${wsPort}`); 
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
    if (receivedData.type === 'speedLimitUpdate') {
      console.log(`Speed limit updated to ${receivedData.speedLimit} km/h`);
      speed_limit = receivedData.speedLimit;
      changeAgentState('speed_limit_change');    
    }
  }
  else {
    console.log(event.data);
  }
});