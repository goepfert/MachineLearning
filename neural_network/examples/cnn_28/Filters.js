// https://en.wikipedia.org/wiki/Kernel_(image_processing)
const Filters = {
  random: () => {
    let filter = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    let sum = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        filter[j][i] = Math.random() * 2 - 1;
        sum += filter[j][i];
      }
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        filter[j][i] *= 1 / sum;
      }
    }

    return filter;
  },
  blur: [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ],
  sharpening: [
    [0, -0.5, 0],
    [-0.5, 3, -0.5],
    [0, -0.5, 0],
  ],
  sobel_x: [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ],
  sobel_y: [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ],
  ridge: [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ],
};

const numberOfFilters = Object.keys(Filters).length;

export { Filters, numberOfFilters };
