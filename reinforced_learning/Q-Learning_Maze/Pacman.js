import { MovingDirection } from './MovingDirection.js';

const createPacman = (x, y, tileSize, velocity, tileMap) => {
  const pacmanImage = new Image();
  // pacmanImage.src = 'images/Agent.png';
  pacmanImage.src = 'images/mouse.png';

  function draw(ctx) {
    ctx.drawImage(pacmanImage, x, y, tileSize, tileSize); //Draw pacman with its center at (0,0)
    //tileMap.drawArrow(ctx, x, y);
  }

  function move(newMovingDirection) {
    switch (newMovingDirection) {
      case MovingDirection.up:
        y -= velocity;
        break;
      case MovingDirection.down:
        y += velocity;
        break;
      case MovingDirection.left:
        x -= velocity;
        break;
      case MovingDirection.right:
        x += velocity;
        break;
    }
  }

  function getPosition() {
    return { x, y };
  }

  return {
    draw,
    move,
    getPosition,
  };
};

export { createPacman };
