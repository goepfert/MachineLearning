/**
 *
 */
import Utils from '../../../../Utils.js';
import { createImageDataset } from '../Dataset.js';

const App = (() => {
  const header_length = 80;
  const image_length = 784; //28*28;
  const nImages = 10;

  let label = 'kaktus';
  let uint8View;

  function init() {
    console.log('init app');

    document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);
  }

  function handleFileSelect_load(evt) {
    const file = evt.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      // console.log(event.target);
      let arrayBuffer = event.target.result;
      uint8View = new Uint8Array(arrayBuffer);

      createAndFillDataset(uint8View);
    });

    reader.readAsArrayBuffer(file);
  }

  function createAndFillDataset(uint8View) {
    const nImagesInDataset = (uint8View.length - header_length) / image_length;
    Utils.assert(
      nImagesInDataset >= nImages,
      `Dataset too small, number of images in dataset: ${nImagesInDataset} vs. ${nImages}`
    );
    Utils.assert(label !== '', 'no label set');

    const imageDataset = createImageDataset();

    for (let imgIdx = 0; imgIdx < nImages; imgIdx++) {
      const image = uint8View.slice(
        header_length + imgIdx * image_length,
        header_length + image_length + imgIdx * image_length
      );

      imageDataset.addData(image, label);
    }
    imageDataset.saveData('test');
  }

  return {
    init,
  };
})();

App.init();
