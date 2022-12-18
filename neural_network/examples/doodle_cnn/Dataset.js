/**
 * Dataset handler
 */

import Utils from '../../../Utils.js';
import { Labels } from './Labels.js';

('use strict');

function createImageDataset(img_width, img_height) {
  let _data = [];
  const _img_width = img_width;
  const _img_height = img_height;

  // add data with label to the record
  function addData(data, label) {
    //TODO: check sizes

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

  function setData(data) {
    _data = data;
    printInfo(_data);
  }

  function saveData(filename) {
    let _filename = 'test.data';

    if (filename !== undefined) {
      _filename = filename;
    }

    Utils.download(JSON.stringify(_data), _filename, 'text/plain');
  }

  function printInfo() {
    console.log('length:', _data.length);
    if (_data.length >= 0) {
      console.log('data length', Object.keys(_data[0].data).length);
    }
  }

  function getTrainingData() {
    const nDatasets = _data.length;

    return nextTestBatch(nDatasets, false);
  }

  function nextTestBatch(size, randomize = true) {
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

    let xs = tf.tensor(xData, [xData.length, _img_width, _img_height, 1]);
    let labelstensor = tf.tensor1d(yData, 'int32');
    let ys = tf.oneHot(labelstensor, labelList.length);
    labelstensor.dispose();

    return {
      x: xs,
      y: ys,
    };
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
