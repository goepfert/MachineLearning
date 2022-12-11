class PixelImage {
  constructor(data, nCols, nRows) {
    this._data = data;
    this._nCols = nCols;
    this._nRows = nRows;
  }

  get data() {
    return this._data;
  }

  get nCols() {
    return this._nCols;
  }

  get nRows() {
    return this._nRows;
  }

  set data(newdata) {
    this._data = newdata;
  }

  set nCols(cols) {
    this._nCols = cols;
  }

  set nRows(rows) {
    this._nRows = rows;
  }
}

export { PixelImage };
