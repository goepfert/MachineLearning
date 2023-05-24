import { createImageDataset } from './Dataset.js';
import { createNetwork } from './tf_model.js';
import Utils from '../../../../../../Utils.js';

const App = (() => {
  const canvas = document.getElementById('canvas');
  const width = (canvas.width = 178);
  const height = (canvas.height = 218);
  const context = canvas.getContext('2d');
  const grid = 1;
  const nCols = width / grid;
  const nRows = height / grid;

  const canvas_result = document.getElementById('canvas_result');
  canvas_result.width = canvas.width;
  canvas_result.height = canvas.height;
  const context_result = canvas_result.getContext('2d');

  // - Network -------------------------------------------------------------
  let nn;
  let model;

  // - Image ---------------------------------------------------------------
  let imageDataset;

  function init() {
    document.getElementById('file-load-dataset').addEventListener('change', handleFileSelect_load_dataset, false);
    // document.getElementById('train-btn').addEventListener('click', train, false);
    clearAllCanvas();

    nn = createNetwork(nCols, nRows);
    nn.getModel().summary();
  }

  function clearAllCanvas() {
    context.fillStyle = 'White';
    context.fillRect(0, 0, width, height);

    context_result.fillStyle = 'White';
    context_result.fillRect(0, 0, width, height);
  }

  /**
   * Multiselect image files
   * Converts jpg rgb images to grayscale and append to image array
   */
  async function handleFileSelect_load_dataset(evt) {
    const nFiles = evt.target.files.length;
    console.log(nFiles);

    clearAllCanvas();

    let promises = [];
    imageDataset = createImageDataset(178, 218);

    for (let fileIdx = 0; fileIdx < nFiles; fileIdx++) {
      const file = evt.target.files[fileIdx];
      console.log('loading data from', file.name);
      let filePromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
          const image = new Image();
          image.src = reader.result;
          resolve(image);
        });
        reader.readAsDataURL(file);
      }, false);
      promises.push(filePromise);
    }

    // wait until all promises came back
    const allData = await Promise.all(promises);
    allData.map((image) => {
      context.drawImage(image, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      const data = Array.from(imageData.data);

      let pixeldata = [];
      for (let pos = 0; pos < data.length; ) {
        let pixel = (data[pos++] + data[pos++] + data[pos++]) / 3;
        pixel = Utils.map(pixel, 0, 255, 1, 0);
        pixeldata.push(pixel);
        pos++;
      }

      imageDataset.addData(pixeldata, 'image');

      // for (let row_idx = 0; row_idx < nRows; row_idx++) {
      //   for (let col_idx = 0; col_idx < nCols; col_idx++) {
      //     let color = pixeldata[col_idx + row_idx * nCols];
      //     console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
      //     context_result.fillStyle = `rgb(${color}, ${color}, ${color})`;
      //     context_result.fillRect(col_idx, row_idx, 1, 1);
      //   }
      // }
    });

    clearAllCanvas();
    console.log('all files loaded successfully, ready for training');
  }

  return {
    init,
  };
})();

window.onload = async () => {
  App.init();
};
