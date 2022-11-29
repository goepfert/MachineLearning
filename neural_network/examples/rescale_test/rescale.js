import Utils from '../../../Utils.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 280);
const height = (canvas.height = 280);
const context = canvas.getContext('2d');

let grid = 1;
let nCols = width / grid;
let nRows = height / grid;

let imageData;

function draw() {
  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = 255;
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }

  // https://github.com/googlecreativelab/quickdraw-dataset/issues/19#issuecomment-402247262
  const linewidth = 16;

  Utils.drawLine(context, 110, 0, 120, 280, linewidth);
  Utils.drawLine(context, 160, 0, 150, 280, linewidth);
  Utils.drawCircle(context, 140, 140, 110, linewidth);

  // return;

  const scaled_img = resample_single(canvas, 28, 28, false);
  //const scaled_img = resize(canvas, 28, 28);
  let pos = 0;
  grid = 9;
  nCols = 28;
  nRows = 28;

  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = (scaled_img.data[pos++] + scaled_img.data[pos++] + scaled_img.data[pos++]) / 3;
      pos++;
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }
}

draw();

/**
 * https://stackoverflow.com/questions/2303690/resizing-an-image-in-an-html5-canvas
 *
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
    ctx.clearRect(0, 0, width_source, height_source);
  }

  //draw
  ctx.putImageData(img2, 0, 0);

  return img2;
}

// https://github.com/processing/p5.js/blob/00821f33ca1d8a6990364568f0374c4aaf713faa/src/image/p5.Image.js#L516
function resize(canvas, width, height) {
  let width_source = canvas.width;
  let height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);

  let ctx = canvas.getContext('2d');
  let img = ctx.getImageData(0, 0, width_source, height_source);
  let img2 = ctx.createImageData(width, height);
  let src_data = img.data;
  let dst_data = img2.data;

  let pos = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = Math.floor((x * width_source) / width);
      const srcY = Math.floor((y * height_source) / height);
      let srcPos = (srcY * width_source + srcX) * 4;
      dst_data[pos++] = src_data[srcPos++]; // R
      dst_data[pos++] = src_data[srcPos++]; // G
      dst_data[pos++] = src_data[srcPos++]; // B
      dst_data[pos++] = src_data[srcPos++]; // A
    }
  }

  ctx.clearRect(0, 0, width_source, height_source);
  return img2;
}
