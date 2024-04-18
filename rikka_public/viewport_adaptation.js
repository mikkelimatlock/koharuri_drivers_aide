function adjustAgentSize() {
  var agent = document.getElementById('agent');
  var aspectRatio = 2604 / 2456;
  var viewportAspectRatio = window.innerWidth / window.innerHeight;

  if (viewportAspectRatio > aspectRatio) {
    // Viewport is wider than the aspect ratio, limit by height
    agent.style.width = 'auto';
    agent.style.height = '88vh';
  } else {
    // Viewport is narrower than the aspect ratio, limit by width
    agent.style.width = '90vw';
    agent.style.height = 'auto';
  }
}

// Adjust the size when the window is resized
window.addEventListener('resize', adjustAgentSize);

// Adjust the size initially
adjustAgentSize();