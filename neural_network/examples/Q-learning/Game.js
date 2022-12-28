/**
 * heavily inspired by https://github.com/CodingWith-Adam/pacman/blob/main/src/Game.js
 */

import { MovingDirection } from './MovingDirection.js';
import { createTileMap } from './TileMap.js';

const tileSize = 32;
const velocity = 32;

const comment = document.getElementById('comment');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tileMap;
let pacman;
let gameOver;
let gameID = 0;

const learning_rate = 0.8;
const discount_rate = 0.95;
let epsilon = 1;
const epsilon_max = 1.0;
const epsilon_min = 0.01;
const decay_rate = 0.005;

function init() {
  tileMap = createTileMap(tileSize);
  tileMap.setCanvasSize(canvas);

  pacman = tileMap.getNewPacman(velocity);
  gameOver = false;
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

async function gameLoop() {
  tileMap.draw(ctx);
  pacman.draw(ctx);

  // Choose action of current state
  let currentState = tileMap.getCurrentState();

  let newMovingDirection;
  let q_value;

  let rnd = Math.random();
  if (rnd > epsilon) {
    console.log('exploit');
    q_value = Math.max(...currentState);
    newMovingDirection = currentState.indexOf(q_value);
    // console.log(q_value, newMovingDirection, Object.keys(MovingDirection)[newMovingDirection]);
  } else {
    console.log('explore');
    const rndIdx = getNewRandomMovingDirection(currentState);
    q_value = currentState[rndIdx];
    newMovingDirection = rndIdx;
  }
  //  console.log(newMovingDirection);
  pacman.move(newMovingDirection);

  // Get max Q of new state
  let newState = tileMap.getCurrentState();
  const max_q_prime = Math.max(...newState);

  // Update current/previous Q-value
  const reward = tileMap.getReward();
  const new_q_value = q_value + learning_rate * (reward + discount_rate * max_q_prime - q_value);
  console.log(epsilon, reward, q_value, max_q_prime, new_q_value);

  currentState[newMovingDirection] = new_q_value;
  //currentState[newMovingDirection] = 0;

  epsilon = epsilon * (1 - decay_rate);
  if (epsilon < epsilon_min) {
    epsilon = epsilon_min;
  }

  checkGameOver();
  if (gameOver) {
    clearInterval(gameID);
    await sleep(4300);
    comment.classList.remove('invisible');
    window.addEventListener('keydown', gameStart);
  }
}

function checkGameOver() {
  if (!gameOver) {
    gameOver = isGameOver();
  }
}

function isGameOver() {
  return false;
}

function pause() {
  return !pacman.madeFirstMove() || gameOver;
}

window.onload = () => {
  init();
  gameID = setInterval(gameLoop, 1000 / 1);
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
