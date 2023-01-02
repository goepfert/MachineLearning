//https://github.com/UpsetHoneyBadger/cartpole-js
import Cartpole from '../src/Cartpole.js';

const height = 300;
const width = 500;
const frameRate = 30;

let svgContainer = d3.select('#cartpole-drawing').attr('height', height).attr('width', width);
let cartpole = new Cartpole(svgContainer, { dt: 0.01, forceMult: 10 });
cartpole.reset();

let action = 0;

const n_boxes = 162; // number of states

const N_episodes_max = 20000;
const N_steps_max = 150;

const learning_rate = 0.8;
const discount_rate = 0.95;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.1;
const decay_rate = 0.001;

let qTable = Array(162)
  .fill()
  .map(() => Array(2).fill(0));

// https://pages.cs.wisc.edu/~finton/qcontroller.html
const one_degree = 0.0174532; /* 2pi/360 */
const six_degrees = 0.1047192;
const twelve_degrees = 0.2094384;
const fifty_degrees = 0.87266;
function getBox(state) {
  const x = state.x;
  const theta = state.theta;
  const x_dot = state.xdot;
  const theta_dot = state.thetadot;

  console.log('state', x, theta, x_dot, theta_dot);

  let box = 0;

  if (x < -2.4 || x > 2.4 || theta < -twelve_degrees || theta > twelve_degrees) {
    return -1; /* signal failure */
  }

  if (x < -0.8) box = 0;
  else if (x < 0.8) box = 1;
  else box = 2;

  if (x_dot < -0.5);
  else if (x_dot < 0.5) box += 3;
  else box += 6;

  if (theta < -six_degrees);
  else if (theta < -one_degree) box += 9;
  else if (theta < 0) box += 18;
  else if (theta < one_degree) box += 27;
  else if (theta < six_degrees) box += 36;
  else box += 45;

  if (theta_dot < -fifty_degrees);
  else if (theta_dot < fifty_degrees) box += 54;
  else box += 108;

  return box;
}

function trainLoop() {
  for (let episodeIdx = 0; episodeIdx < N_episodes_max; episodeIdx++) {
    console.log('starting new episode ', episodeIdx, ' / ', N_episodes_max);
    epsilon = epsilon_max;
    cartpole.reset();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setInterval(() => {
    const { state, reward, done } = cartpole.step(action);
    console.log('box', getBox(state));
    document.getElementById('rewardP').innerHTML = 'Reward: ' + reward;
    document.getElementById('doneP').innerHTML = 'Done: ' + done;
    cartpole.render((1 / frameRate) * 1000);
  }, (1 / frameRate) * 1000);

  document.getElementById('reset-button').addEventListener('click', (e) => {
    c.reset();
  });
  document.getElementById('cartpole-drawing').addEventListener('click', (e) => {
    c.reset();
  });

  document.getElementById('cartpole-drawing').addEventListener('mousemove', (e) => {
    let boundingRect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - boundingRect.left - width / 2;

    if (mouseX > 0) {
      action = 1;
    } else {
      action = 0;
    }
  });
});
