// agent_actions.js

const httpPort = 5860; // Kind of sounds like koharu rikka, I guess
const wsPort = 5861;

// GLOBALs
var default_state = 'default';
var current_state = 'default';
// not really used now
var current_mentality = 1; // positive for happier, negative for more worried.
var speed_limit = 60; // km/h

function isValidJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

// WebSocket
const socket = new WebSocket(`ws://localhost:${wsPort}`); 
socket.addEventListener('message', function (event) {
  if (isValidJSON(event.data)) {
    const outGaugeData = JSON.parse(event.data); // This is the data from OutGauge, broadcast by WS server
    console.log(`Speed: ${outGaugeData.speed.toFixed(2)} km/h, brake: ${(outGaugeData.brake * 100).toFixed(1)}%`);
    processData(outGaugeData);
  }
  else {
    console.log(event.data);
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

function processData(outGaugeData) {
  let audioElement = document.getElementById('agentAudio');
  if (audioElement.paused) {
    if (outGaugeData.speed > speed_limit) {
      throttledChangeAgentState('speeding');
    }
  }
}
const debouncedProcessData = debounce(processData, 1000);


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
    // Add more conditions as needed
});

function voiceRandomiser(event) {
  /* List of available voices for each type of content */
  const voices = {
    'angry': ['angry1.wav'],
    'speeding': ['speeding1.wav', 'speeding2.wav'],
    'praise': ['praise1.wav'],
    'right_side': ['right_side1.wav'],
    'speed_limit_change': ['speed_limit_change1.wav'],
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
      agentPortrait.classList.add('shaking_light');
      break;
    case 'heavy':
      agentPortrait.classList.add('shaking_heavy');
      break;
    case 'medium':
      agentPortrait.classList.add('shaking_medium');
      break;
    case 'none':
    default:
      agentPortrait.classList.remove('shaking_light');
      agentPortrait.classList.remove('shaking_medium');
      agentPortrait.classList.remove('shaking_heavy');
  }
}

function changeAgentAudio(event) {
  let agentAudio = document.getElementById('agentAudio');
  if (event === 'default') {
    agentAudio.src = '';
    agentAudio.pause();
    return;
  }
  else {
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

function changeAgentState(event) {
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
    changeAgentAudio(event);
    changeAgentAnimation(shakingIntensity[emotion]);
  }
}

const throttledChangeAgentState = throttle(changeAgentState, 4000);

// timed right hand traffic promt
const rhtPromptInterval = 40000; // 40 seconds
const rhtPromptDelay = 500; // 0.5 seconds

let isRhtPromptQueued = false;

setInterval(() => {
  const audioElement = document.getElementById('agentAudio');

  if (audioElement.paused) {
    if (isRhtPromptQueued) {
      isRhtPromptQueued = false;
    } else {
      changeAgentState('right_side');
    }
  } else if (!isRhtPromptQueued) {
    setTimeout(changeAgentState('right_side'), rhtPromptDelay);
    isRhtPromptQueued = true;
  }
}, rhtPromptInterval);