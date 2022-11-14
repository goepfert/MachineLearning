function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

class NeuralNetwork {
  constructor(numberOfInputNodes, numberOfHiddenNodes, numberOfOutputNodes) {
    this.input_nodes = numberOfInputNodes;
    this.hidden_nodes = numberOfHiddenNodes;
    this.output_nodes = numberOfOutputNodes;

    this.weights_input_hidden = new Matrix(this.hidden_nodes, this.input_nodes);
    this.weights_input_hidden.randomize();
    this.bias_hidden = new Matrix(this.hidden_nodes, 1);
    this.bias_hidden.randomize();

    this.weights_hidden_output = new Matrix(this.output_nodes, this.hidden_nodes);
    this.weights_hidden_output.randomize();
    this.bias_output = new Matrix(this.output_nodes, 1);
    this.bias_output.randomize();
  }

  // expecting array as input type
  feedForward(input) {
    let input_matrix = Matrix.fromArray(input);
    let hidden = Matrix.multiply(this.weights_input_hidden, input_matrix);
    hidden.add(this.bias_hidden);
    hidden.map(sigmoid);
    //console.table(hidden.data);

    let output = Matrix.multiply(this.weights_hidden_output, hidden);
    output.add(this.bias_output);
    output.map(sigmoid);
    // console.table(output.data);

    return output.toArray();
  }

  train(inputs, targets) {
    let outputs = this.feedForward(inputs);

    outputs = Matrix.fromArray(outputs);
    outputs.print();
    targets = Matrix.fromArray(targets);
    targets.print();

    // // Calculate the error
    let error = Matrix.subtract(targets, outputs);
    error.print();
  }
}
