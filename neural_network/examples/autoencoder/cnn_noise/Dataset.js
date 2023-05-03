/**
 * Dataset handler, what do you think ... pfff
 */

import Utils from '../../../../Utils.js';
import { Labels } from '../Labels.js';

function createImageDataset(img_width, img_height) {
  let _data = [];
  const _img_width = img_width;
  const _img_height = img_height;

  function getLabelList() {
    let labelList = [];
    let nLabels = _data.length;
    for (let dataIdx = 0; dataIdx < nLabels; dataIdx++) {
      labelList.push(_data[dataIdx].label);
    }

    // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    labelList = [...new Set(labelList)];
    return labelList;
  }

  function printInfo() {
    console.log('data length:', _data.length);
    console.table(getLabelList());
  }

  // add data with label to the record
  function addData(data, label) {
    _data.push({
      label,
      data,
    });
  }

  function getData() {
    return _data;
  }

  function clearData() {
    console.log('clearing imageDataset');
    _data = [];
  }

  function setData(data, verbose = false) {
    _data = data;
    if (verbose) {
      printInfo(_data);
    }
  }

  function saveData(filename) {
    let _filename = 'test.data';

    if (filename !== undefined) {
      _filename = filename;
    }

    Utils.download(JSON.stringify(_data), _filename, 'text/plain');
  }

  // shuffles to objects and preserve their relation
  function shuffle(obj1, obj2) {
    let index = obj1.length;
    let rnd, tmp1, tmp2;

    while (index) {
      rnd = Math.floor(Math.random() * index);
      index -= 1;
      tmp1 = obj1[index];
      tmp2 = obj2[index];
      obj1[index] = obj1[rnd];
      obj2[index] = obj2[rnd];
      obj1[rnd] = tmp1;
      obj2[rnd] = tmp2;
    }
  }

  function nextTestBatch(size, randomize = true, sp_noise_prob = 0.1) {
    const labelList = Object.keys(Labels);
    let xData = [];
    let yData = [];

    let yaIdx;
    for (let idx = 0; idx < size; idx++) {
      if (randomize) {
        yaIdx = Math.floor(Math.random() * _data.length);
      } else {
        yaIdx = idx;
      }
      xData.push(_data[yaIdx].data);
      yData.push(labelList.indexOf(_data[yaIdx].label));
    }

    // pretty important, at least if you use validationspit
    // https://js.tensorflow.org/api/latest/#tf.Sequential.fit
    shuffle(xData, yData);

    let xData_noisy = [];
    for (let idx = 0; idx < xData.length; idx++) {
      xData_noisy.push(Utils.add_SP_Noise(xData[idx], sp_noise_prob, 1));
    }

    let xs = tf.tensor(xData, [xData.length, _img_width, _img_height, 1]);
    let xs_noisy = tf.tensor(xData_noisy, [xData_noisy.length, _img_width, _img_height, 1]);
    let labelstensor = tf.tensor1d(yData, 'int32');
    let ys = tf.oneHot(labelstensor, labelList.length);
    labelstensor.dispose();

    return {
      x: xs,
      xNoisy: xs_noisy,
      y: ys,
    };
  }

  function getTrainingData(sp_noise_prob) {
    const nDatasets = _data.length;

    return nextTestBatch(nDatasets, false, sp_noise_prob);
  }

  return {
    addData,
    getData,
    clearData,
    setData,
    saveData,
    getTrainingData,
    nextTestBatch,
    printInfo,
  };
}

export { createImageDataset };
