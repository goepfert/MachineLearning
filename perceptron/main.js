import Perceptron from './Perceptron.js';
import Utils from '../Utils.js';

// Most important things to play with
const learningRate = 0.001;
const drawTimeout_ms = 20;

const canvas = document.getElementById('canvas');
const width = (canvas.width = 400);
const height = (canvas.height = 400);
const context = canvas.getContext('2d');
const errorText = document.getElementById('error');
let ID;

let perceptron;
const n_trainingSamples = 2000;
const trainingSamples = [];

// We will train the perceptron with one sample object at a time
let count = 0;

// Coordinate space
const xmin = -1;
const ymin = -1;
const xmax = 1;
const ymax = 1;

/**
 *  The function to describe a line
 */
function f(x) {
  let y = 0.2 * x + 0.4;
  return y;
}

/**
 * Some transformation for mapping coordinate space into canvas
 */
function transformX(x) {
  return Utils.map(x, xmin, xmax, 0, width);
}

function transformY(y) {
  return Utils.map(y, ymin, ymax, height, 0);
}

/**
 * Called once at the beginning
 */
function setup() {
  // The perceptron has 3 inputs -- x, y, and bias
  // Learning Constant is low just b/c it's fun to watch, this is not necessarily optimal
  perceptron = new Perceptron(3, learningRate);

  // Create a random set of training points and calculate the "known" answer based on given function
  for (let i = 0; i < n_trainingSamples; i++) {
    let x = Utils.getRandomArbitrary(xmin, xmax);
    let y = Utils.getRandomArbitrary(ymin, ymax);
    let answer = 1;
    if (y < f(x)) answer = -1;
    trainingSamples[i] = {
      input: [x, y, 1],
      output: answer,
    };
  }
}

/**
 * Called repeatedly
 */
function draw() {
  context.fillStyle = 'WhiteSmoke';
  context.fillRect(0, 0, width, height);

  // Draw coordinate system
  // Utils.drawLine(context, transformX(0), transformY(0), transformX(1), transformY(0), 1, 'black');
  // Utils.drawLine(context, transformX(0), transformY(0), transformX(0), transformY(1), 1, 'black');
  // Utils.drawLine(context, transformX(0), transformY(0), transformX(-1), transformY(0), 1, 'black');
  // Utils.drawLine(context, transformX(0), transformY(0), transformX(0), transformY(-1), 1, 'black');

  // Draw function
  Utils.drawLine(context, transformX(xmin), transformY(f(xmin)), transformX(xmax), transformY(f(xmax)), 2, 'black');

  // Draw the line based on the current weights
  // Formula is weights[0]*x + weights[1]*y + weights[2] = 0
  let weights = perceptron.getWeights();
  let y1 = (-weights[2] - weights[0] * xmin) / weights[1];
  let y2 = (-weights[2] - weights[0] * xmax) / weights[1];
  Utils.drawLine(context, transformX(xmin), transformY(y1), transformX(xmax), transformY(y2), 3, 'blue');

  // Train the Perceptron with one "training" point at a time
  perceptron.train(trainingSamples[count].input, trainingSamples[count].output);
  count = (count + 1) % trainingSamples.length;

  // Draw all the points based on what the Perceptron would predict
  for (let i = 0; i < count; i++) {
    let prediction = perceptron.feedForward(trainingSamples[i].input);
    let style = 'red';
    if (prediction > 0) {
      //if (trainingSamples[i].output > 0) {
      style = 'green';
    }

    let x = Utils.map(trainingSamples[i].input[0], xmin, xmax, 0, width);
    let y = Utils.map(trainingSamples[i].input[1], ymin, ymax, height, 0);
    Utils.drawCircle(context, x, y, 3, 3, style, style);
  }

  errorText.textContent = perceptron.getError();

  // Simply stop
  if (count >= n_trainingSamples - 1) {
    clearInterval(ID);
  }
}

// Kick off
setup();
ID = setInterval(draw, drawTimeout_ms);
