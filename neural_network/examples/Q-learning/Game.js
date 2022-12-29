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

const N_episodes_max = 100000;
const N_steps_max = 100;
let episodeOver;

const learning_rate = 0.9;
const discount_rate = 0.5;
let epsilon;
const epsilon_max = 1.0;
const epsilon_min = 0.001;
const decay_rate = 0.01;

function init() {
  tileMap = createTileMap(tileSize);
  tileMap.setCanvasSize(canvas);

  pacman = tileMap.getNewPacman(velocity);

  epsilon = epsilon_max;

  episodeOver = false;
}

async function trainLoop() {
  tileMap.draw(ctx);
  pacman.draw(ctx);
  await sleep(100); // quick fix for image loading

  // let testState = [-1, 0, -1, -1];
  // console.log(getNewRandomMovingDirection(testState));

  for (let episodeIdx = 0; episodeIdx < N_episodes_max; episodeIdx++) {
    console.log('starting new episode ', episodeIdx, ' / ', N_episodes_max);
    // Reset Position of agent pacman
    tileMap.initTileMap();
    pacman = tileMap.getNewPacman(velocity);
    // Reset epsilon
    epsilon = epsilon_max;
    for (let stepIdx = 0; stepIdx < N_steps_max; stepIdx++) {
      // tileMap.draw(ctx);
      // pacman.draw(ctx);
      // await sleep(10);
      // return;
      //
      // Choose action of current state
      let currentState = tileMap.getCurrentState();
      let currentPosition = pacman.getPosition();
      let newMovingDirection;
      let q_value;

      // Exploit or explore
      let rnd = Math.random();
      if (rnd > epsilon) {
        // console.log('exploit');
        q_value = Math.max(...currentState);
        newMovingDirection = currentState.indexOf(q_value);
      } else {
        // console.log('explore');
        const rndIdx = getNewRandomMovingDirection(currentState);
        q_value = currentState[rndIdx];
        newMovingDirection = rndIdx;
      }
      Utils.assert(q_value > -1, 'something went wrong');

      // console.log(newMovingDirection);
      // Move agent pacman to new position/state
      pacman.move(newMovingDirection);

      let newState = tileMap.getCurrentState();
      const max_q_prime = Math.max(...newState);

      // Update current/previous Q-value
      const reward = tileMap.getReward();
      const new_q_value = q_value + learning_rate * (reward + discount_rate * max_q_prime - q_value);
      // console.log(epsilon, reward, q_value, max_q_prime, new_q_value);

      //tileMap.setQValue(new_q_value, currentPosition.x, currentPosition.y, newMovingDirection);
      currentState[newMovingDirection] = new_q_value;

      // Reduce/Decay epsilon
      epsilon = epsilon * (1 - decay_rate);
      if (epsilon < epsilon_min) {
        epsilon = epsilon_min;
      }

      if (reward == 100 || reward == -1) {
        // console.log('Exit current episode: ', reward, ', stepIdx / nMaxSteps', stepIdx, N_steps_max);
        break;
      } else if (reward != 0) {
        tileMap.clearReward();
      }
    } // End one episode
  } // End all episodes
  // Show your best run :)
  tileMap.printQTable();
  tileMap.initTileMap();
  pacman = tileMap.getNewPacman(velocity);
  tileMap.draw(ctx);
  pacman.draw(ctx);
  gameID = setInterval(() => {
    gameLoop(tileMap, pacman);
  }, 100);
}

function gameLoop(tileMap, pacman) {
  tileMap.draw(ctx);
  // Choose action of current state
  const currentState = tileMap.getCurrentState();
  const q_value = Math.max(...currentState);
  const newMovingDirection = currentState.indexOf(q_value);
  Utils.assert(q_value > -1, 'something went wrong');
  pacman.move(newMovingDirection);
  pacman.draw(ctx);
  const reward = tileMap.getReward();
  console.log(reward);
  if (reward == 100) {
    clearInterval(gameID);
  } else if (reward != 0) {
    tileMap.clearReward();
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

function checkGameOver() {
  if (!episodeOver) {
    episodeOver = isGameOver();
  }
}

function isGameOver() {
  return false;
}

function pause() {
  return !pacman.madeFirstMove() || gameOver;
}

window.onload = async () => {
  init();
  //gameID = setInterval(gameLoop, 1000 / 1);
  await sleep(100); // quick fix for image loading
  trainLoop();
};

function gameStart(event) {
  if (event.code == 'Space') {
    comment.classList.add('invisible');
    window.removeEventListener('keydown', gameStart);
    init();
    gameID = setInterval(gameLoop, 1000 / 1);
  }
}

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
