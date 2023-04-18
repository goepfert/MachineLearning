import { createImageDataset } from '../Dataset.js';
import Utils from '../../../../Utils.js';

const canvas = document.getElementById('canvas');
const width = (canvas.width = 280);
const height = (canvas.height = 280);
const context = canvas.getContext('2d');

const grid = 10;
const nCols = width / grid;
const nRows = height / grid;

// single file
function handleFileSelect_load(evt) {
  console.log('hello');

  const file = evt.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    const res = event.target.result;
    const textByLine = res.split('\n');
    const data = JSON.parse(textByLine);
    const imageDataset = createImageDataset();
    imageDataset.clearData();
    imageDataset.setData(data);

    setInterval(() => {
      drawLoop(imageDataset);
    }, 500);
  });

  reader.readAsText(file);
}

/**
 * Multiselect image files that are created with createDataset
 * Sets imageDataset global variable
 */
async function handleFileSelect_load_dataset(evt) {
  const nFiles = evt.target.files.length;
  let promises = [];

  let combinedData = [];
  const imageDataset = createImageDataset(28, 28);
  imageDataset.clearData();

  for (let fileIdx = 0; fileIdx < nFiles; fileIdx++) {
    const file = evt.target.files[fileIdx];
    console.log('loading data from', file.name);

    let filePromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        const res = event.target.result;
        const textByLine = res.split('\n');
        const data = JSON.parse(textByLine);

        // convertData(data);
        imageDataset.setData(data);

        resolve(imageDataset.getData());
      });
      reader.readAsText(file);
    });

    promises.push(filePromise);
  }

  // wait until all promises came back
  const allData = await Promise.all(promises);
  combinedData = [];

  allData.map((data) => {
    combinedData = combinedData.concat(structuredClone(data));
  });
  imageDataset.setData(combinedData);
  imageDataset.printInfo();
  console.log('all files loaded successfully, ready for training');

  setInterval(() => {
    drawLoop(imageDataset);
  }, 500);
}

function drawLoop(imageDataset) {
  let data = imageDataset.getData();
  const img_number = Math.floor(Utils.getRandomArbitrary(0, data.length - 1));
  const image = data[img_number].data;
  console.log(img_number, data[img_number].label);
  draw(image);
}

function draw(image) {
  // console.log(image.length);
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

document.getElementById('file-load').addEventListener('change', handleFileSelect_load_dataset, false);
