// Data
const x_vals = Array.from(Array(10).keys());
const y_vals = [];

x_vals.forEach((x_val) => {
  const rnd = Math.random() * 0.1 - 0.01 / 2;
  y_vals.push(rnd + x_val);
});

// console.log(x_vals);
// console.log(y_vals);

// Model parameters
let m = tf.variable(tf.scalar(Math.random()));
let n = tf.variable(tf.scalar(Math.random()));

// Prediction
const predict = (x) => {
  const xs = tf.tensor1d(x);
  // y = mx + n
  const ys = xs.mul(m).add(n);
  return ys;
};

// Optimizer
const learningRate = 0.01;
const optimizer = tf.train.sgd(learningRate);

// Loss function
const loss = (pred, meas) => {
  return pred.sub(meas).square().mean();
};

// 'Train' the model
for (let i = 0; i < 1000; i++) {
  optimizer.minimize(() => loss(predict(x_vals), tf.tensor1d(y_vals)));
}

console.log('y = ', m.dataSync()[0], 'x + ', n.dataSync()[0]);
