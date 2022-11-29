/**
 * Dataset handler
 */

import Utils from '../../../Utils.js';

('use strict');

function createImageDataset() {
  let _data = [];

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

  return {
    addData,
    getData,
    clearData,
    setData,
    saveData,
    printInfo,
  };
}

export { createImageDataset };
