import Utils from '../../../Utils.js';
import { Filters } from './Filters.js';

// Griswolds image size
// const width = (canvas.width = 1280 / 2);
// const height = (canvas.height = 720 / 2);

// TODO: Size should come from image
const canvas = document.getElementById('canvas');
const width = (canvas.width = 480);
const height = (canvas.height = 480);
const context = canvas.getContext('2d');

const grid = 1;
const nCols = width / grid;
const nRows = height / grid;

const canvas_filter_1 = document.getElementById('canvas_filter_1');
canvas_filter_1s_output.width = canvas.width;
canvas_filter_1.height = canvas.height;
const context_filter_1 = canvas_filter_1.getContext('2d');

let image = new Image();
// image.src = 'images/griswolds.jpg';
image.src = 'images/pattern_1.png';
// image_org.src = 'images/pattern_2.png';

let image_org = [];

function setup() {
  // Maybe another dropdown
  // image_org.src = 'images/griswolds.jpg';
  image.src = 'images/pattern_1.png';
  // image_org.src = 'images/pattern_2.png';

  image_org = [];

  clearCanvas();
}

function clearCanvas() {
  context.fillStyle = 'White';
  context.fillRect(0, 0, width, height);

  context_filter_1.fillStyle = context.fillStyle;
  context_filter_1.fillRect(0, 0, width, height);
}

function draw() {
  context.drawImage(image_org, 0, 0, width, height);

  // Draw original image, Convert to grayscale array and draw again
  const imageData = context.getImageData(0, 0, width, height);
  const data = Array.from(imageData.data);

  for (let pos = 0; pos < data.length; ) {
    let color = (data[pos++] + data[pos++] + data[pos++]) / 3;
    pos++;
    image_org.push(color);
  }

  clearCanvas();

  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = image_org[col_idx + row_idx * nCols];
      //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }
}

function drawConvImage(image, context, padding, filter) {
  let kernel;

  if (typeof Filters[filter] == 'function') {
    kernel = Filters[filter]();
  } else {
    kernel = Filters[filter];
  }

  // Eieiei, I'm so proud of myself :(
  let min = 255;
  let max = -255;
  for (let row_idx = padding; row_idx < nRows - padding; row_idx++) {
    for (let col_idx = padding; col_idx < nCols - padding; col_idx++) {
      let color = convolve(image, col_idx, row_idx, kernel);

      if (color < min) {
        min = color;
      }
      if (color > max) {
        max = color;
      }
    }
  }

  for (let row_idx = padding; row_idx < nRows - padding; row_idx++) {
    for (let col_idx = padding; col_idx < nCols - padding; col_idx++) {
      let color = convolve(image, col_idx, row_idx, kernel);
      if (filter != 'sharpening' && filter != 'ridge') {
        color = Math.floor(Utils.map(color, min, max, 0, 255));
      }
      color = Math.floor(Utils.constrain(color, 0, 255));
      // console.log(col_idx, row_idx, color);
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }
}

function convolve(image, col_idx, row_idx, filter) {
  let filtered_color = 0;
  for (let f_row_idx = -1; f_row_idx <= 1; f_row_idx++) {
    for (let f_col_idx = -1; f_col_idx <= 1; f_col_idx++) {
      let pixel_x = col_idx + f_col_idx;
      let pixel_y = row_idx + f_row_idx;
      let index = pixel_x + pixel_y * nCols;
      filtered_color += filter[f_row_idx + 1][f_col_idx + 1] * image[index];
    }
  }
  return filtered_color;
}

// Dropdown
const div = document.querySelector('.options');
for (const filter in Filters) {
  const div_element = document.createElement('div');
  div_element.innerHTML = filter;
  div_element.onclick = () => {
    show(filter);
    drawConvImage(image, filter);
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

window.onload = () => {
  setup();
  draw();
};
