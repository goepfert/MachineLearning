import Utils from '../../../Utils.js';
import { Filters } from './Filters.js';
import { PixelImage } from './PixelImage.js';

// Griswolds image size
// const width = (canvas.width = 1280 / 2);
// const height = (canvas.height = 720 / 2);

// TODO: Size should come from image
const canvas = document.getElementById('canvas');
const width = (canvas.width = 480);
const height = (canvas.height = 480);
const context = canvas.getContext('2d');
const nCols = width;
const nRows = height;

const canvas_filter_1 = document.getElementById('canvas_filter_1');
canvas_filter_1.width = width;
canvas_filter_1.height = height;
const context_filter_1 = canvas_filter_1.getContext('2d');

// poolsize = ps
// ps x ps pooling, stride ps
const ps = 6;
const canvas_pooling_1 = document.getElementById('canvas_pooling_1');
canvas_pooling_1.width = width;
canvas_pooling_1.height = height;
const context_pooing_1 = canvas_pooling_1.getContext('2d');

const canvasArray = [canvas, canvas_filter_1, canvas_pooling_1];

// -- IMAGE ----------------------------------------------------

let image;
let pixelimage_org;

function clearCanvas(_canvas) {
  const _context = _canvas.getContext('2d');
  _context.fillStyle = 'White';
  _context.fillRect(0, 0, _canvas.width, _canvas.height);
}

function clearAllCanvas() {
  canvasArray.map((canvas) => {
    clearCanvas(canvas);
  });
}

function setup() {
  // Maybe another dropdown
  image = new Image();
  // image.src = 'images/griswolds.jpg';
  image.src = 'images/pattern_1.png';
  //image.src = 'images/pattern_2.png';

  clearAllCanvas();
}

// Draw original image, Convert to grayscale array and draw again
function draw() {
  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const data = Array.from(imageData.data);

  let pixeldata = [];
  for (let pos = 0; pos < data.length; ) {
    let color = (data[pos++] + data[pos++] + data[pos++]) / 3;
    pos++;
    pixeldata.push(color);
  }

  let _pixelimage_org = new PixelImage(pixeldata, nCols, nRows);

  clearCanvas(canvas);

  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = _pixelimage_org.data[col_idx + row_idx * nCols];
      //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx, row_idx, 1, 1);
    }
  }

  return _pixelimage_org;
}

function drawConvImage(_pixelimage, _context, filter) {
  const nRows = _pixelimage.nRows;
  const nCols = _pixelimage.nCols;
  let kernel;

  if (typeof Filters[filter] == 'function') {
    kernel = Filters[filter]();
  } else {
    kernel = Filters[filter];
  }

  // Eieiei, I'm so proud of myself :(
  let min = 255;
  let max = -255;
  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = convolve(_pixelimage, col_idx, row_idx, kernel);

      if (color < min) {
        min = color;
      }
      if (color > max) {
        max = color;
      }
    }
  }

  let pixeldata = [];

  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = convolve(_pixelimage, col_idx, row_idx, kernel);
      if (filter != 'sharpening' && filter != 'ridge') {
        color = Math.floor(Utils.map(color, min, max, 0, 255));
      }
      color = Math.floor(Utils.constrain(color, 0, 255));
      // console.log(col_idx, row_idx, color);

      pixeldata.push(color);

      _context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      _context.fillRect(col_idx, row_idx, 1, 1);
    }
  }

  return new PixelImage(pixeldata, nCols, nRows);
}

// same padding
function convolve(_pixelimage, col_idx, row_idx, filter) {
  const nRows = _pixelimage.nRows;
  const nCols = _pixelimage.nCols;
  const imageData = _pixelimage.data;

  let filtered_color = 0;
  for (let f_row_idx = -1; f_row_idx <= 1; f_row_idx++) {
    for (let f_col_idx = -1; f_col_idx <= 1; f_col_idx++) {
      let pixel_y = col_idx + f_col_idx;
      let pixel_x = row_idx + f_row_idx;

      let color_pixel;
      if (pixel_x < 0 || pixel_x >= nRows || pixel_y < 0 || pixel_y >= nCols) {
        color_pixel = 0;
      } else {
        const index = pixel_y + pixel_x * nCols;
        color_pixel = imageData[index];
      }
      filtered_color += filter[f_row_idx + 1][f_col_idx + 1] * color_pixel;
    }
  }
  return filtered_color;
}

function maxpooling(_pixelimage, _context) {
  const nRows = _pixelimage.nRows;
  const nCols = _pixelimage.nCols;
  const imageData = _pixelimage.data;

  let pixeldata = [];

  for (let row_idx = 0; row_idx < nRows; ) {
    for (let col_idx = 0; col_idx < nCols; ) {
      let max = -1000;
      for (let y_idx = row_idx; y_idx < row_idx + ps; y_idx++) {
        for (let x_idx = col_idx; x_idx < col_idx + ps; x_idx++) {
          const index = x_idx + y_idx * nCols;
          if (imageData[index] > max) {
            max = imageData[index];
          }
        }
      }
      pixeldata.push(max);
      col_idx = col_idx + ps;
    }
    row_idx = row_idx + ps;
  }

  for (let row_idx = 0; row_idx < nRows / ps; row_idx++) {
    for (let col_idx = 0; col_idx < nCols / ps; col_idx++) {
      let color = pixeldata[col_idx + (row_idx * nCols) / ps];
      _context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      _context.fillRect(col_idx * ps, row_idx * ps, ps, ps);
    }
  }
}

// Dropdown
const div = document.querySelector('.options');
for (const filter in Filters) {
  const div_element = document.createElement('div');
  div_element.innerHTML = filter;
  div_element.onclick = () => {
    show(filter);
    Utils.assert(pixelimage_org != undefined, 'original image not defined');
    let _pixelimage = drawConvImage(pixelimage_org, context_filter_1, filter);
    let _maxpoolimage = maxpooling(_pixelimage, context_pooing_1);
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

window.onload = async () => {
  setup();
  await image.decode();
  pixelimage_org = draw();
};
