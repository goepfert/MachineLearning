/**
 * Nearly the same as in regression.js but with 'real' nn
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

let network;

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
 */
function setup() {
  network = tf.sequential();
  network.add(
    tf.layers.dense({
      inputShape: [1],
      units: 1,
      useBias: true,
      // activation: 'sigmoid',
    })
  );

  const optimizer = tf.train.adam(0.05);
  network.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError',
    metrics: ['accuracy'],
  });

  tfvis.show.modelSummary({ name: 'Model Summary', tab: 'Model' }, network);

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

  const BATCH_SIZE = 16;
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training',
    tab: 'Model',
    styles: { height: '1000px' },
  };
  const onEpochEnd = tfvis.show.fitCallbacks(container, metrics);

  return network.fit(xs, ys, {
    batchSize: BATCH_SIZE,
    epochs: 50,
    shuffle: true,
    callbacks: onEpochEnd,
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
  y_data = network.predict(x).dataSync();

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
