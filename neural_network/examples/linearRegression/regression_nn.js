/**
 * Nearly the same as in regression.js but with 'real' NN
 * Inspired by https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#0
 *
 * One input, one dense layer with one node, one output -> looks like a perceptron (linear equation -> write it down!)
 * If no activation is given in the layer, then there is no activation (or linear if you want)
 * With activation function you will get some kind of non-linearity but I'm not sure if this has something to do with the non-linearity that needed to be added when bulding a multilayer perceptron
 *
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

// const learningRate = 0.05; // adam, relu, 32 units
const learningRate = 0.5; // no activation
// const learningRate = 10; // sigmoid
let model;

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
 * Called once at the beginning
 * Initializes the model/network and attaches event listeners
 */
function setup() {
  // tf.setBackend('cpu'); // to be checked

  // Network
  model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [1],
      units: 1,
      useBias: true,
      kernelInitializer: 'randomNormal',
      activation: 'relu',
    })
  );

  // model.add(
  //   tf.layers.dense({
  //     units: 1,
  //     useBias: true,
  //     kernelInitializer: 'randomNormal',
  //     activation: 'relu',
  //   })
  // );

  const optimizer = tf.train.adam(learningRate);
  model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError',
    metrics: ['accuracy'],
  });

  tfvis.show.modelSummary({ name: 'Model Summary', tab: 'Model' }, model);

  // Eventlisteners
  document.addEventListener('mouseup', mousePressed);
  document.addEventListener('keyup', async (event) => {
    if (event.code === 'Space') {
      await train();
      console.log('training finished');
      clearInterval(ID);
      drawEstimates();
    }
  });
}

async function train() {
  const xs = tf.tensor1d(xInputs);
  const ys = tf.tensor1d(yInputs);

  const BATCH_SIZE = 8;
  const metrics = ['loss'];
  const container = {
    name: 'Model Training',
    tab: 'Training',
  };

  const fitCallback = tfvis.show.fitCallbacks(container, metrics);
  return model.fit(xs, ys, {
    batchSize: BATCH_SIZE,
    epochs: 50,
    shuffle: true,
    callbacks: fitCallback,
  });
}

/**
 * Called repeatedly
 */
function draw() {
  clearCanvas();

  // Draw Inputs
  for (let i = 0; i < xInputs.length; i++) {
    let px = Utils.map(xInputs[i], 0, 1, 0, width);
    let py = Utils.map(yInputs[i], 0, 1, height, 0);
    Utils.drawCircle(context, px, py, 5, 5);
  }
}

function drawEstimates() {
  const MAX = 100;
  const x_data = [];
  let y_data = [];

  for (let i = 0; i < MAX; i++) {
    x_data[i] = i / MAX;
    y_data[i] = 0;
  }

  const x = tf.tensor1d(x_data);
  y_data = model.predict(x).dataSync();

  for (let i = 0; i < MAX; i++) {
    let px = Utils.map(x_data[i], 0, 1, 0, width);
    let py = Utils.map(y_data[i], 0, 1, height, 0);

    Utils.drawCircle(context, px, py, 2, 2, undefined, 'blue');
  }

  console.log(x_data);
  console.log(y_data);
}

// Kick off
window.onload = () => {
  setup();
  ID = setInterval(draw, drawTimeout_ms);
  //draw();
};
