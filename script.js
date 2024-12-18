// script.js

// Select DOM elements
const audioFileInput = document.getElementById('audioFile');
const inputGainControl = document.getElementById('inputGain');
const transistorGainControl = document.getElementById('transistorGain');
const distortionControl = document.getElementById('distortion');
const toneControl = document.getElementById('tone');
const levelControl = document.getElementById('level');
const playButton = document.getElementById('playButton');
const toggleBypassButton = document.getElementById('toggleBypass');

// Initialize Audio Context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Initialize Nodes
let sourceNode = null;

// Input Buffer
const inputGainNode = audioCtx.createGain();
inputGainNode.gain.value = parseFloat(inputGainControl.value);

// Transistor Booster Stage
const transistorGainNode = audioCtx.createGain();
transistorGainNode.gain.value = parseFloat(transistorGainControl.value);

// Op-Amp Gain Stage
const opAmpGainNode = audioCtx.createGain();
opAmpGainNode.gain.value = 1; // Initial gain, controlled by distortion

const distortionNode = audioCtx.createWaveShaper();
distortionNode.curve = makeHardClipCurve(parseFloat(distortionControl.value));
distortionNode.oversample = '4x';

// Tone Control Stage
// Low-Pass Filter (Cutoff: 234Hz) and High-Pass Filter (Cutoff: 1063Hz)
const lowPassFilter = audioCtx.createBiquadFilter();
lowPassFilter.type = 'lowpass';
lowPassFilter.frequency.value = 234;

const highPassFilter = audioCtx.createBiquadFilter();
highPassFilter.type = 'highpass';
highPassFilter.frequency.value = 1063;

// Mix filters based on tone control
const toneMixer = audioCtx.createGain();

// Output Level Control
const outputLevelNode = audioCtx.createGain();
outputLevelNode.gain.value = parseFloat(levelControl.value);

// Output Buffer
const outputBufferNode = audioCtx.createGain();
outputBufferNode.gain.value = 1;

// Bypass Handling
const bypassGainNode = audioCtx.createGain();
bypassGainNode.gain.value = 0; // Start with distortion enabled

// Connect Nodes (Effect Path)
inputGainNode
  .connect(transistorGainNode)
  .connect(opAmpGainNode)
  .connect(distortionNode)
  .connect(lowPassFilter)
  .connect(highPassFilter)
  .connect(toneMixer)
  .connect(outputLevelNode)
  .connect(outputBufferNode)
  .connect(audioCtx.destination);

// Connect Nodes (Bypass Path)
inputGainNode
  .connect(bypassGainNode)
  .connect(outputBufferNode);

// Initially, bypass is off, so distortion is active
bypassGainNode.gain.value = 0;

// Function to create hard clipping curve
function makeHardClipCurve(amount) {
  const k = parseFloat(amount) || 400;
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    curve[i] = Math.max(-1, Math.min(1, x * (1 + k)));
  }
  return curve;
}

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

        // Connect source to input buffer
        sourceNode.connect(inputGainNode);
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
    // To pause, we need to create a new source node
    sourceNode.stop();
    isPlaying = false;
    playButton.textContent = 'Play';
  }
});

// Handle Input Gain Control
inputGainControl.addEventListener('input', function() {
  inputGainNode.gain.value = parseFloat(this.value);
});

// Handle Transistor Gain Control
transistorGainControl.addEventListener('input', function() {
  transistorGainNode.gain.value = parseFloat(this.value);
});

// Handle Distortion Control
distortionControl.addEventListener('input', function() {
  distortionNode.curve = makeHardClipCurve(parseFloat(this.value));
});

// Handle Tone Control
toneControl.addEventListener('input', function() {
  const value = parseFloat(this.value);
  
  // Blend between low-pass and high-pass based on tone control
  lowPassFilter.gain = 1 - value; // More low frequencies when value is low
  highPassFilter.gain = value; // More high frequencies when value is high
  
  // Alternatively, adjust filter frequencies or mixing
  // For simplicity, we'll adjust the mix gain
  toneMixer.gain.value = value;
});

// Handle Output Level Control
levelControl.addEventListener('input', function() {
  outputLevelNode.gain.value = parseFloat(this.value);
});

// Handle Bypass Toggle
toggleBypassButton.addEventListener('click', function() {
  if (bypassGainNode.gain.value === 0) {
    // Enable Bypass
    bypassGainNode.gain.value = 1;
    toggleBypassButton.textContent = 'Disable Distortion';
  } else {
    // Disable Bypass
    bypassGainNode.gain.value = 0;
    toggleBypassButton.textContent = 'Enable Distortion';
  }
});

