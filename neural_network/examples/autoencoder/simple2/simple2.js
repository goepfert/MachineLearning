import { createImageDataset } from './Dataset.js';
import { createNetwork } from './tf_model.js';
import Utils from '../../../../Utils.js';

const App = (() => {
  //- Canvas and friends --------------------------------
  const canvas = document.getElementById('canvas');
  const width = (canvas.width = 280);
  const height = (canvas.height = 280);
  const context = canvas.getContext('2d');
  const grid = 10;
  const nCols = width / grid; // shall be 28
  const nRows = height / grid;

  const canvas_result = document.getElementById('canvas_result');
  canvas_result.width = canvas.width;
  canvas_result.height = canvas.height;
  const context_result = canvas_result.getContext('2d');

  // - Network -------------------------------------------------------------
  let nn;
  let model;

  // - Image ---------------------------------------------------------------
  // const nClasses = numberOfLabels; // HARD CODED
  let imageDataset;
  let currentData;

  // - Drawing ---------------------------------------------------------------
  let coord = { x: 0, y: 0 };
  let predictFromDrawing = true;

  function init() {
    document.getElementById('file-load-dataset').addEventListener('change', handleFileSelect_load_dataset, false);
    document.getElementById('train-btn').addEventListener('click', train, false);
    document.getElementById('load-network').addEventListener('change', loadModel, false);
    document.getElementById('save-network').addEventListener('click', saveModel, false);
    document.getElementById('load-img-btn').addEventListener('click', loadAndDrawRandomImage, false);
    document.getElementById('clear-btn').addEventListener('click', clearCanvas, false);
    document.getElementById('predict-btn').addEventListener('click', predict, false);
    document.addEventListener('mousedown', startDrawing);
    document.addEventListener('mouseup', stopDrawing);

    document.getElementById('test-btn').addEventListener('click', encode, false);

    clearCanvas();

    nn = createNetwork(nCols, nRows);
  }

  function clearCanvas() {
    context.fillStyle = 'White';
    context.fillRect(0, 0, width, height);
    predictFromDrawing = true;

    context_result.fillStyle = 'White';
    context_result.fillRect(0, 0, width, height);
  }

  /**
   * Load and draw random image from imageDataset
   */
  function loadAndDrawRandomImage() {
    Utils.assert(imageDataset != undefined, 'no data loaded');

    const imageData = imageDataset.getData();
    const randomIdx = Math.floor(Math.random() * imageData.length);
    currentData = imageData[randomIdx];
    let image = currentData.data;
    clearCanvas();
    draw(image);
    predictFromDrawing = false;
  }

  /**
   * Remap pixeldata in place to be within [0, 1]
   */
  function convertData(data) {
    for (let dataIdx = 0; dataIdx < data.length; dataIdx++) {
      let image = data[dataIdx].data;
      image = image.map((pixel) => {
        return Utils.map(pixel, 0, 255, 1, 0);
      });
      data[dataIdx].data = image;
    }
  }

  /**
   * Multiselect image files that are created with createDataset
   * Sets imageDataset global variable
   */
  async function handleFileSelect_load_dataset(evt) {
    const nFiles = evt.target.files.length;
    let promises = [];

    let combinedData = [];
    imageDataset = createImageDataset(28, 28);
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

          convertData(data);
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
  }

  /**
   * Infer model either on loaded image or on self drawn image
   * Currently only console output as feedback
   */
  // TODO
  function predict() {
    Utils.assert(model != undefined, 'model undefined');
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

      let x = tf.tensor([image]);
      let y = model.predict(x);
      let output = y.dataSync();

      // console.log(output);
      draw(output, context_result);
    });
  }

  async function train() {
    Utils.assert(imageDataset != undefined, 'no data loaded');

    model = nn.getModel();
    tfvis.show.modelSummary({ name: 'Model Summary', tab: 'Model' }, model);

    const trainingData = imageDataset.getTrainingData();
    await nn.train(trainingData.x, trainingData.x, model);

    console.log('training finished');
  }

  /**
   * save NN model
   * HELP: How to avoid page refresh?
   */
  async function saveModel(e) {
    console.log('save');
    Utils.assert(model != undefined, 'model undefined');
    const filename = 'the_great_doodle_model';
    console.log(await model.save(`downloads://${filename}`));
  }

  /**
   * load NN model
   * user has to select json and bin file ... in the right order :(
   */
  async function loadModel(e) {
    Utils.assert(e.target.files.length == 2, 'select one json and one bin file for model');
    let jsonFile;
    let binFile;

    if (e.target.files[0].name.split('.').pop() == 'json') {
      jsonFile = e.target.files[0];
      binFile = e.target.files[1];
    } else {
      jsonFile = e.target.files[1];
      binFile = e.target.files[0];
    }

    Utils.assert(model == undefined, 'model already defined?'); //overwrite????
    model = await tf.loadLayersModel(tf.io.browserFiles([jsonFile, binFile]));
    console.log(model);
  }

  function draw(image, ctx = context) {
    image = image.map((pixel) => {
      return Math.floor(Utils.map(pixel, 0, 1, 0, 255));
    });

    for (let row_idx = 0; row_idx < nRows; row_idx++) {
      for (let col_idx = 0; col_idx < nCols; col_idx++) {
        let color = image[col_idx + row_idx * nCols];
        //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.fillRect(col_idx * grid, row_idx * grid, grid, grid);
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

  // ------------------------------------------------------------------------------------------------

  const IMAGE_WIDTH = nCols;
  const IMAGE_HEIGHT = nRows;

  // Create encoder
  const model_encoder = tf.sequential();
  model_encoder.add(
    tf.layers.dense({
      name: 'layer1_encoder',
      inputShape: [IMAGE_WIDTH * IMAGE_HEIGHT],
      units: (IMAGE_WIDTH * IMAGE_HEIGHT) / 2,
      activation: 'relu',
    })
  );

  model_encoder.add(
    tf.layers.dense({
      name: 'layer2_encoder',
      units: 1,
      activation: 'sigmoid',
    })
  );

  // Create decoder
  const model_decoder = tf.sequential();
  model_decoder.add(
    tf.layers.dense({
      name: 'layer1_decoder',
      inputShape: [1],
      units: (IMAGE_WIDTH * IMAGE_HEIGHT) / 2,
      activation: 'sigmoid',
    })
  );

  model_decoder.add(
    tf.layers.dense({
      name: 'layer2_decoder',
      units: IMAGE_WIDTH * IMAGE_HEIGHT,
      activation: 'sigmoid',
    })
  );

  function encode() {
    tf.tidy(() => {
      const layer1 = model.getLayer('layer1_encoder');
      const weights = layer1.getWeights();
      const weightCopies = []; //actually an array of tensors at the end
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      const layer_encoder = model_encoder.getLayer('layer1_encoder');
      layer_encoder.setWeights(weightCopies);
    });

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

      let x = tf.tensor([image]);
      let y = model_encoder.predict(x);
      let output = y.dataSync();

      console.log(output);
    });
  }

  let slider = document.getElementById('myRange');

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function () {
    decode(slider.value / 1000);
  };

  let copied_already = false;
  function decode(value) {
    console.log(value);
    // return;
    if (!copied_already) {
      tf.tidy(() => {
        const layer1 = model.getLayer('layer1_decoder');
        let weights = layer1.getWeights();
        let weightCopies = []; //actually an array of tensors at the end
        for (let i = 0; i < weights.length; i++) {
          weightCopies[i] = weights[i].clone();
        }
        let layer_decoder = model_decoder.getLayer('layer1_decoder');
        layer_decoder.setWeights(weightCopies);

        const layer2 = model.getLayer('layer2_decoder');
        weights = layer2.getWeights();
        weightCopies = []; //actually an array of tensors at the end
        for (let i = 0; i < weights.length; i++) {
          weightCopies[i] = weights[i].clone();
        }
        layer_decoder = model_decoder.getLayer('layer2_decoder');
        layer_decoder.setWeights(weightCopies);
      });
    }

    let x = tf.tensor([value]);
    let y = model_decoder.predict(x);
    let output = y.dataSync();
    draw(output, context_result);
  }

  // ------------------------------------------------------------------------------------------------

  return {
    init,
  };
})();

App.init();
