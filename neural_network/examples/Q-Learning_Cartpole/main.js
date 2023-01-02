//https://github.com/UpsetHoneyBadger/cartpole-js
import Cartpole from './src/Cartpole.js';
import Utils from '../../../Utils.js';

const height = 300;
const width = 500;
const frameRate = 10;

let svgContainer = d3.select('#cartpole-drawing').attr('height', height).attr('width', width);
let cartpole = new Cartpole(svgContainer, { dt: 0.01, forceMult: 10 });

const n_bins = 162; // number of states
const N_episodes_max = 1000;
const N_steps_max = 200;

const learning_rate = 0.8;
const discount_rate = 0.95;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.1;
const decay_rate = 0.001;

let gameID;

let qTable = Array(n_bins)
  .fill()
  .map(() => Array(2).fill(0));

// https://pages.cs.wisc.edu/~finton/qcontroller.html
const one_degree = 0.0174532; /* 2pi/360 */
const six_degrees = 0.1047192;
const twelve_degrees = 0.2094384;
const fifty_degrees = 0.87266;
function getBin(state) {
  const x = state.x;
  const theta = state.theta;
  const x_dot = state.xdot;
  const theta_dot = state.thetadot;
  let bin = 0;

  if (x < -2.4 || x > 2.4 || theta < -twelve_degrees || theta > twelve_degrees) {
    //return -1; /* signal failure */
  }

  if (x < -0.8) bin = 0;
  else if (x < 0.8) bin = 1;
  else bin = 2;

  if (x_dot < -0.5);
  else if (x_dot < 0.5) bin += 3;
  else bin += 6;

  if (theta < -six_degrees);
  else if (theta < -one_degree) bin += 9;
  else if (theta < 0) bin += 18;
  else if (theta < one_degree) bin += 27;
  else if (theta < six_degrees) bin += 36;
  else bin += 45;

  if (theta_dot < -fifty_degrees);
  else if (theta_dot < fifty_degrees) bin += 54;
  else bin += 108;

  return bin;
}

async function trainLoop() {
  for (let episodeIdx = 0; episodeIdx < N_episodes_max; episodeIdx++) {
    console.log('starting new episode ', episodeIdx, ' / ', N_episodes_max);
    epsilon = epsilon_max;
    cartpole.setRandom();

    for (let stepIdx = 0; stepIdx < N_steps_max; stepIdx++) {
      const { state: currentState } = cartpole.getCurrentState();
      const bin = getBin(currentState);

      let q_value;
      let action = -1;

      // Exploit or explore
      let rnd = Math.random();
      if (rnd > epsilon) {
        // console.log('exploit');
        q_value = Math.max(...qTable[bin]);
        Utils.assert(q_value != -1, `something went wrong, q_value is ${q_value}`);
        action = qTable[bin].indexOf(q_value);
      } else {
        // console.log('explore');
        const rndIdx = Utils.getRandomInt(0, 1);
        q_value = qTable[bin][rndIdx];
        action = rndIdx;
      }

      Utils.assert(action == 0 || action == 1, `action jackson ${action}`);
      const { state: newState, reward, done } = cartpole.step(action);

      const newBin = getBin(newState);

      // console.log(bin, newBin);

      // Update current/previous Q-value
      const max_q_prime = Math.max(...qTable[newBin]);
      Utils.assert(max_q_prime != -1, `something went wrong, q_value is ${max_q_prime}`);
      const new_q_value = q_value + learning_rate * (reward + discount_rate * max_q_prime - q_value);

      qTable[bin][action] = new_q_value;

      // Reduce/Decay epsilon
      epsilon = epsilon * (1 - decay_rate);
      if (epsilon < epsilon_min) {
        epsilon = epsilon_min;
      }

      if (done) {
        console.log('Exit current episode: ', reward, ', episodeIdx / N_episodes_max', episodeIdx, N_episodes_max);
        break;
      }
    } // END one episode

    if (episodeIdx % 10 == 0) {
      // document.getElementById('rewardP').innerHTML = 'Reward: ' + reward;
      // document.getElementById('doneP').innerHTML = 'Done: ' + done;
      cartpole.render((1 / frameRate) * 1000);
      await Utils.sleep_ms(100); // quick fix for image loading
    }
  } // END all episodes

  console.table(qTable);
}

function show() {
  const { state: currentState } = cartpole.getCurrentState();
  const bin = getBin(currentState);
  let q_value;
  let action = -1;

  q_value = Math.max(...qTable[bin]);
  Utils.assert(q_value != -1, `something went wrong, q_value is ${q_value}`);
  action = qTable[bin].indexOf(q_value);
  console.log('🚀 ~ file: main.js:140 ~ show ~ action', action);
  Utils.assert(action == 0 || action == 1, `action jackson ${action}`);
  cartpole.step(action);
}

document.addEventListener('DOMContentLoaded', async () => {
  await trainLoop();
  cartpole.reset();
  cartpole.setRandom();

  gameID = setInterval(() => {
    show();
    const { reward, done } = cartpole.getCurrentState();
    if (done) {
      //clearInterval(gameID);
    }
    document.getElementById('rewardP').innerHTML = 'Reward: ' + reward;
    document.getElementById('doneP').innerHTML = 'Done: ' + done;
    cartpole.render((1 / frameRate) * 1000);
  }, (1 / frameRate) * 1000);
});
