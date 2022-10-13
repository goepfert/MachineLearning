import Perceptron from './Perceptron.js';
import Utils from '../Utils.js';

const canvas = document.getElementById('canvas');
canvas.width = 400;
canvas.height = 400;
const context = canvas.getContext('2d');

let perceptron;
const N_TRAING_SAMPLES = 1000;
const trainingSamples = [];

// We will train the perceptron with one "Point" object at a time
let count = 0;

// Coordinate space
let xmin = -1;
let ymin = -1;
let xmax = 1;
let ymax = 1;

// The function to describe a line
function f(x) {
  let y = 0.3 * x + 0.4;
  return y;
}

function setup() {
  // The perceptron has 3 inputs -- x, y, and bias
  // Learning Constant is low just b/c it's fun to watch, this is not necessarily optimal
  perceptron = new Perceptron(3, 0.001);

  // Create a random set of training points and calculate the "known" answer based on given function
  for (let i = 0; i < N_TRAING_SAMPLES; i++) {
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

function draw() {
  context.fillStyle = 'red';
  context.fillRect(0, 0, 100, 50);

  // // Draw the line
  // strokeWeight(1);
  // stroke(255);
  // let x1 = map(xmin, xmin, xmax, 0, width);
  // let y1 = map(f(xmin), ymin, ymax, height, 0);
  // let x2 = map(xmax, xmin, xmax, 0, width);
  // let y2 = map(f(xmax), ymin, ymax, height, 0);
  // line(x1, y1, x2, y2);

  // // Draw the line based on the current weights
  // // Formula is weights[0]*x + weights[1]*y + weights[2] = 0
  // stroke(255);
  // strokeWeight(2);
  // let weights = ptron.getWeights();
  // x1 = xmin;
  // y1 = (-weights[2] - weights[0] * x1) / weights[1];
  // x2 = xmax;
  // y2 = (-weights[2] - weights[0] * x2) / weights[1];

  // x1 = map(x1, xmin, xmax, 0, width);
  // y1 = map(y1, ymin, ymax, height, 0);
  // x2 = map(x2, xmin, xmax, 0, width);
  // y2 = map(y2, ymin, ymax, height, 0);
  // line(x1, y1, x2, y2);

  // // Train the Perceptron with one "training" point at a time
  // ptron.train(training[count].input, training[count].output);
  // count = (count + 1) % training.length;

  // // Draw all the points based on what the Perceptron would "guess"
  // // Does not use the "known" correct answer
  // for (let i = 0; i < count; i++) {
  //   stroke(255);
  //   strokeWeight(1);
  //   fill(255);
  //   let guess = ptron.feedforward(training[i].input);
  //   if (guess > 0) noFill();

  //   let x = map(training[i].input[0], xmin, xmax, 0, width);
  //   let y = map(training[i].input[1], ymin, ymax, height, 0);
  //   ellipse(x, y, 8, 8);
}

setup();
setInterval(draw, 100);
