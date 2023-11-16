// agent_actions.js

document.addEventListener('keydown', function(event) {
    if (event.key === 'a') { // Replace with appropriate trigger
        // changeAgentState('happy.png', 'happy.mp3');
        changeAgentState('angry', 'voices/angry.mp3')
    }
    // Fix audio path later
    if (event.key === 's') {
      changeAgentState('default', 'voices/default.mp3')
    }
    // Add more conditions as needed
});

function changeAgentState(state, sound) {
  let portrait = 'images/' + state + '.png';
  let agentPortrait = document.getElementById('agentPortrait')
  agentPortrait.src = portrait;
  if (state != 'default') {
    agentPortrait.classList.add('shaking_heavy');
  }
  else {
    agentPortrait.classList.remove('shaking_heavy');
  }
  // let audioElement = document.getElementById('agentAudio');
  // audioElement.src = sound;
  // audioElement.play();
}