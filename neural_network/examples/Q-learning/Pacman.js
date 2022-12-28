import { MovingDirection } from './MovingDirection.js';

const createPacman = (x, y, tileSize, velocity, tileMap) => {
  let pacmanImages = [];
  let pacmanIdx = 0;

  document.addEventListener('keydown', keydown);

  let currentMovingDirection = null;
  let requestedMovingDirection = null;

  const pacmanAnimationTimerDefault = 5;
  let pacmanAnimationTimer = null;

  const size = tileSize / 2;

  let didMove = false;

  (function loadPacmanImages() {
    const pacmanImage1 = new Image();
    pacmanImage1.src = 'images/pac0.png';

    const pacmanImage2 = new Image();
    pacmanImage2.src = 'images/pac1.png';

    const pacmanImage3 = new Image();
    pacmanImage3.src = 'images/pac2.png';

    const pacmanImage4 = new Image();
    pacmanImage4.src = 'images/pac1.png';

    pacmanImages.push(pacmanImage1);
    pacmanImages.push(pacmanImage2);
    pacmanImages.push(pacmanImage3);
    pacmanImages.push(pacmanImage4);
  })();

  function draw(ctx, pause) {
    if (!pause) {
      move();
    }
    eatDot();
    ctx.save();
    ctx.translate(x + size, y + size); //Bring origin of the cavas onto center of pacman
    ctx.rotate((currentMovingDirection * Math.PI) / 2); //Rotate canvas instead of pacman
    ctx.drawImage(pacmanImages[pacmanIdx], -size, -size, tileSize, tileSize); //Draw pacman with its center at (0,0)
    ctx.restore();
  }

  function move() {
    //Check if requested Direction is allowed
    if (currentMovingDirection !== requestedMovingDirection) {
      if (Number.isInteger(x / tileSize) && Number.isInteger(y / tileSize)) {
        if (!tileMap.didCollideWithEnv(x, y, requestedMovingDirection)) {
          currentMovingDirection = requestedMovingDirection;
        }
      }
    } else if (currentMovingDirection != null && pacmanAnimationTimer == null) {
      pacmanAnimationTimer = pacmanAnimationTimerDefault;
    }

    //Check for collision with current direction
    if (tileMap.didCollideWithEnv(x, y, currentMovingDirection)) {
      pacmanAnimationTimer = null;
      pacmanIdx = 1;
      return;
    }

    switch (currentMovingDirection) {
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

  function eatDot() {
    tileMap.eatDot(x, y);
  }

  function madeFirstMove() {
    return didMove;
  }

  function keydown(event) {
    switch (event.keyCode) {
      //up
      case 38:
        if (currentMovingDirection == MovingDirection.down) {
          currentMovingDirection = MovingDirection.up;
        }
        requestedMovingDirection = MovingDirection.up;
        didMove = true;
        break;
      //down
      case 40:
        if (currentMovingDirection == MovingDirection.up) {
          currentMovingDirection = MovingDirection.down;
        }
        requestedMovingDirection = MovingDirection.down;
        didMove = true;
        break;
      //left
      case 37:
        if (currentMovingDirection == MovingDirection.right) {
          currentMovingDirection = MovingDirection.left;
        }
        requestedMovingDirection = MovingDirection.left;
        didMove = true;
        break;
      //right
      case 39:
        if (currentMovingDirection == MovingDirection.left) {
          currentMovingDirection = MovingDirection.right;
        }
        requestedMovingDirection = MovingDirection.right;
        didMove = true;
        break;
    }
  }

  function getPosition() {
    return { x, y };
  }

  return {
    madeFirstMove,
    draw,
    getPosition,
    getWidth: () => {
      return tileSize;
    },
  };
};

export { createPacman };
