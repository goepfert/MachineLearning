import NeuralNetwork from '../../lib/NeuralNetwork.js';
import Utils from '../../../Utils.js';

let training_data = [
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

let nn = new NeuralNetwork(2, 2, 1);
nn.setLearningRate(0.05);

console.log(nn.predict([0, 0]));
console.log(nn.predict([1, 0]));
console.log(nn.predict([0, 1]));
console.log(nn.predict([1, 1]));

for (let i = 0; i < 100000; i++) {
  let data_idx = Math.floor(Utils.getRandomArbitrary(0, 3) + 0.5);
  nn.train(training_data[data_idx].input, training_data[data_idx].target);
}

console.log('--------');
console.log(nn.predict([0, 0]));
console.log(nn.predict([1, 0]));
console.log(nn.predict([0, 1]));
console.log(nn.predict([1, 1]));

// saving
Utils.download(nn.serialize(), 'nn_1');

// load
document.getElementById('file-load').addEventListener('change', handleFileSelect_load, false);
function handleFileSelect_load(evt) {
  const file = evt.target.files[0];
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    console.log(event.target.result);

    let loadedNN = NeuralNetwork.deserialize(event.target.result);

    console.log('--------');
    console.log(loadedNN.predict([0, 0]));
    console.log(loadedNN.predict([1, 0]));
    console.log(loadedNN.predict([0, 1]));
    console.log(loadedNN.predict([1, 1]));
  });

  reader.readAsText(file);
}
