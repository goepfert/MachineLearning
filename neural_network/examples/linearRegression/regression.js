/**
 * Uses the Core minimizer to optimize the variables of a straight line to match the input data
 * There is no neural net involved!!!
 *
 * Check also the superclean.js example (better check before this one)
 * More extensive example using a real NN -> regression?nn.js
 */

import Utils from '../../../Utils.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 400);
const height = (canvas.height = 400);
const context = canvas.getContext('2d');

let ID;
const drawTimeout_ms = 0;

let coord = { x: 0, y: 0 };
let xInputs = [];
let yInputs = [];

// Slope and Offset
// Later declared as variable for tensorflow
let m;
let n;

const learningRate = 0.05;
const max_iterations = 10000;
let count = 0;
const optimizer = tf.train.sgd(learningRate);

function clearCanvas() {
  context.fillStyle = 'WhiteSmoke';
  context.fillRect(0, 0, width, height);
}

function reposition(event) {
  coord.x = event.clientX - canvas.offsetLeft;
  coord.y = event.clientY - canvas.offsetTop;
}

/**
 * Add coordinates of mouse click into array
 */
function mousePressed(event) {
  reposition(event);
  let x = Utils.map(coord.x, 0, width, 0, 1);
  let y = Utils.map(coord.y, 0, height, 1, 0);

  // console.log(coord);
  console.log('mouse pressed on coordinates: ', x, y);

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return;
  }

  xInputs.push(x);
  yInputs.push(y);
}

/**
 * Defines the loss function to be minimized
 * Usually it's the mean squared function 1/N x Sum( (Prediction - Measurement )^2 )
 */
function loss(prediction, measurement) {
  return prediction.sub(measurement).square().mean();
}

/**
 * Returns the prediction of some given values/coordinates based on a theory
 * And this theory is here in this example a linear dependency based on two parameters
 */
function predict(x) {
  const xs = tf.tensor(x);
  // y = mx + n;
  const ys = xs.mul(m).add(n);
  return ys;
}

function predictSingle(x) {
  const xs = tf.scalar(x);
  // y = mx + n;
  const ys = xs.mul(m).add(n);
  return ys;
}

/**
 * Called once at the beginning
 */
function setup() {
  m = tf.variable(tf.scalar(Math.random())); // Make them mutable
  n = tf.variable(tf.scalar(Math.random()));

  clearCanvas();

  document.addEventListener('mouseup', mousePressed);
}

/**
 * Called repeatedly
 */
function draw() {
  // Use minimizer to fit line to data
  tf.tidy(() => {
    if (xInputs.length > 0) {
      const ys = tf.tensor1d(yInputs);
      optimizer.minimize(() => loss(predict(xInputs), ys));
    }
  });

  clearCanvas();

  // Draw Inputs
  for (let i = 0; i < xInputs.length; i++) {
    let px = Utils.map(xInputs[i], 0, 1, 0, width);
    let py = Utils.map(yInputs[i], 0, 1, height, 0);

    Utils.drawCircle(context, px, py, 5, 5);
  }

  // Draw estimate
  const lineX = [0, 1];
  const lineY = [0, 0];

  // Convert to array or use predictSingle that users tf.scalars
  let line_x1 = [lineX[0]];
  let line_x2 = [lineX[1]];
  lineY[0] = tf.tidy(() => predict(line_x1).dataSync());
  lineY[1] = tf.tidy(() => predict(line_x2).dataSync());

  let x1 = Utils.map(lineX[0], 0, 1, 0, width);
  let x2 = Utils.map(lineX[1], 0, 1, 0, width);
  let y1 = Utils.map(lineY[0], 0, 1, height, 0);
  let y2 = Utils.map(lineY[1], 0, 1, height, 0);

  Utils.drawLine(context, x1, y1, x2, y2);

  // Simply stop
  if (count++ >= max_iterations) {
    // clearInterval(ID);
  }
}

// Kick off
window.onload = () => {
  setup();
  ID = setInterval(draw, drawTimeout_ms);
  //draw();
};
