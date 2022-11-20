import { Dataset } from './Dataset.js';

const createTrainingData = (dataset) => {
  let training_data = [];

  switch (dataset) {
    case Dataset.xor:
      xor();
      break;
    case Dataset.random:
      random();
      break;
    case Dataset.spiral:
      spiral();
      break;
  }

  function xor() {
    training_data = [
      {
        input: [0, 0],
        target: [0],
      },
      {
        input: [1, 0],
        target: [1],
      },
      {
        input: [0, 1],
        target: [1],
      },
      {
        input: [1, 1],
        target: [0],
      },
    ];
  }

  function random() {
    for (let idx = 0; idx < 10; idx++) {
      let x1 = Math.random();
      let x2 = Math.random();
      let y = Math.floor(Math.random() + 0.5);

      training_data.push({
        input: [x1, x2],
        target: [y],
      });
    }
  }

  // https://conx.readthedocs.io/en/latest/Two-Spirals.html
  function spiral() {
    let spiral_num = 1;
    const nom = 2.5;
    const nPoints = 96;

    for (let i = 0; i < nPoints; i++) {
      let phi = (i / 16) * Math.PI;

      let r = 6.5 * ((104 - i) / 104);
      let x1 = (r * Math.cos(phi) * spiral_num) / nom + 0.5;
      let x2 = (r * Math.sin(phi) * spiral_num) / nom + 0.5;

      //console.log(x1, x2);
      training_data.push({
        input: [x1, x2],
        target: [1],
      });
    }

    spiral_num = -1;
    for (let i = 0; i < nPoints; i++) {
      let phi = (i / 16) * Math.PI;

      let r = 6.5 * ((104 - i) / 104);
      let x1 = (r * Math.cos(phi) * spiral_num) / nom + 0.5;
      let x2 = (r * Math.sin(phi) * spiral_num) / nom + 0.5;

      //console.log(x1, x2);
      training_data.push({
        input: [x1, x2],
        target: [0],
      });
    }
  }

  return training_data;
};

export { createTrainingData };
