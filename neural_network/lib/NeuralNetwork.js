import Matrix from './Matrix.js';
class NeuralNetwork {
  constructor(numberOfInputNodes, numberOfHiddenNodes, numberOfOutputNodes) {
    // Nodes
    this.input_nodes = numberOfInputNodes;
    this.hidden_nodes = numberOfHiddenNodes;
    this.output_nodes = numberOfOutputNodes;

    // Weight Matrices
    this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
    this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
    this.weights_ih.randomize();
    this.weights_ho.randomize();

    // Biases
    this.bias_h = new Matrix(this.hidden_nodes, 1);
    this.bias_o = new Matrix(this.output_nodes, 1);
    this.bias_h.randomize();
    this.bias_o.randomize();

    // Learning Rate
    this.setLearningRate();
  }

  setLearningRate(learningRate = 0.1) {
    this.learningRate = learningRate;
  }

  // Sigmoid activation function
  #sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // 'outer' derivative
  #dsigmoid(y) {
    //return sigmoid(x) (1-sigmoid(x));
    return y * (1 - y);
  }

  // Expecting input as Matrix
  #feedForward(input) {
    // Calculate hidden outputs
    let hidden = Matrix.multiply(this.weights_ih, input);
    hidden.add(this.bias_h);
    hidden.map(this.#sigmoid);

    // Calculate output
    let output = Matrix.multiply(this.weights_ho, hidden);
    output.add(this.bias_o);
    output.map(this.#sigmoid);

    return [hidden, output];
  }

  // Expecting array as input type
  // Returns output array
  predict(input_array) {
    let input = Matrix.fromArray(input_array);
    let output = this.#feedForward(input)[1];

    return output.toArray();
  }

  // https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/
  train(input_array, target_array) {
    let input = Matrix.fromArray(input_array);
    let target = Matrix.fromArray(target_array);

    // Calculate hidden and output
    const feedForward_result = this.#feedForward(input);
    const hidden = feedForward_result[0];
    const output = feedForward_result[1];

    // Output Layer ---------------------------------------

    // Calculate the Error
    let output_error = Matrix.subtract(target, output);

    // gradient = output(1-output)
    let gradient = Matrix.map(output, this.#dsigmoid);
    gradient.multiply(output_error);
    gradient.multiply(this.learningRate);

    // Calculate weight deltas
    let hidden_T = Matrix.transpose(hidden);
    let weight_ho_deltas = Matrix.multiply(gradient, hidden_T);

    // Apply correction
    this.weights_ho.add(weight_ho_deltas);
    this.bias_o.add(gradient);

    // Hidden Layer ---------------------------------------

    // Calculate the hidden layer errors
    let gradient_o = Matrix.map(output, this.#dsigmoid); // need it again ...
    let weights_ho_T = Matrix.transpose(this.weights_ho);
    output_error.multiply(gradient_o); // I think that piece is missing by shiffman
    let hidden_error = Matrix.multiply(weights_ho_T, output_error);

    // hidden gradient
    let hidden_gradient = Matrix.map(hidden, this.#dsigmoid);
    hidden_gradient.multiply(hidden_error);
    hidden_gradient.multiply(this.learningRate);

    // hidden weight deltas
    let inputs_T = Matrix.transpose(input);
    let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

    // Apply weight correction
    this.weights_ih.add(weight_ih_deltas);
    this.bias_h.add(hidden_gradient);
  }

  serialize() {
    return JSON.stringify(this);
  }

  static deserialize(data) {
    if (typeof data == 'string') {
      data = JSON.parse(data);
    }
    let nn = new NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes);
    nn.weights_ih = Matrix.deserialize(data.weights_ih);
    nn.weights_ho = Matrix.deserialize(data.weights_ho);
    nn.bias_h = Matrix.deserialize(data.bias_h);
    nn.bias_o = Matrix.deserialize(data.bias_o);
    nn.learning_rate = data.learning_rate;
    return nn;
  }
}

export default NeuralNetwork;
