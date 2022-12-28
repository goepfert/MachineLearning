/**
 * heavily inspired by https://github.com/CodingWith-Adam/pacman/blob/main/src/Game.js
 */

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

async function gameLoop() {
  tileMap.draw(ctx);
  pacman.draw(ctx, pause());

  // Choose action of current state
  let currentState = tileMap.getCurrentState();
  console.log(currentState);

  let rnd = Math.random();
  if (rnd <= epsilon) {
    const max = Math.max(...currentState);
    const max_index = currentState.indexOf(max);
    console.log(max, max_index);
  } else {
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
