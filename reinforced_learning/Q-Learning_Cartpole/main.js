import Cartpole from './src/Cartpole.js';
import Utils from '../../Utils.js';
import globals from './globalVar.js';

const height = 300;
const width = 500;
const frameRate = 30;

let svgContainer = d3.select('#cartpole-drawing').attr('height', height).attr('width', width);
let cartpole = new Cartpole(svgContainer, { dt: 0.01, forceMult: 5, g: 1 });

const N_episodes_max = 400000;
const N_steps_max = 1000;

const learning_rate = 0.95;
const discount_rate = 0.99;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.05;
const decay_rate = 0.025;

let trained = false;
let gameID;
let nSteps = 0;

// const n_bins = 750; // number of states (5x5x6x5)
const n_bins = 162; // number of states (3x3x6x3)
let qTable = Array(n_bins)
  .fill()
  .map(() => Array(2).fill(0));

// https://pages.cs.wisc.edu/~finton/qcontroller.html
function getBin(state) {
  const x = state.x;
  const theta = state.theta;
  const x_dot = state.xdot;
  const theta_dot = state.thetadot;
  let bin = 0;

  // 162 bins
  if (x < -0.8) bin = 0;
  else if (x < 0.8) bin = 1;
  else bin = 2;

  if (x_dot < -0.5);
  else if (x_dot < 0.5) bin += 3;
  else bin += 6;

  if (theta < -globals.six_degrees);
  else if (theta < -globals.one_degree) bin += 9;
  else if (theta < 0) bin += 18;
  else if (theta < globals.one_degree) bin += 27;
  else if (theta < globals.six_degrees) bin += 36;
  else bin += 45;

  if (theta_dot < -globals.fifty_degrees);
  else if (theta_dot < globals.fifty_degrees) bin += 54;
  else bin += 108;

  /**
   * 750 bins ... too much
   */
  // if (x < -1) bin = 0;
  // else if (x < -0.3) bin = 1;
  // else if (x < 0.3) bin = 2;
  // else if (x < 0.5) bin = 3;
  // else bin = 4;

  // if (x_dot < -0.7);
  // else if (x_dot < -0.2) bin += 5;
  // else if (x_dot < 0.2) bin += 10;
  // else if (x_dot < 0.7) bin += 15;
  // else bin += 20;

  // if (theta < -globals.six_degrees);
  // else if (theta < -globals.one_degree) bin += 25;
  // else if (theta < 0) bin += 50;
  // else if (theta < globals.one_degree) bin += 75;
  // else if (theta < globals.six_degrees) bin += 100;
  // else bin += 125;

  // if (theta_dot < -globals.fifty_degrees);
  // else if (theta_dot < -globals.twelve_degrees) bin += 150;
  // else if (theta_dot < globals.twelve_degrees) bin += 300;
  // else if (theta_dot < globals.fifty_degrees) bin += 450;
  // else bin += 600;

  return bin;
}

// The Cartpole does never get an action of zero ...
async function trainLoop() {
  console.log('start training loop ...');
  for (let episodeIdx = 1; episodeIdx <= N_episodes_max; episodeIdx++) {
    if (episodeIdx % 1000 == 0) {
      //console.log('starting epside:', episodeIdx, ' of ', N_episodes_max);
      //console.log('starting new episode ', episodeIdx, ' / ', N_episodes_max);
      document.getElementById('trainedP').innerHTML = `training ... ${episodeIdx} / ${N_episodes_max}`;
      await Utils.sleep_ms(1);
    }
    epsilon = epsilon_max;
    // cartpole.reset();
    cartpole.random();

    for (let stepIdx = 0; stepIdx < N_steps_max; stepIdx++) {
      const { state: currentState } = cartpole.getCurrentState();
      const bin = getBin(currentState);

      let q_value;
      let actionIdx = -1;
      let action = -1;

      // Exploit or explore
      let rnd = Math.random();
      if (rnd > epsilon) {
        // console.log('exploit');
        q_value = Math.max(...qTable[bin]);
        Utils.assert(q_value != -1, `something went wrong, q_value is ${q_value}`);
        actionIdx = qTable[bin].indexOf(q_value);
      } else {
        // console.log('explore');
        const rndIdx = Utils.getRandomInt(0, 1);
        q_value = qTable[bin][rndIdx];
        actionIdx = rndIdx;
      }

      // to get the real action
      if (actionIdx == 1) action = 1;

      Utils.assert(action == -1 || action == 1, `action jackson ${action}`);
      const { state: newState, reward, done } = cartpole.step(action);
      const newBin = getBin(newState);

      // console.log(bin, newBin);

      // Update current/previous Q-value
      const max_q_prime = Math.max(...qTable[newBin]);
      Utils.assert(max_q_prime != -1, `something went wrong, q_value is ${max_q_prime}`);
      const new_q_value = q_value + learning_rate * (reward + discount_rate * max_q_prime - q_value);

      qTable[bin][actionIdx] = new_q_value;

      // Reduce/Decay epsilon
      epsilon = epsilon * (1 - decay_rate);
      if (epsilon < epsilon_min) {
        epsilon = epsilon_min;
      }

      if (done) {
        // console.log('Exit current episode with reward: ', reward, ', stepIdx / nMaxSteps', stepIdx, N_steps_max);
        // console.log(newState);
        break;
      }
    } // END one episode
  } // END all episodes

  console.table(qTable);
  console.log('training finished');
}

function tryToBalance() {
  const { state: currentState } = cartpole.getCurrentState();
  const bin = getBin(currentState);
  let q_value;
  let actionIdx = -1;
  let action = -1;

  q_value = Math.max(...qTable[bin]);
  Utils.assert(q_value != -1, `something went wrong, q_value is ${q_value}`);
  actionIdx = qTable[bin].indexOf(q_value);
  // to get the real action
  if (actionIdx == 1) action = 1;
  //console.log('action', action);
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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('train-button').addEventListener('click', async (e) => {
    if (!trained) {
      await trainLoop();
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
