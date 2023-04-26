import { MovingDirection } from './MovingDirection.js';
import { createTileMap } from './TileMap.js';
import Utils from '../../../Utils.js';

const tileSize = 32;
const velocity = 32;

const comment = document.getElementById('comment');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tileMap;
let pacman;
let gameID = 0;

const N_episodes_max = 5000;
const N_steps_max = 150;

const learning_rate = 0.9;
const discount_rate = 0.95;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.2;
const decay_rate = 0.001;

async function init() {
  tileMap = createTileMap(tileSize);
  tileMap.setCanvasSize(canvas);
  pacman = tileMap.getNewPacman(velocity);
  epsilon = epsilon_max;

  await sleep(100); // quick fix for image loading
  tileMap.draw(ctx);
  pacman.draw(ctx);
}

async function trainLoop() {
  for (let episodeIdx = 0; episodeIdx < N_episodes_max; episodeIdx++) {
    console.log('starting new episode ', episodeIdx, ' / ', N_episodes_max);
    // Reset epsilon, tilemap and position of agent pacman
    epsilon = epsilon_max;
    tileMap.initTileMap();
    pacman = tileMap.getNewPacman(velocity);

    for (let stepIdx = 0; stepIdx < N_steps_max; stepIdx++) {
      tileMap.draw(ctx);
      pacman.draw(ctx);
      await sleep(100);
      return;

      // Choose action of current state
      const currentState = tileMap.getCurrentState();
      const currentPosition = pacman.getPosition();
      let newMovingDirection;
      let q_value;

      // Exploit or explore
      let rnd = Math.random();
      if (rnd > epsilon) {
        // console.log('exploit');
        q_value = Math.max(...currentState);
        Utils.assert(q_value != -1, `something went wrong, q_value is ${q_value}`);
        newMovingDirection = currentState.indexOf(q_value);
      } else {
        // console.log('explore');
        const rndIdx = getNewRandomMovingDirection(currentState);
        q_value = currentState[rndIdx];
        newMovingDirection = rndIdx;
      }

      // console.log(newMovingDirection);
      // Move agent pacman to new position/state
      pacman.move(newMovingDirection);

      // Obtain max action and reward from new position
      const newState = tileMap.getCurrentState();
      const reward = tileMap.getReward(false);

      // Update current/previous Q-value
      const max_q_prime = Math.max(...newState);
      Utils.assert(max_q_prime != -1, `something went wrong, q_value is ${max_q_prime}`);
      const new_q_value = q_value + learning_rate * (reward + discount_rate * max_q_prime - q_value);

      //tileMap.setQValue(new_q_value, currentPosition.x, currentPosition.y, newMovingDirection);
      currentState[newMovingDirection] = new_q_value;

      // Reduce/Decay epsilon
      epsilon = epsilon * (1 - decay_rate);
      if (epsilon < epsilon_min) {
        epsilon = epsilon_min;
      }

      // Check if episode ends prematurely
      if (reward == 100) {
        console.log('Exit current episode: ', reward, ', stepIdx / nMaxSteps', stepIdx, N_steps_max);
        break;
      }
    } // End one episode
    // negative reward if N_steps_max hit?

    if (episodeIdx % 100 == 0) {
      tileMap.draw(ctx);
      await sleep(100); // quick fix for image loading
    }
  } // End all episodes

  // Show your best run :)
  tileMap.printQTable();
  tileMap.initTileMap();
  pacman = tileMap.getNewPacman(velocity);
  tileMap.draw(ctx);
  pacman.draw(ctx);
  gameID = setInterval(() => {
    gameLoop();
  }, 500);
}

function gameLoop() {
  tileMap.draw(ctx);
  // Choose action of current state
  const currentState = tileMap.getCurrentState();
  const q_value = Math.max(...currentState);
  const newMovingDirection = currentState.indexOf(q_value);
  Utils.assert(q_value != -1, `something went wrong, q_value is ${q_value}`);
  pacman.move(newMovingDirection);
  pacman.draw(ctx);
  const reward = tileMap.getReward();
  if (reward == 100) {
    clearInterval(gameID);
  } else if (reward != 0) {
    //tileMap.setReward(0);
  }
}

function getNewRandomMovingDirection(currentState) {
  const rndIdx = getRandomInt(0, 3);
  // console.log(rndIdx, currentState[rndIdx]);

  if (currentState[rndIdx] == -1) {
    return getNewRandomMovingDirection(currentState);
  } else {
    return rndIdx;
  }
}

window.onload = async () => {
  init();
  //gameID = setInterval(gameLoop, 1000 / 1);
  trainLoop();
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/questions/19717931/find-next-highest-number-in-array-jquery
function getNextHighestIndex(arr, value) {
  let i = arr.length;
  while (arr[--i] > value);
  return ++i;
}
