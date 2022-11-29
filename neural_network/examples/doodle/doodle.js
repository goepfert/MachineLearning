import { createImageDataset } from './Dataset.js';

const App = (() => {
  const canvas = document.getElementById('canvas');
  const width = (canvas.width = 280);
  const height = (canvas.height = 280);
  const context = canvas.getContext('2d');

  const grid = 10;
  const nCols = width / grid;
  const nRows = height / grid;
  let uint8View;

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

          resolve(imageDataset);
        });
        reader.readAsText(file);
      });

      promises.push(filePromise);
    }

    // wait until all promises came back
    const allData = await Promise.all(promises);
    allData.map((data) => console.log('hiho', data));
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
