import Cartpole from './src/Cartpole.js';
import ReplayMemory from './src/ReplayMemory.js';
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
const nn_online = createDeepQNetwork(2);
const nn_target = createDeepQNetwork(2);
const syncEveryFrame = 100;

// Create ReplayMemory
const replayBufferSize = 1000;
const replayMemory = new ReplayMemory(replayBufferSize);

// Training
let reset = true;
const batchSize = 200;
const learning_rate = 0.95;
const discount_rate = 0.99;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.05;
const decay_rate = 0.025;
const trainingIterations = 20000;

let trained = false;
let gameID;
let nSteps = 0;

function tryToBalance() {
  const { state: currentState } = cartpole.getCurrentState();
  let action = -1;

  tf.tidy(() => {
    const stateTensor = cartpole.getStateTensor();
    // https://www.tensorflow.org/api_docs/python/tf/math/argmax
    action = globals.actions[nn_target.getModel().predict(stateTensor).argMax(-1).dataSync()[0]];
  });
  Utils.assert(action == -1 || action == 0 || action == 1, `action jackson ${action}`);
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
 * Play one step
 */
function playOneStep(nn_online_model, replayMemory) {
  if (reset) {
    epsilon = epsilon_max;
    cartpole.random(); // a little bit mor randomness while training
    reset = false;
  }

  const { state: currentState } = cartpole.getCurrentState();
  let action = 0;

  // Exploit or explore
  let rnd = Math.random();
  if (rnd > epsilon) {
    // console.log('exploit');
    tf.tidy(() => {
      const stateTensor = cartpole.getStateTensor();
      // https://www.tensorflow.org/api_docs/python/tf/math/argmax
      action = globals.actions[nn_online_model.predict(stateTensor).argMax(-1).dataSync()[0]];
    });
  } else {
    // console.log('explore');
    const rndIdx = Utils.getRandomInt(0, 1);
    action = globals.actions[rndIdx];
  }

  Utils.assert(action == -1 || action == 1, `action jackson ${action}`);
  const { state: newState, reward, done } = cartpole.step(action);

  replayMemory.append([currentState, action, reward, newState, done]);

  // Reduce/Decay epsilon
  epsilon = epsilon * (1 - decay_rate);
  if (epsilon < epsilon_min) {
    epsilon = epsilon_min;
  }

  if (done) {
    reset = true;
  }
}

/**
 * Create sequence with pure exploration and fill ReplayMemory
 */
function createSequence(nn_online_model, replayMemory) {
  console.log('creating sequence ...');
  let counter = replayBufferSize;

  while (counter > 0) {
    playOneStep(nn_online_model, replayMemory);
    counter--;
  }

  console.log(replayMemory);

  console.log('finished creating sequence');
}

/**
 * Train on batch of replayMemory
 */
function trainOnReplayBatch(nn_online_model, nn_target_model, batchSize, optimizer) {
  const batch = replayMemory.sample(batchSize);

  // //define the loss function
  const lossFunction = () =>
    tf.tidy(() => {
      // example[0] is the state
      // example[1] is the action
      // example[2] is the reward
      // example[3] is the next state
      // example[4] done
      // const stateTensor = getStateTensors(batch.map((example) => example[0]));
      const stateTensor = tf.tensor(
        batch.map((example) => Object.values(example[0])),
        [batchSize, 4]
      );
      const actionTensor = tf.tensor1d(
        batch.map((example) => example[1]),
        'int32'
      );

      // compute Q value of the current state
      // note that we use apply() instead of predict
      // because apply() allow access to the gradient
      const online = nn_online_model.apply(stateTensor, { training: true });
      const oneHot = tf.oneHot(actionTensor, globals.actions.length);
      const qs = online.mul(oneHot).sum(-1);

      // compute the Q value of the next state.
      // it is R if the next state is terminal
      // R + max Q(next_state) if the next state is not terminal
      const rewardTensor = tf.tensor1d(batch.map((example) => example[2]));
      // const nextStateTensor = getStateTensor(batch.map((example) => example[3]));
      const nextStateTensor = tf.tensor(
        batch.map((example) => Object.values(example[3])),
        [batchSize, 4]
      );
      const nextMaxQTensor = nn_target_model.predict(nextStateTensor).max(-1);
      const status = tf.tensor1d(batch.map((example) => example[4])).asType('float32');
      // if terminal state then status = 1 => doneMask = 0
      // if not terminal then status = 0 => doneMask = 1
      // this will make nextMaxQTensor.mul(doneMask) either 0 or not
      const doneMask = tf.scalar(1).sub(status);
      const targetQs = rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(discount_rate));

      // define the mean square error between Q value of current state
      // and target Q value
      const mse = tf.losses.meanSquaredError(targetQs, qs);
      return mse;
    });
  // Calculate the gradients of the loss function with respect
  // to the weights of the online DQN.
  const grads = tf.variableGrads(lossFunction);
  // Use the gradients to update the online DQN's
  optimizer.applyGradients(grads.grads);

  tf.dispose(grads);
}

/**
 * Training
 */
function train(nn_online_model, nn_target_model, _batchSize, maxIterations) {
  const optimizer = tf.train.adam(learning_rate);

  reset = true;

  // Training Iterations
  for (let idx = 0; idx < maxIterations; idx++) {
    trainOnReplayBatch(nn_online_model, nn_target_model, batchSize, optimizer);

    playOneStep(nn_online_model, replayMemory);

    if (idx % syncEveryFrame === 0) {
      console.log('sync');
      copyWeights(nn_target_model, nn_online_model);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('train-button').addEventListener('click', async (e) => {
    if (!trained) {
      // Create sequence and fill ReplayMemory
      createSequence(nn_online.getModel(), replayMemory); // which network should ne matter here

      // Train loop
      train(nn_online.getModel(), nn_target.getModel(), batchSize, trainingIterations);

      trained = true;
      document.getElementById('trainedP').innerHTML = ' training finised, hit Spacebar to start/reset pole';
    }
  });

  document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
      // Spacebar
      case 32:
        if (!trained) {
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

  // document.getElementById('cartpole-drawing').addEventListener('click', (e) => {
  //   if (!trained) return;
  //   nSteps = 0;
  //   clearInterval(gameID);
  //   cartpole.reset();
  //   gameID = setInterval(() => {
  //     gameLoop();
  //   }, (1 / frameRate) * 1000);
  // });
});
