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

// Create networks
const nn_online_model = createDeepQNetwork(2).getModel();
const nn_target = createDeepQNetwork(2);
const nn_target_model = nn_target.getModel();
const syncEveryFrame = 5;

// Create ReplayBuffer
const replayBufferSize = 500;
const replayBuffer = new ReplayBuffer(replayBufferSize);

// Training
let resetNextIter = true; // Reset next iteration
const batchSize = replayBufferSize / 2; // Sample size for parallel training
const learningRate = 0.1;
const discountRate = 0.99;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.05;
const decay_rate = 0.025;
const trainingIterations = 20000;

let isTrained = false;
let gameID;
let nSteps = 0;

function tryToBalance() {
  let action = 0;
  tf.tidy(() => {
    const stateTensor = cartpole.getStateTensor();
    // https://www.tensorflow.org/api_docs/python/tf/math/argmax
    const actionIdx = nn_target_model.predict(stateTensor).argMax(-1).dataSync()[0];
    action = globals.actions[actionIdx];
  });
  Utils.assert(action == -1 || action == 1, `action jackson ${action}`);
  console.log('action:', action);
  cartpole.step(action);
}

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
function playOneStep() {
  if (resetNextIter) {
    // console.log('resetting cartpole');
    epsilon = epsilon_max;
    cartpole.random(); // a little bit mor randomness while training
    resetNextIter = false;
  }

  const { state: currentState } = cartpole.getCurrentState();
  let action = 0;
  let actionIdx = -1;

  // Exploit or explore
  let rnd = Math.random();
  if (rnd > epsilon) {
    // console.log('exploit');
    tf.tidy(() => {
      const stateTensor = cartpole.getStateTensor();
      // https://www.tensorflow.org/api_docs/python/tf/math/argmax
      actionIdx = nn_online_model.predict(stateTensor).argMax(-1).dataSync()[0];
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
    playOneStep();
    counter--;
  }

  console.log(replayBuffer);
  console.log('finished creating sequence');
}

/**
 * Train on batch of replayMemory
 */
function trainOnReplayBatch(optimizer) {
  const batch = replayBuffer.sample(batchSize);

  // Define the loss function
  const lossFunction = () =>
    tf.tidy(() => {
      // item[0] state
      // item[1] action
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
      const qs = online.mul(oneHot).sum(-1);

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

  tf.dispose(grads);
}

/**
 * Training
 */
function train() {
  const optimizer = tf.train.adam(learningRate);
  resetNextIter = true;

  // Training Iterations
  for (let idx = 0; idx < trainingIterations; idx++) {
    if (idx % 200 == 0) {
      console.log(`training iteration ${idx} \ ${trainingIterations}`);
      // console.log('numTensors', tf.memory().numTensors);
    }

    trainOnReplayBatch(optimizer);
    playOneStep();

    if (idx % syncEveryFrame === 0) {
      console.log(`syncing networks every ${syncEveryFrame} frames`);
      copyWeights(nn_target_model, nn_online_model);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('train-button').addEventListener('click', async (e) => {
    if (!isTrained) {
      // Create sequence and fill ReplayMemory
      createSequence();
      // Train loop
      train();

      isTrained = true;
      document.getElementById('trainedP').innerHTML = ' training finised, hit Spacebar to start/reset pole';
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
