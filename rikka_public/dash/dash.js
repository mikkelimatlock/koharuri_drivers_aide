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
      // const outGaugeData = receivedData;
      // console.log(`Speed: ${outGaugeData.speed.toFixed(2)} km/h, brake: ${(outGaugeData.brake * 100).toFixed(1)}%`);
      // processData(outGaugeData);
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

button_30 = document.getElementById('button_30kph');
button_40 = document.getElementById('button_40kph');
button_50 = document.getElementById('button_50kph');
button_60 = document.getElementById('button_60kph');
button_80 = document.getElementById('button_80kph');
button_custom_speed = document.getElementById('button_custom_speed');

button_left_turn = document.getElementById('button_left_turn');
button_right_turn = document.getElementById('button_right_turn');
button_left_500m = document.getElementById('button_left_500m');
button_right_500m = document.getElementById('button_right_500m');
button_stop_sign = document.getElementById('button_stop_sign');

button_praise = document.getElementById('button_praise');
button_slam = document.getElementById('button_slam');
button_relax = document.getElementById('button_relax');
button_curve = document.getElementById('button_curve');

function setSpeedLimit(speedLimit) {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'speedLimitUpdate',
    speedLimit: speedLimit
  }));
}

function turnCall(direction, distant=false) {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'turnCall',
    direction: direction,
    distant: distant
  }));
}

function warnStopSign() {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'warnStopSign'
  }));
}

function commentDriving(praise=true) {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'commentDriving',
    praise: praise,
    message: praise ? 'That was decent!' : 'What the hell was that?'
  }));
}

function genericPrompt(prompt) {
  socket.send(JSON.stringify({
    type: 'admin',
    action: 'genericPrompt',
    prompt: prompt,
    message: `prompt: ${prompt}`
  }));
  // console.log(`button clicked: ${prompt}`);
}


button_30.addEventListener('click', () => setSpeedLimit(30));
button_40.addEventListener('click', () => setSpeedLimit(40));
button_50.addEventListener('click', () => setSpeedLimit(50));
button_60.addEventListener('click', () => setSpeedLimit(60));
button_80.addEventListener('click', () => setSpeedLimit(80));
button_custom_speed.addEventListener('click', () => {
  const custom_speed = parseInt(document.getElementById('custom_speed').value, 10);
  console.log(`custom_speed: ${custom_speed}`);
  if (Number.isInteger(custom_speed)){
    setSpeedLimit(custom_speed);
  } else {
    // does nothing and it's fine
  }
});

button_left_turn.addEventListener('click', () => turnCall('left'));
button_right_turn.addEventListener('click', () => turnCall('right'));
button_left_500m.addEventListener('click', () => turnCall('left', far=true));
button_right_500m.addEventListener('click', () => turnCall('right', far=true));
button_stop_sign.addEventListener('click', () => warnStopSign());

button_praise.addEventListener('click', () => commentDriving(praise=true));
button_slam.addEventListener('click', () => commentDriving(praise=false));
button_relax.addEventListener('click', () => genericPrompt('relax'));
button_curve.addEventListener('click', () => genericPrompt('curve'));