import Utils from '../Utils.js';

class Perceptron {
  constructor(nInputs, learningRate) {
    this.weights = [];
    for (let i = 0; i < nInputs; i++) {
      this.weights[i] = Utils.getRandomArbitrary(-1, 1);
    }
    this.learningRate = learningRate;
  }

  /**
   * Function to train the Perceptron
   * Weights are adjusted based on expected answer
   */
  train(inputs, expected) {
    let prediction = this.feedForward(inputs);
    let error = expected - prediction;
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.learningRate * error * inputs[i]; // Perceptron learning algorithm
    }
  }

  // Prediction: -1 or 1 based on input values
  feedForward(inputs) {
    let sum = 0;
    for (let i = 0; i < this.weights.length; i++) {
      sum += this.weights[i] * inputs[i];
    }
    return this.#activationFunction(sum);
  }

  /**
   * Sign Function
   * Non differentiable activation function, don't try to use gradient descent
   */
  #activationFunction(sum) {
    if (sum > 0) {
      return 1;
    } else {
      return -1;
    }
  }

  getWeights() {
    return this.weights;
  }

  print() {
    console.log(this.weights);
  }
}

export default Perceptron;
