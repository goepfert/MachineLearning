/**
 * Some helper functions used in this project
 */

'use strict';

const Utils = (() => {
  /**
   * map given number (value) from one range to another one
   * 1: in, 2: out
   */
  function map(value, x1, y1, x2, y2) {
    return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
  }

  /**
   * Constrain given number (value) between min and max
   */
  function constrain(value, min, max) {
    value = value < min ? min : value;
    value = value > max ? max : value;
    return value;
  }

  /**
   * Throw error with given message if condition is not met
   */
  function assert(condition, message) {
    if (!condition) {
      message = message || 'Assertion failed';
      if (typeof Error !== 'undefined') {
        throw new Error(message);
      }
      throw message; // Fallback
    }
  }

  /**
   * Returns random number between min and max
   */
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns normal distributed random number, mean = 0, sigma = 1
   * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
   */
  function randomGaussian() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randomGaussian(); // resample between 0 and 1
    return num;
  }

  function drawLine(context, x1, y1, x2, y2, width, style) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);

    if (width != undefined) {
      context.lineWidth = `${width}`;
    }
    if (style != undefined) {
      context.strokeStyle = style;
    }
    context.stroke();
  }

  function drawCircle(context, x1, y1, r, width, style) {
    context.beginPath();
    context.arc(x1, y1, r, 0, Math.PI * 2);

    if (width != undefined) {
      context.lineWidth = `${width}`;
    }
    if (style != undefined) {
      context.strokeStyle = style;
    }
    context.stroke();
  }

  return {
    map,
    constrain,
    assert,
    getRandomArbitrary,
    randomGaussian,
    drawLine,
    drawCircle,
  };
})();

// export default Utils;

if (typeof module !== 'undefined') {
  module.exports = Utils;
}
