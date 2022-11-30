import { createImageDataset } from './Dataset.js';
import NeuralNetwork from '../../lib/NeuralNetwork.js';

const App = (() => {
  const canvas = document.getElementById('canvas');
  const width = (canvas.width = 280);
  const height = (canvas.height = 280);
  const context = canvas.getContext('2d');

  const grid = 10;
  const nCols = width / grid;
  const nRows = height / grid;

  const nClasses = 3; // HARD CODED

  const Labels = {
    apple: 0,
    banana: 1,
    cat: 2,
  };
  let combinedData = [];

  let nn;
  const learningRate = 0.01;

  const batch_iterations = 5000;
  const iterations_per_draw_cycle = 100;

  let loss_div = document.getElementById('loss_div');
  let loss_data = [[0, 0]];
  let data_counter = 0;
  let loss_graph = new Dygraph(loss_div, loss_data, {
    drawPoints: true,
    rollPeriod: 10,
    showRoller: true,
    //valueRange: [-1.0, 1.0]
  });

  function init() {
    document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);
  }

  async function handleFileSelect_load(evt) {
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
      combinedData = combinedData.concat(structuredClone(data));
    });
    // console.log(combinedData);
    console.log('all files loaded successfully, ready for training');

    train();
  }

  function oneHot(label) {
    let target = new Array(nClasses).fill(0);
    let pos = Labels[label];
    target[pos] = 1;

    return target;
  }

  function train() {
    nn = new NeuralNetwork(784, 64, nClasses);
    nn.setLearningRate(learningRate);

    for (let batchIdx = 0; batchIdx < batch_iterations; batchIdx++) {
      let loss = 0;
      for (let i = 0; i < iterations_per_draw_cycle; i++) {
        //pick random data
        let randomIdx = Math.floor(Math.random() * combinedData.length);

        let data = combinedData[randomIdx];
        let label = data.label;
        let image = data.data;

        //oneHot
        let target = oneHot(label);
        nn.train(image, target);

        const output = nn.predict(image);
        let error = 0;
        for (let outIdx = 0; outIdx < output.length; outIdx++) {
          error = target[outIdx] - output[outIdx];
          error *= error;
        }
        loss += 0.5 * error;
      }

      loss /= iterations_per_draw_cycle;
      console.log('loss', data_counter, loss);
      loss_data.push([data_counter++, loss]);
      loss_graph.updateOptions({ file: loss_data });
    }

    console.log('training finished');
  }

  return {
    init,
  };
})();

App.init();

// function handleFileSelect_load(evt) {
//   console.log('hello');

//   const file = evt.target.files[0];
//   const reader = new FileReader();
//   reader.addEventListener('load', (event) => {
//     console.log(event.target);
//     let arrayBuffer = event.target.result;
//     uint8View = new Uint8Array(arrayBuffer);
//     // console.log((uint8View.length - header_length) / image_length);
//     setInterval(drawLoop, 500);
//   });

//   reader.readAsArrayBuffer(file);
// }

// let img_number = 0;
// const image_length = 784; //28*28;
// const header_length = 80;

// function drawLoop() {
//   console.log(img_number);
//   const image = uint8View.slice(
//     header_length + img_number * image_length,
//     header_length + image_length + img_number * image_length
//   );

//   draw(image);
//   img_number++;
// }

// function draw(image) {
//   //   console.log(image.length);
//   for (let row_idx = 0; row_idx < nRows; row_idx++) {
//     for (let col_idx = 0; col_idx < nCols; col_idx++) {
//       let color = image[col_idx + row_idx * nCols];
//       //   console.log(col_idx, row_idx, col_idx + row_idx * nCols, color);
//       context.fillStyle = `rgb(${color}, ${color}, ${color})`;
//       context.fillRect(col_idx * grid, row_idx * grid, grid, grid);
//     }
//   }
// }
