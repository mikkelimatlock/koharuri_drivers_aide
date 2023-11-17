// agent_actions.js

document.addEventListener('keydown', function(event) {
    if (event.key === 'a') { // Replace with appropriate trigger
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
    'angry': ['voices/rikka/angry1.wav'],
    'speeding': ['voices/rikka/speeding1.wav'],
  }; 
  //
  /* Default state does not have voices */
  if (event != 'default') {
    if (voices[event] && voices[event].length > 0) {
      let randomIndex = Math.floor(Math.random() * voices[event].length);
      return voices[event][randomIndex];
    }
  }
  else return null;
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
  audioPath = voiceRandomiser(event);
  agentAudio.src = audioPath;
  agentAudio.play();

}

function changeAgentState(event) {
  let agent = document.getElementById('agent');
  agent.dataset.currentEvent = event;

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
    changeAgentPortrait('default');
    changeAgentAudio('default');
    changeAgentAnimation('none');
  }
  else {
    changeAgentPortrait(emotion);
    changeAgentAudio(event);
    changeAgentAnimation(shakingIntensity[emotion]);
  }
}