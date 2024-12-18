// script.js

// Select DOM elements
const audioFileInput = document.getElementById('audioFile');
const sweepSlider = document.getElementById('sweep');
const sweepValue = document.getElementById('sweepValue');
const intensitySlider = document.getElementById('intensity');
const intensityValue = document.getElementById('intensityValue');
const mixSlider = document.getElementById('mix');
const mixValue = document.getElementById('mixValue');
const playButton = document.getElementById('playButton');

// Initialize Audio Context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Initialize Nodes
let sourceNode = null;
const dryGain = audioCtx.createGain();
const wetGain = audioCtx.createGain();
const masterGain = audioCtx.createGain();
const bandPassFilter = audioCtx.createBiquadFilter();

// Connect Nodes
dryGain.connect(masterGain);
wetGain.connect(masterGain);
masterGain.connect(audioCtx.destination);

// Configure Band-Pass Filter
bandPassFilter.type = 'bandpass';
bandPassFilter.frequency.value = parseFloat(sweepSlider.value); // Initial sweep frequency
bandPassFilter.Q.value = 1.5; // Initial Q factor

// Connect Filter to Wet Gain
bandPassFilter.connect(wetGain);

// Function to handle audio file upload
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
        sourceNode.connect(bandPassFilter);
      }, function(err) {
        console.error('Error decoding audio data:', err);
      });
    };
    reader.readAsArrayBuffer(file);
  }
});

// Function to handle Play/Pause
let isPlaying = false;
playButton.addEventListener('click', function() {
  if (!sourceNode) return;

  if (!isPlaying) {
    // Resume AudioContext if suspended
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    sourceNode.start(0);
    isPlaying = true;
    playButton.textContent = 'Pause';
  } else {
    sourceNode.stop();
    isPlaying = false;
    playButton.textContent = 'Play';
  }
});

// Function to update Sweep Range
sweepSlider.addEventListener('input', function() {
  const sweepFreq = parseFloat(this.value);
  sweepValue.textContent = `${sweepFreq} Hz`;
  bandPassFilter.frequency.setTargetAtTime(sweepFreq, audioCtx.currentTime, 0.01);
});

// Function to update Intensity
intensitySlider.addEventListener('input', function() {
  const intensity = parseFloat(this.value);
  intensityValue.textContent = intensity;
  
  // Map intensity to Q factor (higher intensity -> higher Q)
  const Q = 1.5 + (intensity / 10) * 9.5; // Q ranges from 1.5 to 11
  bandPassFilter.Q.setTargetAtTime(Q, audioCtx.currentTime, 0.01);
});

// Function to update Mix Level
mixSlider.addEventListener('input', function() {
  const mix = parseInt(this.value);
  mixValue.textContent = `${mix}%`;
  
  const wet = mix / 100;
  const dry = 1 - wet;
  
  dryGain.gain.setTargetAtTime(dry, audioCtx.currentTime, 0.01);
  wetGain.gain.setTargetAtTime(wet, audioCtx.currentTime, 0.01);
});

// Initialize default display values
sweepValue.textContent = `${sweepSlider.value} Hz`;
intensityValue.textContent = intensitySlider.value;
mixValue.textContent = `${mixSlider.value}%`;

// Optional: Automate sweep (sweep back and forth)
let sweepDirection = 1; // 1 for increasing, -1 for decreasing
const sweepMin = 500;
const sweepMax = 5000;
const sweepSpeed = 0.5; // Hz per second

function automateSweep() {
  const currentFreq = bandPassFilter.frequency.value;
  let newFreq = currentFreq + sweepDirection * sweepSpeed;
  
  if (newFreq >= sweepMax) {
    newFreq = sweepMax;
    sweepDirection = -1;
  } else if (newFreq <= sweepMin) {
    newFreq = sweepMin;
    sweepDirection = 1;
  }
  
  bandPassFilter.frequency.setValueAtTime(newFreq, audioCtx.currentTime);
  sweepSlider.value = newFreq;
  sweepValue.textContent = `${Math.round(newFreq)} Hz`;
  
  requestAnimationFrame(automateSweep);
}

// Uncomment the line below to enable automatic sweep
// automateSweep();

