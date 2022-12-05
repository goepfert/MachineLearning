import { createImageDataset } from './Dataset.js';
import Utils from '../../../Utils.js';
import { Labels, numberOfLables } from './Labels.js';

const App = (() => {
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

  // - Image ---------------------------------------------------------------
  const nClasses = numberOfLables; // HARD CODED
  let combinedData = [];
  let currentData;

  const filter = [
    [2, 0, -0.9],
    [2, 1, -0.9],
    [2, 0, -0.9],
  ];

  function init() {
    document.getElementById('file-load-dataset').addEventListener('change', handleFileSelect_load_dataset, false);
    document.getElementById('load-img-btn').addEventListener('click', loadAndDrawRandomImage, false);
    document.getElementById('clear-btn').addEventListener('click', clearCanvas, false);
    // document.getElementById('predict-btn').addEventListener('click', predict, false);

    clearCanvas();
  }

  function clearCanvas() {
    context.fillStyle = 'White';
    context.fillRect(0, 0, width, height);
  }

  function loadAndDrawRandomImage() {
    Utils.assert(combinedData.length > 0, 'no data loaded');
    let randomIdx = Math.floor(Math.random() * combinedData.length);
    currentData = combinedData[randomIdx];
    draw(currentData.data);
  }

  async function handleFileSelect_load_dataset(evt) {
    const nFiles = evt.target.files.length;
    let promises = [];

    for (let fileIdx = 0; fileIdx < nFiles; fileIdx++) {
      const file = evt.target.files[fileIdx];
      console.log('loading data from', file.name);

      let filePromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
          const res = event.target.result;
          const textByLine = res.split('\n');
          const data = JSON.parse(textByLine);

          const imageDataset = createImageDataset();
          imageDataset.clearData();
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
      // console.log(data);

      // rescale black <-> white and 0...1
      convertData(data);

      combinedData = combinedData.concat(structuredClone(data));
    });
    // console.log(combinedData);
    console.log('all files loaded successfully, ready for training');
  }

  // Hope this work on the Reference
  function convertData(data) {
    for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
      let image = data[dataIdx].data;
      image = image.map((pixel) => {
        return Utils.map(pixel, 0, 255, 1, 0);
      });
      data[dataIdx].data = image;
    }
  }

  function draw(image) {
    image = image.map((pixel) => {
      return Utils.map(pixel, 0, 1, 0, 255);
    });

    for (let row_idx = 0; row_idx < nRows; row_idx++) {
      for (let col_idx = 0; col_idx < nCols; col_idx++) {
        let color = image[col_idx + row_idx * nCols];
        //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
        context.fillStyle = `rgb(${color}, ${color}, ${color})`;
        context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
      }
    }

    for (let row_idx = 1; row_idx < nRows - 1; row_idx++) {
      for (let col_idx = 1; col_idx < nCols - 1; col_idx++) {
        let color = conv(image, col_idx, row_idx, filter);
        // console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
        context_output.fillStyle = `rgb(${color}, ${color}, ${color})`;
        context_output.fillRect(col_idx * grid, row_idx * grid, grid, grid);
      }
    }
  }

  function conv(image, col_idx, row_idx, filter) {
    let conv = 0;
    for (let f_row_idx = -1; f_row_idx <= 1; f_row_idx++) {
      for (let f_col_idx = -1; f_col_idx <= 1; f_col_idx++) {
        let pixel_x = col_idx + f_col_idx;
        let pixel_y = row_idx + f_row_idx;
        let index = pixel_x + pixel_y * nCols;
        conv += filter[f_row_idx + 1][f_col_idx + 1] * image[index];
      }
    }
    return conv;
  }

  return {
    init,
  };
})();

App.init();
