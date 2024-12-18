// script.js

// Select DOM elements
const audioFileInput = document.getElementById('audioFile');
const reverbModeSelect = document.getElementById('reverbMode');
const reverbControls = document.getElementById('reverbControls');
const decaySlider = document.getElementById('decay');
const decayValue = document.getElementById('decayValue');
const mixSlider = document.getElementById('mix');
const mixValue = document.getElementById('mixValue');
const playButton = document.getElementById('playButton');

// Initialize Audio Context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Initialize Nodes
let sourceNode = null;
let convolver = audioCtx.createConvolver();
let dryGain = audioCtx.createGain();
let wetGain = audioCtx.createGain();
let masterGain = audioCtx.createGain();

// Connect Nodes
dryGain.connect(masterGain);
wetGain.connect(masterGain);
masterGain.connect(audioCtx.destination);

// Function to load impulse responses
const impulseResponses = {
  room: 'https://example.com/impulse-responses/room.wav',
  hall: 'https://example.com/impulse-responses/hall.wav',
  spring: 'https://example.com/impulse-responses/spring.wav',
  shimmer: 'https://example.com/impulse-responses/shimmer.wav',
  dynamic: 'https://example.com/impulse-responses/dynamic.wav',
  reebop: 'https://example.com/impulse-responses/reebop.wav'
};

// Function to load impulse response
async function loadImpulseResponse(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  convolver.buffer = audioBuffer;
}

// Function to initialize reverb based on mode
async function initReverb(mode) {
  if (mode === 'none') {
    convolver.disconnect();
    wetGain.disconnect();
    return;
  }

  const url = impulseResponses[mode];
  if (url) {
    await loadImpulseResponse(url);
    convolver.connect(wetGain);
  }
}

// Handle reverb mode change
reverbModeSelect.addEventListener('change', async function() {
  const mode = this.value;
  if (mode === 'none') {
    reverbControls.style.display = 'none';
    convolver.disconnect();
    wetGain.disconnect();
  } else {
    reverbControls.style.display = 'block';
    await initReverb(mode);
  }
});

// Handle audio file upload
audioFileInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      const arrayBuffer = ev.target.result;
      audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
        if (sourceNode) {
          sourceNode.disconnect();
        }
        sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true; // Loop the audio

        // Connect source to dry and wet paths
        sourceNode.connect(dryGain);
        sourceNode.connect(convolver);
      }, function(err) {
        console.error('Error decoding audio data:', err);
      });
    };
    reader.readAsArrayBuffer(file);
  }
});

// Handle Play/Pause
let isPlaying = false;
playButton.addEventListener('click', function() {
  if (!sourceNode) return;

  if (!isPlaying) {
    sourceNode.start(0);
    isPlaying = true;
    playButton.textContent = 'Pause';
  } else {
    // To pause, create a new source node
    sourceNode.stop();
    isPlaying = false;
    playButton.textContent = 'Play';
  }
});

// Handle Decay Time Control
decaySlider.addEventListener('input', function() {
  const decay = parseFloat(this.value);
  decayValue.textContent = decay.toFixed(1);
  
  // Adjust the gain of the convolver based on decay
  // Note: ConvolverNode does not have a direct decay parameter
  // This is a simplified approximation
  convolver.normalize = true;
  // To simulate decay time, you would need different impulse responses
});

// Handle Mix Level Control
mixSlider.addEventListener('input', function() {
  const mix = parseInt(this.value);
  mixValue.textContent = mix;
  
  const wet = mix / 100;
  const dry = 1 - wet;
  
  dryGain.gain.setValueAtTime(dry, audioCtx.currentTime);
  wetGain.gain.setValueAtTime(wet, audioCtx.currentTime);
});

// Initialize default settings
decayValue.textContent = decaySlider.value;
mixValue.textContent = mixSlider.value;

// Initialize with no reverb
initReverb('none');

