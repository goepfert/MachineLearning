import Utils from '../../../Utils.js';
import NeuralNetwork from '../../lib/NeuralNetwork.js';
import { createTrainingData } from './TrainingData.js';
import { Dataset } from './Dataset.js';

const learningRate = 0.05;
const max_iterations = 3000;
const iterations_per_draw_cycle = 1000;

const canvas = document.getElementById('canvas');
const width = (canvas.width = 400);
const height = (canvas.height = 400);
const context = canvas.getContext('2d');

const train_btn = document.getElementById('train_btn');
train_btn.addEventListener('click', () => {
  if (training_data != undefined) {
    ID = setInterval(draw, drawTimeout_ms);
  }
});

const hue_blue = 240;
const hue_yellow = 60;

let ID;

let nn = new NeuralNetwork(2, 64, 1);
nn.setLearningRate(learningRate);

const drawTimeout_ms = 0;

// Yes, a counter not a bird :)
let count = 0;

let training_data;
let training_data_length;

var loss_div = document.getElementById('loss_div');
let loss_data = [[0, 0]];
let data_counter = 0;
let loss_graph = new Dygraph(loss_div, loss_data, {
  drawPoints: true,
  rollPeriod: 10,
  showRoller: true,
  //valueRange: [-1.0, 1.0]
});

function drawTrainingData() {
  for (let idx = 0; idx < training_data_length; idx++) {
    let x1 = training_data[idx].input[0];
    let x2 = training_data[idx].input[1];
    let target = training_data[idx].target[0];

    let h = 0;
    let s = 60;
    let l = 50;

    if (target > 0.5) {
      h = hue_blue;
    } else {
      h = hue_yellow;
    }
    Utils.drawCircle(context, x1 * width, x2 * height, 10, 1, `hsl(${h},${s}%,${l}%)`, 'black');
  }
}

function clearCanvas() {
  context.fillStyle = 'WhiteSmoke';
  context.fillRect(0, 0, width, height);
}

/**
 * Called once at the beginning
 */
function setup() {
  clearCanvas();
}

/**
 * Called repeatedly
 */
const grid = 5;
const nCols = width / grid;
const nRows = height / grid;

function draw() {
  if (training_data == undefined) {
    console.log('bla');
    return;
  }

  clearCanvas();

  // Train multiple times per draw iteration
  let loss = 0;
  for (let i = 0; i < iterations_per_draw_cycle; i++) {
    const data_idx = Math.floor(Utils.getRandomArbitrary(0, training_data_length - 1) + 0.5);
    const input = training_data[data_idx].input;
    const target = training_data[data_idx].target;

    nn.train(input, target);

    const output = nn.predict(input);
    const output_error = target[0] - output;
    loss += 0.5 * output_error * output_error;
  }
  loss /= iterations_per_draw_cycle;
  loss_data.push([data_counter++, loss]);
  loss_graph.updateOptions({ file: loss_data });

  // https://www.w3schools.com/colors/colors_hsl.asp
  let h = 0;
  const s = 60;
  let l = 0;

  for (let col_idx = 0; col_idx < nCols; col_idx++) {
    for (let row_idx = 0; row_idx < nRows; row_idx++) {
      const x1 = col_idx / nCols;
      const x2 = row_idx / nRows;
      const input = [x1, x2];
      const y = nn.predict(input);
      if (y > 0.5) {
        h = hue_blue;
        l = Math.floor(Utils.map(y, 0.5, 1, 100, 50));
      } else {
        h = hue_yellow;
        l = Math.floor(Utils.map(y, 0, 0.5, 50, 100));
      }
      context.fillStyle = `hsl(${h},${s}%,${l}%)`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }

  drawTrainingData();

  if (count % 100 == 0) {
    //console.log(count, nn.predict([0, 0]), nn.predict([1, 0]), nn.predict([0, 1]), nn.predict([1, 1]));
  }

  // Simply stop
  if (count >= max_iterations) {
    clearInterval(ID);
  }

  count++;
}

// Kick off
setup();

// Dropdown
const div = document.querySelector('.options');
for (const dataset in Dataset) {
  const div_element = document.createElement('div');
  div_element.innerHTML = dataset;
  div_element.onclick = () => {
    show(dataset);
    training_data = createTrainingData(Dataset[dataset]);
    training_data_length = training_data.length;
    clearCanvas(canvas);
    drawTrainingData(context);
    //console.log(training_data);
  };
  div.appendChild(div_element);
}

function show(value) {
  document.querySelector('.text-box').value = value;
}

let dropdown = document.querySelector('.dropdown');
dropdown.onclick = function () {
  dropdown.classList.toggle('active');
};
