import Utils from '../../../Utils.js';
import { Cat_image } from './Cat.js';
import { Filters } from './Filters.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 280);
const height = (canvas.height = 280);
const context = canvas.getContext('2d');

const canvas_output = document.getElementById('canvas_output');
canvas_output.width = canvas.width;
canvas_output.height = canvas.height;
const context_output = canvas_output.getContext('2d');

const grid = 10;
const nCols = width / grid; // shall be 28
const nRows = height / grid;

let image = Cat_image;

function clearCanvas() {
  context.fillStyle = 'White';
  context.fillRect(0, 0, width, height);
}

function draw(image) {
  image = image.map((pixel) => {
    return Utils.map(pixel, 0, 255, 255, 0);
  });

  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = image[col_idx + row_idx * nCols];
      //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }
}

function drawConvImage(image, filter) {
  image = image.map((pixel) => {
    return Utils.map(pixel, 0, 255, 255, 0);
  });

  // Eieiei, I'm so proud of myself :(
  let min = 255;
  let max = -255;
  for (let row_idx = 1; row_idx < nRows - 1; row_idx++) {
    for (let col_idx = 1; col_idx < nCols - 1; col_idx++) {
      let color = conv(image, col_idx, row_idx, filter);

      if (color < min) {
        min = color;
      }
      if (color > max) {
        max = color;
      }
    }
  }

  for (let row_idx = 1; row_idx < nRows - 1; row_idx++) {
    for (let col_idx = 1; col_idx < nCols - 1; col_idx++) {
      let color = conv(image, col_idx, row_idx, filter);
      color = Math.floor(Utils.map(color, min, max, 0, 255));
      // console.log(col_idx, row_idx, color);
      context_output.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context_output.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }
}

function conv(image, col_idx, row_idx, filter) {
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
    if (typeof Filters[filter] == 'function') {
      drawConvImage(image, Filters[filter]());
    } else {
      drawConvImage(image, Filters[filter]);
    }
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

clearCanvas();
draw(image);
