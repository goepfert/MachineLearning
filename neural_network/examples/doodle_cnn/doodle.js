import { createImageDataset } from './Dataset.js';
import { createNetwork } from './tf_model.js';
import Utils from '../../../Utils.js';
import { Labels, numberOfLabels } from './Labels.js';

const App = (() => {
  const canvas = document.getElementById('canvas');
  const width = (canvas.width = 280);
  const height = (canvas.height = 280);
  const context = canvas.getContext('2d');

  const grid = 10;
  const nCols = width / grid; // shall be 28
  const nRows = height / grid;

  // - Network -------------------------------------------------------------
  let nn;
  let model;
  let trained = false;

  // - Image ---------------------------------------------------------------
  const nClasses = numberOfLabels; // HARD CODED
  let combinedData = [];
  let currentData;

  // - Drawing ---------------------------------------------------------------
  let coord = { x: 0, y: 0 };
  let predictFromDrawing = true;

  function init() {
    document.getElementById('file-load-dataset').addEventListener('change', handleFileSelect_load_dataset, false);
    document.getElementById('train-btn').addEventListener('click', train, false);
    document.getElementById('file-load-network').addEventListener('change', handleFileSelect_load_network, false);
    // document.getElementById('test-accuracy-btn').addEventListener('click', testAccuracy, false);
    document.getElementById('load-img-btn').addEventListener('click', loadAndDrawRandomImage, false);
    document.getElementById('clear-btn').addEventListener('click', clearCanvas, false);
    document.getElementById('predict-btn').addEventListener('click', predict, false);
    document.addEventListener('mousedown', startDrawing);
    document.addEventListener('mouseup', stopDrawing);

    clearCanvas();

    // nn = new NeuralNetwork(784, 196, nClasses);
    nn = createNetwork(28, 28, nClasses);
  }

  function clearCanvas() {
    context.fillStyle = 'White';
    context.fillRect(0, 0, width, height);
    predictFromDrawing = true;
  }

  function loadAndDrawRandomImage() {
    Utils.assert(combinedData.length > 0, 'no data loaded');
    let randomIdx = Math.floor(Math.random() * combinedData.length);
    currentData = combinedData[randomIdx];
    draw(currentData.data);
    predictFromDrawing = false;
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

  function handleFileSelect_load_network(evt) {
    const file = evt.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      nn = NeuralNetwork.deserialize(event.target.result);

      console.log('neural network loaded from file', nn);
    });

    reader.readAsText(file);
  }

  function predict() {
    if (model == undefined || trained == false) {
      console.log('modele undefinied or not trained');
      return;
    }

    let image;
    tf.tidy(() => {
      if (predictFromDrawing) {
        image = resample_single(canvas, 28, 28, false);
        draw(image);
      } else {
        Utils.assert(currentData !== undefined, 'image must be loaded');
        image = currentData.data;
        console.log('You gave me: ', currentData.label);
      }

      let x = tf.tensor4d(image, [1, 28, 28, 1]);
      let y = model.predict(x);
      let output = y.dataSync();

      const maxIdx = output.indexOf(Math.max(...output));
      console.log('🚀 ~ file: doodle.js:143 ~ tf.tidy ~ maxIdx', maxIdx);
      let key = Object.keys(Labels)[maxIdx];
      console.log('I think it is: ', key);
    });
  }

  function doPrediction(model, data, testDataSize = 500) {
    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const testData = data.nextTestBatch(testDataSize);

    const testxs = testData.x; //.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
    const labels = testData.y.argMax(-1);

    const preds = model.predict(testxs).argMax(-1);

    testxs.dispose();
    return [preds, labels];
  }

  async function showAccuracy(model, data) {
    const [preds, labels] = doPrediction(model, data);
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    const container = { name: 'Accuracy', tab: 'Evaluation' };
    const classNames = Object.keys(Labels);

    tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

    labels.dispose();
  }

  async function showConfusion(model, data) {
    const [preds, labels] = doPrediction(model, data);
    const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    const container = { name: 'Confusion Matrix', tab: 'Evaluation' };
    const classNames = Object.keys(Labels);

    tfvis.render.confusionMatrix(container, { values: confusionMatrix, tickLabels: classNames });

    labels.dispose();
  }

  async function train() {
    Utils.assert(combinedData.length > 0, 'no data loaded');

    model = nn.getModel();
    tfvis.show.modelSummary({ name: 'Model Summary', tab: 'Model' }, model);

    const imageDataset = createImageDataset(28, 28);
    imageDataset.setData(combinedData);

    const trainingData = imageDataset.getTrainingData();
    await nn.train(trainingData.x, trainingData.y, model);

    console.log('training finished');

    showAccuracy(model, imageDataset);
    showConfusion(model, imageDataset);

    trained = true;
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
  }

  function reposition(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
  }

  function startDrawing(event) {
    document.addEventListener('mousemove', drawImage);
    reposition(event);
  }

  function stopDrawing() {
    document.removeEventListener('mousemove', drawImage);
  }

  function drawImage(event) {
    context.beginPath();
    context.lineWidth = 16;
    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.moveTo(coord.x, coord.y);
    reposition(event);
    context.lineTo(coord.x, coord.y);
    context.stroke();
    predictFromDrawing = true;
  }

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
    //ctx.putImageData(img2, 0, 0);
    let image = [];
    let pos = 0;

    for (let row_idx = 0; row_idx < nRows; row_idx++) {
      for (let col_idx = 0; col_idx < nCols; col_idx++) {
        let color = (img2.data[pos++] + img2.data[pos++] + img2.data[pos++]) / 3;
        pos++;
        color = Utils.map(color, 0, 255, 0, 1);
        image.push(color);
      }
    }
    return image;
  }

  return {
    init,
  };
})();

App.init();
