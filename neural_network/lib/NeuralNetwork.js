class NeuralNetwork {
  constructor(numberOfInputNodes, numberOfHiddenNodes, numberOfOutputNodes) {
    this.input_nodes = numberOfInputNodes;
    this.hidden_nodes = numberOfHiddenNodes;
    this.output_nodes = numberOfOutputNodes;

    this.weights_input_hidden = new Matrix(this.hidden_nodes, this.input_nodes);
    this.weights_input_hidden.randomize();
    this.weights_hidden_output = new Matrix(this.output_nodes, this.hidden_nodes);
    this.weights_hidden_output.randomize();
  }

  print() {
    console.table(this.weights_hidden_output.data);
    console.table(this.weights_input_hidden.data);
  }
}
