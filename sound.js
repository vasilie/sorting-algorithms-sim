const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let isDistortionActive = false;
let oscillator = null;
let distortion = null;

export function playSound(frequency, duration, gainValue) {
  if (!frequency) return;

  // Create nodes
  oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  distortion = audioContext.createWaveShaper();

  // Configure distortion
  distortion.curve = makeDistortionCurve(400);
  distortion.oversample = "4x";

  // Set oscillator properties
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  // Configure filter
  filter.type = "highpass";
  filter.frequency.value = 0;

  // Configure gain
  gainNode.gain.setValueAtTime(Math.max(gainValue, 0.0001), audioContext.currentTime); // Start at full gain
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  // Connect nodes based on distortion state
  if (isDistortionActive) {
    oscillator.connect(distortion);
    distortion.connect(filter);
  } else {
    oscillator.connect(filter);
  }

  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Play sound
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 400;
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function toggleDistortion() {
  isDistortionActive = !isDistortionActive;
  console.log(`Distortion is now ${isDistortionActive ? "enabled" : "disabled"}`);
}

document.getElementById("distortion")?.addEventListener("click", toggleDistortion);
