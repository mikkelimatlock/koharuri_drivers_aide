// agent_actions.js

const httpPort = 5860; // Kind of sounds like koharu rikka, I guess
const wsPort = 5861;
// const wsHost = "127.0.0.1";
const wsHost = location.hostname;

// GLOBALs
var default_state = 'default';
var current_state = 'default';
// not really used now
var current_mentality = 1; // positive for happier, negative for more worried.
var speed_limit = 30; // km/h

// throttling function from somewhere prolly stolen and amalgated by Copilot

// tooo complex version
// function throttle(func, limit) {
//   let lastFunc;
//   let lastRan;
//   return function() {
//     const context = this;
//     const args = arguments;
//     if (!lastRan) {
//       func.apply(context, args);
//       lastRan = Date.now();
//     } else {
//       clearTimeout(lastFunc);
//       lastFunc = setTimeout(function() {
//         if ((Date.now() - lastRan) >= limit) {
//           func.apply(context, args);
//           lastRan = Date.now();
//         }
//       }, limit - (Date.now() - lastRan));
//     }
//   }
// }

function throttle(func, limit) {
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan || (Date.now() - lastRan) >= limit) {
      func.apply(context, args);
      lastRan = Date.now();
    }
  }
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// WebSocket
var socket;
var isConnected = false;
const _VERBOSE_ALERT = false;

function gearIndexToText(gearNum) {
  var automatic = true;
  if (gearNum === 0) {
    return 'R';
  } else if (gearNum === 1) {
    return 'N';
  } else {
    if (automatic) {
      return 'D';
    } else{
      return gearNum - 1;
    }
  }
}

// Button for initiating / terminating connection with WebSocket sever
document.getElementById('wsButton').addEventListener('click', function() {
  if (isConnected) {
    socket.close();
  } else {
    socket = new WebSocket(`ws://${wsHost}:${wsPort}`);
    socket.onopen = () => {
      socket.send(JSON.stringify({type: 'agent', message: 'connected'}));
      isConnected = true;
      document.getElementById('wsButton').innerText = 'Disconnect';
      // initialise speed limit
      var speedLimitNumber = document.getElementById('speedLimitNumericalValue');
      if (speedLimitNumber) {
        speedLimitNumber.textContent = speed_limit;
        // console.log('Element found:', speedLimitNumber);
      } else {
        console.log('Element not found');
      }
      // Todo: add an agent action prompting that connection is established
    }
    socket.onclose = () => {
      isConnected = false;
      if (_VERBOSE_ALERT) {
        alert('Connection to WebSocket server closed');
      }
      document.getElementById('wsButton').innerText = 'Connect';
    }
    socket.addEventListener('message', function (event) {
      if (isValidJSON(event.data)) {
        const receivedData = JSON.parse(event.data);
        if (receivedData.type === 'outGaugeData') {
          const outGaugeData = receivedData;
          console.log(`Speed: ${outGaugeData.speed.toFixed(2)} km/h, brake: ${(outGaugeData.brake * 100).toFixed(1)}%`);
          console.log(`Gear: ${gearIndexToText(outGaugeData.gear)}, RPM: ${outGaugeData.rpm.toFixed(0)}`);
          var speedNumber = document.getElementById('speedNumericalValue');
          if (speedNumber) {
            speedNumber.textContent = outGaugeData.speed.toFixed(0);
            // comment this out when experimenting with speed limit
            if (parseInt(outGaugeData.speed) > speed_limit) {
              speedNumber.setAttribute('fill', '#ff4040');
              speedNumber.setAttribute('stroke', '#c71010');
            } else {
              speedNumber.setAttribute('fill', '#fff');
              speedNumber.setAttribute('stroke', '#d6d8d9');
            }
            // console.log('Element found:', speedNumber);
          } else {
            console.log('Element not found');
          }
          var tachoNumber = document.getElementById('tachoNumericalValue');
          if (tachoNumber) {
            tachoNumber.textContent = outGaugeData.rpm.toFixed(0);
            if (outGaugeData.rpm > 6000) {
              tachoNumber.setAttribute('fill', '#ff4040');
              tachoNumber.setAttribute('stroke', '#c71010');
              // todo: over rev agent action
            } else {
              tachoNumber.setAttribute('fill', '#fff');
              tachoNumber.setAttribute('stroke', '#d6d8d9');
            }
          } else {
            console.log('Element not found');
          }
          var gearChar = document.getElementById('gearCharValue');
          if (gearChar) {
            gearChar.textContent = gearIndexToText(outGaugeData.gear);
          } else {
            console.log('Element not found');
          }
          debouncedProcessData(outGaugeData);
        }
        if (receivedData.type === 'speedLimitUpdate') {
          console.log(`Speed limit updated to ${receivedData.speedLimit} km/h`);
          speed_limit = parseInt(receivedData.speedLimit, 10);
          var speedLimitNumber = document.getElementById('speedLimitNumericalValue');
          if (speedLimitNumber) {
            speedLimitNumber.textContent = speed_limit;
            // console.log('Element found:', speedLimitNumber);
          } else {
            console.log('Element not found');
          }
          changeAgentState('speed_limit_change');    
        }
      }
      else {
        console.log(event.data);
      }
    });
  }
});

let debounceTimer;
function debounce(func, wait){
  return function(...args) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}


let throttledChangeAgentState10 = throttle(changeAgentState, 10000);

function processData(outGaugeData) {
  let audioElement = document.getElementById('agentAudio');
  if (audioElement.paused) {
    // if (outGaugeData.speed > speed_limit) {
    if (outGaugeData.speed > (1.1 * speed_limit)) {
      
      throttledChangeAgentState10('speeding');
    }
  }
}

