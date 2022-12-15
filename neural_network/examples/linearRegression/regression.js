import Utils from '../../../Utils.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 400);
const height = (canvas.height = 400);
const context = canvas.getContext('2d');

let ID;
const drawTimeout_ms = 0;

let coord = { x: 0, y: 0 };
let x_vals = [];
let y_vals = [];

let m;
let n;

const learningRate = 0.5;
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
 * Add coordinats of mouse click into array
 */
function mousePressed(event) {
  reposition(event);
  let x = Utils.map(coord.x, 0, width, 0, 1);
  let y = Utils.map(coord.y, 0, height, 1, 0);

  console.log(coord);
  console.log(x, y);

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return;
  }

  x_vals.push(x);
  y_vals.push(y);
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
  const xs = tf.tensor1d(x);
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
  tf.tidy(() => {
    if (x_vals.length > 0) {
      const ys = tf.tensor1d(y_vals);
      optimizer.minimize(() => loss(predict(x_vals), ys));
    }
  });

  clearCanvas();

  for (let i = 0; i < x_vals.length; i++) {
    let px = Utils.map(x_vals[i], 0, 1, 0, width);
    let py = Utils.map(y_vals[i], 0, 1, height, 0);

    Utils.drawCircle(context, px, py, 5, 5);
  }

  const lineX = [0, 1];

  const ys = tf.tidy(() => predict(lineX));
  let lineY = ys.dataSync();
  ys.dispose();

  let x1 = Utils.map(lineX[0], 0, 1, 0, width);
  let x2 = Utils.map(lineX[1], 0, 1, 0, width);

  let y1 = Utils.map(lineY[0], 0, 1, height, 0);
  let y2 = Utils.map(lineY[1], 0, 1, height, 0);

  Utils.drawLine(context, x1, y1, x2, y2);

  // Simply stop
  if (count >= max_iterations) {
    clearInterval(ID);
  }

  count++;
}

// Kick off
window.onload = () => {
  setup();
  ID = setInterval(draw, drawTimeout_ms);
};
