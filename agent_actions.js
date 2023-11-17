// agent_actions.js

document.addEventListener('keydown', function(event) {
    if (event.key === 'a') { // Replace with appropriate trigger
        // changeAgentState('happy.png', 'happy.mp3');
        changeAgentState('angry', 'voices/angry.mp3')
    }
    if (event.key === 'd') {
      changeAgentState('composed', 'voices/composed.mp3')
    }
    // Fix audio path later
    if (event.key === 's') {
      changeAgentState('default', 'voices/default.mp3')
    }
    // Add more conditions as needed
});

function voiceRandomiser(state) {
  /* List of available voices for each state */
  const voices = {
    'angry': ['voices/rikka/angry1.wav']
  }; 
  //
  /* Default state does not have voices */
  if (state != 'default') {
    if (voices[state] && voices[state].length > 0) {
      let randomIndex = Math.floor(Math.random() * voices[state].length);
      return voices[state][randomIndex];
    }
  }
  else return null;
}

function changeAgentState(state) {
  /* a face changer */
  let portrait = 'images/' + state + '.png';
  let agentPortrait = document.getElementById('agentPortrait')
  agentPortrait.src = portrait;

  let agentAudio = document.getElementById('agentAudio');
  

  /* animations and fixing the div element */ 
  const shakingIntensity = {
    'angry': 'shaking_heavy',
    'composed': 'shaking_light'
  };
  
  if (state != 'default') {
    /* clear any existing shakings */
    agentPortrait.classList.remove('shaking_heavy');
    agentPortrait.classList.remove('shaking_light');

    agentPortrait.classList.add(shakingIntensity[state]);
    let newVoicePath = voiceRandomiser(state);
    agentAudio.src = newVoicePath;
    agentAudio.play();
  }
  if (state === 'default') {
    agentPortrait.classList.remove('shaking_heavy');
    agentPortrait.classList.remove('shaking_light');
    /* remove the current audio path */
    agentAudio.src = '';
  }
}