import Utils from '../Utils.js';

class Perceptron {
  constructor(n, c) {
    this.weights = [];
    for (let i = 0; i < n; i++) {
      this.weights[i] = Utils.getRandomArbitrary(-1, 1);
    }
    this.c = c; // learning rate/constant
  }

  // Function to train the Perceptron
  // Weights are adjusted based on "desired" answer
  train(inputs, desired) {
    // Guess the result
    let guess = this.feedforward(inputs);
    // Compute the factor for changing the weight based on the error
    // Error = desired output - guessed output
    // Note this can only be 0, -2, or 2
    // Multiply by learning constant
    let error = desired - guess;
    // Adjust weights based on weightChange * input
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.c * error * inputs[i];
    }
  }

  // Guess -1 or 1 based on input values
  feedforward(inputs) {
    // Sum all values
    let sum = 0;
    for (let i = 0; i < this.weights.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    // Result is sign of the sum, -1 or 1
    return this.activate(sum);
  }

  activate(sum) {
    if (sum > 0) return 1;
    else return -1;
  }

  // Return weights
  getWeights() {
    return this.weights;
  }

  print() {
    console.log(this.weights);
  }
}

export default Perceptron;
