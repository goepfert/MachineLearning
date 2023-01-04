import Cartpole from './src/Cartpole.js';

const height = 300;
const width = 500;
const frameRate = 30;

let action = 0;
let nSteps = 0;

document.addEventListener('DOMContentLoaded', () => {
  let svgContainer = d3.select('#cartpole-drawing').attr('height', height).attr('width', width);
  let c = new Cartpole(svgContainer, { dt: 0.03, forceMult: 5, g: 1 });
  c.reset();
  setInterval(() => {
    const { state, reward, done } = c.step(action);
    if (!done) {
      action = 0;
      document.getElementById('stepP').innerHTML = 'Steps: ' + nSteps;
      document.getElementById('doneP').innerHTML = 'Done: ' + done;
      c.render((1 / frameRate) * 1000);
      nSteps++;
    }
  }, (1 / frameRate) * 1000);

  document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
      // Spacebar
      case 32:
        nSteps = 0;
        c.reset();
        break;
      // Left
      case 37:
        action = -1;
        break;
      // Right
      case 39:
        action = 1;
        break;
      default:
        action = 0;
        break;
    }
    console.log(action);
  });
});
