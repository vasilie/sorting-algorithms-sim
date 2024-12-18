import { generateArrayOfNumbers, shuffleArray } from "./helpers/array";
import { createCanvas } from "./canvas";
import { STATE_PAUSED, STATE_PLAYING } from "./helpers/consts";
import { playSound } from "./sound";
const { canvas, ctx } = createCanvas();
const LINE_COLOR = "#388B80";
const PIVOT_COLOR = "#FFDE4D";
const SWAP_COLOR = "#00DE4D";

const HEIGHT_SCALE = 0.3;
const WIDTH_SCALE = 5;
const SPEED = 1;

let tick = 0;
const steps = [];
const swaps = [];
const pivots = []
let currentPivot;
let animationState = STATE_PAUSED;
let lastFreqPlayed = 0;

const valuesArray = generateArrayOfNumbers(289);
let shuffledArray = [...shuffleArray(valuesArray)];
steps.push([...shuffledArray]);
console.log("sr before sort", shuffledArray);
quickSort(shuffledArray, 0, shuffledArray.length - 1);

console.log("sr", shuffledArray);

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (animationState === STATE_PLAYING) {
    tick++;
  }

  replayStep();
}


function recordStep(arr, pivotIndex, type) {
  if (!areArraysEqual(steps[steps.length-1], [...arr] )) {
    if (type === "swap") {
      swaps.push({pivotIndex, value: currentPivot});
    } else {
      steps.push([...arr]);
      pivots.push({pivotIndex, value: currentPivot});
    }
  }
  console.log(steps);
}

function replayStep() {
  const currentStepIndex = Math.floor(tick / SPEED);
  const currentStep = steps[currentStepIndex] || steps[steps.length - 1];
  
  if (currentStep) {
    for (let i = 1; i < currentStep.length - 1; i++) {
      ctx.fillStyle = LINE_COLOR;
      ctx.fillRect( WIDTH_SCALE * i, -20 + canvas.height - currentStep[i] * HEIGHT_SCALE, 3, currentStep[i] * HEIGHT_SCALE + 4);
    }

    ctx.fillStyle = PIVOT_COLOR;
    const { pivotIndex, value } = pivots[currentStepIndex] || {};

    let newFreq = 130 + pivotIndex * 1.1;
    if (lastFreqPlayed !== newFreq){
      playSound(newFreq, 0.26, 0.1 );
      lastFreqPlayed = newFreq;
    }
    const pivotX = WIDTH_SCALE * pivotIndex;
    const pivotY =  -20 + canvas.height - value * HEIGHT_SCALE;
    const pivotYTriangle = -20 + canvas.height;
    ctx.fillRect(pivotX , pivotY, 3, value * HEIGHT_SCALE + 4);
    drawTriangle([pivotX + 2, 8 + pivotYTriangle], PIVOT_COLOR);

    ctx.fillStyle = SWAP_COLOR;
    const { pivotIndex: swapIndex, value: swapValue } = swaps[currentStepIndex] || {};
    const x =  WIDTH_SCALE * swapIndex;
    const y =  -20 + canvas.height - swapValue * HEIGHT_SCALE;
    ctx.fillRect(x, y, 3, swapValue * HEIGHT_SCALE + 4);
  }
}

function start() {
  animationState = STATE_PLAYING;
  console.log("STARTTT");
}

function pause() {
  animationState = STATE_PAUSED;
  console.log("STARTTT");
}

function reset() {
  animationState = STATE_PAUSED;
  tick = 0;
  console.log("STARTTT");
}

function shuffle() {
  console.log("STARTTT");
  
}
document.getElementById('btnStart').addEventListener('click', () => start());
document.getElementById('btnPause').addEventListener('click', () => pause());
document.getElementById('btnReset').addEventListener('click', () => reset());


function quickSort(arr, startIndex, endIndex) {
  if (startIndex < endIndex) {
    const pivotIndex =  partition(arr, startIndex, endIndex);

    // recordStep(arr, pivotIndex);
    quickSort(arr, startIndex, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, endIndex);
  }
}

function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((value, index) => value === arr2[index]);
}

function partition(arr, startIndex, endIndex) {
  const pivot = arr[endIndex];
  
  let i = startIndex - 1;
  for (let j = startIndex; j < endIndex; j++) {
    if (arr[j] < pivot) {
      i++;
      recordStep(arr, j);
      swap(arr, i, j);
    }
  }

  swap(arr, i + 1, endIndex);
  return i + 1;
}

function swap(arr, i, j){
  let temp = arr[i];
  currentPivot = temp;
  recordStep(arr, currentPivot, "swap");
  arr[i] = arr[j];
  arr[j] = temp;
}

function drawTriangle(point, color) {
  
  ctx.beginPath();

  ctx.fillStyle = color;
  // Move to the first vertex of the triangle
  ctx.moveTo(point[0], point[1]); // Top vertex (x:250, y:50)

  // Draw lines to the other two vertices
  ctx.lineTo(point[0] - 8, point[1] + 8);  // Bottom-left vertex (x:50, y:450)
  ctx.lineTo(point[0] + 8, point[1] + 8);  // Bottom-left vertex (x:50, y:450)

  // Close the path back to the starting point
  ctx.closePath();
  ctx.fill(); 
}

function gameLoop() {
  update(); 

  requestAnimationFrame(gameLoop); 
}
requestAnimationFrame(gameLoop);
