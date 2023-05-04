/**
 * Greatly inspired by https://towardsdatascience.com/practical-guide-for-dqn-3b70b1d759bf
 * and https://github.com/tensorflow/tfjs-examples/tree/master/snake-dqn
 */

import Cartpole from './src/Cartpole.js';
import ReplayBuffer from './src/ReplayBuffer.js';
import Utils from '../../Utils.js';
import globals from './globalVar.js';
import { createDeepQNetwork, copyWeights } from './src/dqn.js';

tf.setBackend('cpu');

const height = 300;
const width = 500;
const frameRate = 30;

let svgContainer = d3.select('#cartpole-drawing').attr('height', height).attr('width', width);
let cartpole = new Cartpole(svgContainer, { dt: 0.01, forceMult: 5, g: 1 });

// Create two identical networks
const nn_online_model = createDeepQNetwork(2);
const nn_target_model = createDeepQNetwork(2);
copyWeights(nn_target_model, nn_online_model, 1);
nn_target_model.trainable = false;

// After how many training iterations the online will by synced to the target network
// If you use smooth transitions (tau<1) it can be set to 1
const syncEveryFrame = 1;

nn_online_model.summary();
nn_target_model.summary();

// Create ReplayBuffer
const replayBufferSize = 100000;
const replayBuffer = new ReplayBuffer(replayBufferSize);

// Training
let resetNextIter = true; // Reset next iteration
const batchSize = 32; //replayBufferSize / 2; // Sample size for parallel training, 32
const learningRate = 0.005; // for optimizer
const discountRate = 0.98;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.01;
const decay_rate = 0.01;
const trainingIterations = 100000; // How many batches will be trained

let isTrained = false;
let gameID;
let nSteps = 0;

/**
 * The Target NN tries it's best. Look how cute ...
 */
function tryToBalance() {
  let action = 0;
  //let res = [];
  tf.tidy(() => {
    const stateTensor = cartpole.getStateTensor();
    // https://www.tensorflow.org/api_docs/python/tf/math/argmax
    //res = nn_target_model.predict(stateTensor).dataSync().slice();
    const actionIdx = nn_target_model.predict(stateTensor).argMax(-1).dataSync()[0];
    action = globals.actions[actionIdx];
  });
  Utils.assert(action == -1 || action == 1, `action jackson ${action}`);
  console.log('le action:', action);
  cartpole.step(action);
}

/**
 * Main Loop where the network tries to balance on it's own.
 */
function gameLoop() {
  tryToBalance();
  const { state, reward, done } = cartpole.getCurrentState();
  if (done) {
    clearInterval(gameID);
    console.log('last state: ', state);
  }
  document.getElementById('stepP').innerHTML = 'Step: ' + nSteps;
  document.getElementById('rewardP').innerHTML = 'Reward: ' + reward.toFixed(1);
  document.getElementById('doneP').innerHTML = 'Done: ' + done;
  cartpole.render((1 / frameRate) * 1000);
  nSteps++;
}

/**
 * Play one step and append it to the replayBuffer
 */
function playOneStep(explore_only = false) {
  if (resetNextIter) {
    // console.log('resetting cartpole');
    epsilon = epsilon_max;
    // cartpole.random(); // a little bit mor randomness while training
    cartpole.reset(); // or just reset the cartpole?
    resetNextIter = false;
  }

  const { state: currentState } = cartpole.getCurrentState();
  let action = 0;
  let actionIdx = -1;

  // Exploit or explore
  let rnd = Math.random();

  // Quick hack to ensure exploration
  if (explore_only) rnd = 0;

  if (rnd > epsilon) {
    // console.log('exploit');
    tf.tidy(() => {
      const stateTensor = cartpole.getStateTensor();
      actionIdx = nn_online_model.predict(stateTensor).argMax(-1).dataSync()[0];
      // actionIdx = nn_target_model.predict(stateTensor).argMax(-1).dataSync()[0];
      action = globals.actions[actionIdx];
    });
  } else {
    // console.log('explore');
    actionIdx = Utils.getRandomInt(0, 1);
    action = globals.actions[actionIdx];
  }
  Utils.assert(action == -1 || action == 1, `action jackson ${action}`);
  const { state: nextState, reward, done } = cartpole.step(action);

  replayBuffer.append([currentState, actionIdx, reward, nextState, done]);

  // Reduce/Decay epsilon
  epsilon = epsilon * (1 - decay_rate);
  if (epsilon < epsilon_min) {
    epsilon = epsilon_min;
  }

  if (done) {
    resetNextIter = true;
  }
}

