/**
 * Some helper functions used in this project
 */

'use strict';

/**
 * Revealing Module Pattern with IIFE: https://www.geeksforgeeks.org/describe-the-revealing-module-pattern-in-javascript/
 */
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
   * Returns normal distributed random number, mean = 0, sigma=1
   * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
   */
  function randomGaussian(mean = 0, stdev = 1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
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

  function drawCircle(context, x1, y1, r, width, fillstyle, strokestyle) {
    context.beginPath();
    context.arc(x1, y1, r, 0, Math.PI * 2);

    if (width != undefined) {
      context.lineWidth = `${width}`;
    }
    if (fillstyle != undefined) {
      context.fillStyle = fillstyle;
      context.fill();
    }
    if (strokestyle != undefined) {
      context.strokeStyle = strokestyle;
    }
    context.stroke();
  }

  function download(content, fileName, contentType) {
    let a = document.createElement('a');
    let file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sleep_ms(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Add salt and pepper noise to image
   * prob: Probability of the noise
   *
   * https://stackoverflow.com/questions/22937589/how-to-add-noise-gaussian-salt-and-pepper-etc-to-image-in-python-with-opencv
   */
  function add_SP_Noise(image, prob = 0.1, max = 255) {
    let output = Array(image.length).fill(0);
    const thres = 1 - prob;

    for (let idx = 0; idx < image.length; idx++) {
      let rnd = Math.random();

      if (rnd < prob) {
        output[idx] = 0;
      } else if (rnd > thres) {
        output[idx] = max;
      } else {
        output[idx] = image[idx];
      }
    }

    return output;
  }

  /**
   *
   */
  function add_Gaussian_Noise(image, prob = 0.1, max = 255) {
    let output = Array(image.length).fill(0);
    const thres = 1 - prob;

    for (let idx = 0; idx < image.length; idx++) {
      let rnd = Math.random();
      if (rnd > thres) {
        output[idx] = 1 - image[idx] + randomGaussian(max / 2, max / 4);
        // output[idx] = randomGaussian(max / 2, max / 4);
      } else {
        output[idx] = image[idx];
        // output[idx] = 1;
      }

      output[idx] = constrain(output[idx], 0, max);
      // console.log(output[idx]);
    }

    return output;
  }

  return {
    map,
    constrain,
    assert,
    getRandomArbitrary,
    randomGaussian,
    drawLine,
    drawCircle,
    download,
    getRandomInt,
    sleep_ms,
    add_SP_Noise,
    add_Gaussian_Noise,
  };
})();

export default Utils;
