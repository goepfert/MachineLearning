import Utils from '../../../Utils.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 280);
const height = (canvas.height = 280);
const context = canvas.getContext('2d');

const grid = 10;
const nCols = width / grid;
const nRows = height / grid;
let uint8View;

function handleFileSelect_load(evt) {
  const file = evt.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    console.log(event.target);
    let arrayBuffer = event.target.result;
    uint8View = new Uint8Array(arrayBuffer);
    // console.log((uint8View.length - header_length) / image_length);
    //setInterval(drawLoop, 500);
    drawLoop();
  });

  reader.readAsArrayBuffer(file);
}

let img_number = 0;
const image_length = 784; //28*28;
const header_length = 80;

function drawLoop() {
  console.log(img_number);
  const image = uint8View.slice(
    header_length + img_number * image_length,
    header_length + image_length + img_number * image_length
  );

  draw(image);
  img_number++;
}

function draw(image) {
  //   console.log(image.length);
  for (let row_idx = 0; row_idx < nRows; row_idx++) {
    for (let col_idx = 0; col_idx < nCols; col_idx++) {
      let color = image[col_idx + row_idx * nCols];
      color = Utils.map(color, 0, 255, 255, 0);
      //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
      context.fillStyle = `rgb(${color}, ${color}, ${color})`;
      context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
    }
  }
}

document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);