/**
 * Create sequence with pure exploration and fill ReplayMemory
 */
function createSequence() {
  console.log('creating sequence ...');
  let counter = replayBufferSize;

  while (counter > 0) {
    playOneStep(true);
    counter--;
  }

  console.log(replayBuffer);
  console.log('finished creating sequence');
}

/**
 * Train on batch taken from the replayBuffer
 * Fun with tensors ...
 */
function trainOnReplayBatch(optimizer) {
  const batch = replayBuffer.sample(batchSize);

  // console.log(nn_online_model.getWeights()[0].dataSync());
  // console.log(nn_target_model.getWeights()[0].dataSync());

  // Define the loss function
  const lossFunction = () =>
    tf.tidy(() => {
      // item[0] state
      // item[1] actionIdx (index, not the q(action) value itself)
      // item[2] reward of next state
      // item[3] next state
      // item[4] done
      const stateTensor = tf.tensor(
        batch.map((item) => Object.values(item[0])),
        [batchSize, 4]
      );
      const actionTensor = tf.tensor1d(
        batch.map((item) => item[1]),
        'int32'
      );
      // Compute Q value of the current state
      // Note that we use apply() instead of predict because apply() allow access to the gradient
      const online = nn_online_model.apply(stateTensor, { training: true });
      const oneHot = tf.oneHot(actionTensor, globals.actions.length);
      const qs = online.mul(oneHot).sum(-1); //https://stackoverflow.com/questions/59702785/what-does-dim-1-or-2-mean-in-torch-sum, we are dealing with batches

      // Compute the Q value of the next state.
      // It is R if the next state is terminal and R + max Q(next_state) if the next state is not terminal
      const rewardTensor = tf.tensor1d(batch.map((item) => item[2]));
      const nextStateTensor = tf.tensor(
        batch.map((item) => Object.values(item[3])),
        [batchSize, 4]
      );
      const nextMaxQTensor = nn_target_model.predict(nextStateTensor).max(-1);
      const status = tf.tensor1d(batch.map((item) => item[4])).asType('float32');
      // If terminal state then status = 1 => doneMask = 0
      // If not terminal then status = 0 => doneMask = 1
      // This will make nextMaxQTensor.mul(doneMask) either 0 or not
      const doneMask = tf.scalar(1).sub(status);
      const targetQs = rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(discountRate));

      // Define the mean square error between Q value of current state and target Q value
      const mse = tf.losses.meanSquaredError(targetQs, qs);
      return mse;
    });

  // Calculate the gradients of the loss function with respect to the weights of the online DQN.
  const grads = tf.variableGrads(lossFunction);
  // Use the gradients to update the online DQN's
  optimizer.applyGradients(grads.grads);

  // console.log(nn_online_model.getWeights()[0].dataSync());
  // console.log(nn_target_model.getWeights()[0].dataSync());
  // copyWeights(nn_target_model, nn_online_model, 0.5);
  // console.log(nn_online_model.getWeights()[0].dataSync());
  // console.log(nn_target_model.getWeights()[0].dataSync());

  tf.dispose(grads);
}

/**
 * Training function
 * Adds one new data point to the replayMemory (which is a ringbuffer)
 */
function train() {
  const optimizer = tf.train.adam(learningRate);
  resetNextIter = true;

  // Training Iterations
  for (let idx = 0; idx < trainingIterations; idx++) {
    if (idx % 500 == 0) {
      console.log(`training iteration ${idx} \ ${trainingIterations}`);
      // console.log('numTensors', tf.memory().numTensors);
    }

    trainOnReplayBatch(optimizer);

    // It's enough to add only one new step per training iteration
    playOneStep();

    if (idx % syncEveryFrame === 0) {
      // console.log(`syncing networks every ${syncEveryFrame} frames`);
      copyWeights(nn_target_model, nn_online_model);
    }
  }

  copyWeights(nn_target_model, nn_online_model);
  console.log('training finished');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('train-button').addEventListener('click', async (e) => {
    if (!isTrained) {
      // Create sequence and fill ReplayMemory
      createSequence();
      // Train loop
      train();

      isTrained = true;
      document.getElementById('trainedP').innerHTML = ' training finished, hit Spacebar to start/reset pole';
    }
  });

  document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
      // Spacebar
      case 32:
        if (!isTrained) {
          console.log('not trained yet');
          break;
        }
        nSteps = 0;
        clearInterval(gameID);
        cartpole.reset();
        gameID = setInterval(() => {
          gameLoop();
        }, (1 / frameRate) * 1000);
        break;
      default:
        break;
    }
  });
});