const debouncedProcessData = debounce(processData, 400);

function voiceRandomiser(event) {
  /* List of available voices for each type of content */
  const voices = {
    'angry': ['angry1.wav'],
    'speeding': ['speeding1.wav', 'speeding2.wav'],
    'praise': ['praise1.wav'],
    // 'right_side': ['right_side1.wav'],
    'speed_limit_change': ['speed_limit_change1.wav'],
    'high_rev': ['high_rev1.wav'],
    'turn_left': ['turn_left1.wav'],
    'turn_right': ['turn_right1.wav'],
    'turn_500m_left': ['turn_500m_left1.wav'],
    'turn_500m_right': ['turn_500m_right1.wav'],
  }; 
  //
  /* Default state does not have voices */
  if (event != 'default') {
    if (voices[event] && voices[event].length > 0) {
      let randomIndex = Math.floor(Math.random() * voices[event].length);
      return 'voices/rikka/' + voices[event][randomIndex];
    }
  }
}

function changeAgentPortrait(emotion) {
  let portrait = 'images/' + emotion + '.png';
  let agentPortrait = document.getElementById('agentPortrait')
  agentPortrait.src = portrait;
}

function changeAgentAnimation(intensity) {
  let agentPortrait = document.getElementById('agentPortrait')
  switch(intensity) {
    case 'light':
      agentPortrait.classList.remove('shaking_light');
      agentPortrait.classList.remove('shaking_medium');
      agentPortrait.classList.remove('shaking_heavy');
      agentPortrait.classList.add('shaking_light');
      break;
    case 'heavy':
      agentPortrait.classList.remove('shaking_light');
      agentPortrait.classList.remove('shaking_medium');
      agentPortrait.classList.remove('shaking_heavy');
      agentPortrait.classList.add('shaking_heavy');
      break;
    case 'medium':
      agentPortrait.classList.remove('shaking_light');
      agentPortrait.classList.remove('shaking_medium');
      agentPortrait.classList.remove('shaking_heavy');
      agentPortrait.classList.add('shaking_medium');
      break;
    case 'none':
    default:
      agentPortrait.classList.remove('shaking_light');
      agentPortrait.classList.remove('shaking_medium');
      agentPortrait.classList.remove('shaking_heavy');
  }
}

function changeAgentAudio(event, turn_direction=null) {
  let agentAudio = document.getElementById('agentAudio');
  if (event === 'default') {
    agentAudio.src = '';
    agentAudio.pause();
    return;
  }
  else {
    if ((event == "turn" || event == "turn_500m" && turn_direction != null) {
      event = event + "_" + turn_direction;
    }
    audioPath = voiceRandomiser(event);
    agentAudio.src = audioPath;
    agentAudio.onended = function(){
      resetAgentState();
    }
    agentAudio.play();
  }
}


function resetAgentState() { // to default
  console.log("resetting agent state to default");
  current_state = default_state
  changeAgentPortrait(default_state);
  changeAgentAudio('default');
  changeAgentAnimation('none');
}

function changeAgentStateBackupTimer() {
  // sometimes the webpage fails to play a sound, this is a backup timer to reset the agent state
  
}

function changeAgentState(event, turn_direction=null) {
  console.log("changing agent state to " + event);
  let agent = document.getElementById('agent');
  agent.dataset.currentevent = event;

  /* corresponding emotions (for portrait) for each type of event */
  const emotionByEvent = {
    'speeding': 'worried',
    'praise': 'glad',
    'hard_brake': 'angry',
    'right_side': 'glad',
    'speed_limit_change': 'default2',
    'turn': 'default2',
  }
  /* animations and fixing the div element */ 
  const shakingIntensity = {
    'angry': 'heavy',
    'worried': 'medium',
    'glad': 'light',
    'right_side': 'light',
  };
  
  emotion = emotionByEvent[event];

  if (event === 'default') {
    resetAgentState();
  }
  else {
    current_state = event;
    changeAgentPortrait(emotion);
    changeAgentAudio(event, turn_direction);
    changeAgentAnimation(shakingIntensity[emotion]);
  }
}

// const throttledChangeAgentState = throttle(changeAgentState, 5000);

// timed right hand traffic promt
const rhtPromptInterval = 40000; // 40 seconds
const rhtPromptDelay = 500; // 0.5 seconds

let isRhtPromptQueued = false;
let isRhtPromptEnabled = false;

setInterval(() => {
  const audioElement = document.getElementById('agentAudio');

  if (isRhtPromptEnabled) {
    if (audioElement.paused) {
      // if it's not playing
      if (isRhtPromptQueued) {
        isRhtPromptQueued = false;
      } else {
        changeAgentState('right_side');
      } 
    } else {
      if (!isRhtPromptQueued) {
        setTimeout(changeAgentState('right_side'), rhtPromptDelay);
        isRhtPromptQueued = true;
      }
    }
  }
}, rhtPromptInterval);


/* testing triggers. delete / comment when integrating with anything more useful */
document.addEventListener('keydown', function(event) {
  if (event.key === 'a') { // Replace with appropriate trigger
    console.log("speeding event triggered");
    changeAgentState('speeding')
  }
  if (event.key === 'd') {
    changeAgentState('praise')
  }
  if (event.key === 's') {
    changeAgentState('default')
  }
  if (event.key === 'f') {
    isRhtPromptEnabled = !isRhtPromptEnabled;
    console.log(`Right hand traffic prompt is ${isRhtPromptEnabled ? 'enabled' : 'disabled'}`);
  }
  // Add more conditions as needed
});