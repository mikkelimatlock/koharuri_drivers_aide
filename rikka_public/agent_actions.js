// agent_actions.js

// GLOBALs
var default_state = 'default';
var current_mentality = 1; // positive for happier, negative for more worried.
// not really used now

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
      changeAgentState('default');
    }
    agentAudio.play();
  }
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
  }
  /* animations and fixing the div element */ 
  const shakingIntensity = {
    'angry': 'heavy',
    'worried': 'medium',
    'glad': 'light'
  };
  
  emotion = emotionByEvent[event];
 
  if (event === 'default') {
    changeAgentPortrait(default_state);
    changeAgentAudio('default');
    changeAgentAnimation('none');
  }
  else {
    changeAgentPortrait(emotion);
    changeAgentAudio(event);
    changeAgentAnimation(shakingIntensity[emotion]);
  }
}

/* MAIN BLOODY LOOP */
/* It's dangerous don't use it yet */

function mainLoop(){
  let audioElement = document.getElementById('agentAudio');
  if (audioElement.paused) {
    
  }
}

// setInterval(mainLoop, 1000);