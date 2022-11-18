import Utils from '../../../Utils.js';
import NeuralNetwork from '../../lib/NeuralNetwork.js';

const learningRate = 0.05;
const max_iterations = 10000;

const canvas = document.getElementById('canvas');
const width = (canvas.width = 400);
const height = (canvas.height = 400);
const context = canvas.getContext('2d');

let ID;

let nn = new NeuralNetwork(2, 2, 1);
nn.setLearningRate(learningRate);

const drawTimeout_ms = 0;

// Yes, a counter not a bird :)
let count = 0;

// Training data
let training_data = [
  {
    input: [0, 0],
    target: [0],
  },
  {
    input: [1, 0],
    target: [1],
  },
  {
    input: [0, 1],
    target: [1],
  },
  {
    input: [1, 1],
    target: [0],
  },
];

/**
 * Called once at the beginning
 */
function setup() {}

/**
 * Called repeatedly
 */
let grid = 10;
let nCols = width / grid;
let nRows = height / grid;

function draw() {
  context.fillStyle = 'WhiteSmoke';
  context.fillRect(0, 0, width, height);

  // Train multiple times per draw iteration
  for (let i = 0; i < 50; i++) {
    let data_idx = Math.floor(Utils.getRandomArbitrary(0, 3) + 0.5);
    nn.train(training_data[data_idx].input, training_data[data_idx].target);
  }

  for (let col_idx = 0; col_idx < nCols; col_idx++) {
    for (let row_idx = 0; row_idx < nRows; row_idx++) {
      let x1 = col_idx / nCols;
      let x2 = row_idx / nRows;
      let input = [x1, x2];
      let y = nn.predict(input);
      let color = y * 255;
      context.fillStyle = `rgb(${color},${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }

  if (count % 100 == 0) {
    console.log(count, nn.predict([0, 0]), nn.predict([1, 0]), nn.predict([0, 1]), nn.predict([1, 1]));
  }

  // Simply stop
  if (count >= max_iterations) {
    clearInterval(ID);
  }

  count++;
}

// Kick off
setup();
ID = setInterval(draw, drawTimeout_ms);
