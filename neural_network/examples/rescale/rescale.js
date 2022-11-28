import Utils from '../../../Utils.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 256);
const height = (canvas.height = 256);
const context = canvas.getContext('2d');

const grid = 1;
const nCols = width / grid;
const nRows = height / grid;

let imageData;

function draw() {
  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = 255;
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }

  Utils.drawLine(context, 0, 0, 256, 256, 2);
  Utils.drawLine(context, 0, 256, 256, 0, 2);
  Utils.drawCircle(context, 50, 50, 100);

  resample_single(canvas, 28, 28, false);
}

draw();

/**
 * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
 *
 * @param {HtmlElement} canvas
 * @param {int} width
 * @param {int} height
 * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
 */
function resample_single(canvas, width, height, resize_canvas) {
  let width_source = canvas.width;
  let height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);

  let ratio_w = width_source / width;
  let ratio_h = height_source / height;
  let ratio_w_half = Math.ceil(ratio_w / 2);
  let ratio_h_half = Math.ceil(ratio_h / 2);

  let ctx = canvas.getContext('2d');
  let img = ctx.getImageData(0, 0, width_source, height_source);
  let img2 = ctx.createImageData(width, height);
  let data = img.data;
  let data2 = img2.data;

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      let x2 = (i + j * width) * 4;
      let weight = 0;
      let weights = 0;
      let weights_alpha = 0;
      let gx_r = 0;
      let gx_g = 0;
      let gx_b = 0;
      let gx_a = 0;
      let center_y = (j + 0.5) * ratio_h;
      let yy_start = Math.floor(j * ratio_h);
      let yy_stop = Math.ceil((j + 1) * ratio_h);
      for (let yy = yy_start; yy < yy_stop; yy++) {
        let dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
        let center_x = (i + 0.5) * ratio_w;
        let w0 = dy * dy; //pre-calc part of w
        let xx_start = Math.floor(i * ratio_w);
        let xx_stop = Math.ceil((i + 1) * ratio_w);
        for (let xx = xx_start; xx < xx_stop; xx++) {
          let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
          let w = Math.sqrt(w0 + dx * dx);
          if (w >= 1) {
            //pixel too far
            continue;
          }
          //hermite filter
          weight = 2 * w * w * w - 3 * w * w + 1;
          let pos_x = 4 * (xx + yy * width_source);
          //alpha
          gx_a += weight * data[pos_x + 3];
          weights_alpha += weight;
          //colors
          if (data[pos_x + 3] < 255) weight = (weight * data[pos_x + 3]) / 250;
          gx_r += weight * data[pos_x];
          gx_g += weight * data[pos_x + 1];
          gx_b += weight * data[pos_x + 2];
          weights += weight;
        }
      }
      data2[x2] = gx_r / weights;
      data2[x2 + 1] = gx_g / weights;
      data2[x2 + 2] = gx_b / weights;
      data2[x2 + 3] = gx_a / weights_alpha;
    }
  }
  //clear and resize canvas
  if (resize_canvas === true) {
    canvas.width = width;
    canvas.height = height;
  } else {
    // ctx.clearRect(0, 0, width_source, height_source);
  }

  //draw
  ctx.putImageData(img2, 0, 0);
}

// https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly/19262385#19262385
