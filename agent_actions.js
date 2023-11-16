// agent_actions.js

document.addEventListener('keydown', function(event) {
    if (event.key === 'a') { // Replace with appropriate trigger
        // changeAgentState('happy.png', 'happy.mp3');
        changeAgentState('images/angry.png', 'voices/angry.mp3')
    }
    if (event.key === 's') {
      changeAgentState('images/default.png', 'voices/default.mp3')
    }
    // Add more conditions as needed
});

function changeAgentState(portrait, sound) {
    document.getElementById('agentPortrait').src = portrait;
    // let audioElement = document.getElementById('agentAudio');
    // audioElement.src = sound;
    // audioElement.play();
}