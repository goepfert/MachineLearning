import Cartpole from './src/Cartpole.js';

const height = 300;
const width = 500;
const frameRate = 30;

let action = -1;
let prevMouseX = 0;

document.addEventListener('DOMContentLoaded', () => {
  let svgContainer = d3.select('#cartpole-drawing').attr('height', height).attr('width', width);
  let c = new Cartpole(svgContainer, { dt: 0.03, forceMult: 10 });
  c.reset();
  setInterval(() => {
    if (action != -1) {
      const { state, reward, done } = c.step(action);
      action = -1;
      document.getElementById('rewardP').innerHTML = 'Reward: ' + reward;
      document.getElementById('doneP').innerHTML = 'Done: ' + done;
    }
    c.render((1 / frameRate) * 1000);
  }, (1 / frameRate) * 1000);

  document.getElementById('cartpole-drawing').addEventListener('click', (e) => {
    c.reset();
  });

  document.getElementById('cartpole-drawing').addEventListener('mouseover', (e) => {
    let boundingRect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - boundingRect.left - width / 2;

    if (mouseX < -0.2) action = 0;
    else if (mouseX < 0.2) action = -1;
    else action = 1;

    console.log(action);
  });
});
