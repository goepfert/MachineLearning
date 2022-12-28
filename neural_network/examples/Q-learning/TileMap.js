import { MovingDirection } from './MovingDirection.js';
import { createPacman } from './Pacman.js';

const createTileMap = (tileSize) => {
  let pacman;
  //1 - wall
  //0 - nothing
  //2 - +1
  //3 - +10
  //4 - -2
  //5 - +100
  //7 - start
  const tileMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const q_table = tileMap.map((arr) => {
    return arr.slice();
  });

  init_q_table();

  const yellowDot = new Image();
  yellowDot.src = 'images/yellowDot.png';

  const pinkDot = new Image();
  pinkDot.src = 'images/pinkDot.png';

  const wall = new Image();
  wall.src = 'images/wall.png';

  function draw(ctx) {
    tileMap.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        switch (tile) {
          case 1:
            ctx.drawImage(wall, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 2:
            ctx.drawImage(yellowDot, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 3:
            ctx.drawImage(powerDot, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          default:
            drawBlank(ctx, rowIdx, colIdx);
            break;
        }
      });
    });
  }

  function drawBlank(ctx, rowIdx, colIdx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
  }

  function getNewPacman(velocity) {
    tileMap.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        switch (tile) {
          case 7:
            //map[rowIdx][colIdx] = 0; // Replace with dot
            // tile = 0; wrong
            pacman = createPacman(colIdx * tileSize, rowIdx * tileSize, tileSize, velocity, this);
            // return createPacman; wrong
            break;
        }
      });
    });

    return pacman;
  }

  function didCollideWithEnv(x, y, movingDirection) {
    if (movingDirection == null) {
      return;
    }

    if (Number.isInteger(x / tileSize) && Number.isInteger(y / tileSize)) {
      let nextColumn = 0;
      let nextRow = 0;

      switch (movingDirection) {
        case MovingDirection.right:
          nextColumn = x + tileSize;
          nextColumn = nextColumn / tileSize;
          nextRow = y / tileSize;
          break;
        case MovingDirection.left:
          nextColumn = x - tileSize;
          nextColumn = nextColumn / tileSize;
          nextRow = y / tileSize;
          break;
        case MovingDirection.up:
          nextRow = y - tileSize;
          nextRow = nextRow / tileSize;
          nextColumn = x / tileSize;
          break;
        case MovingDirection.down:
          nextRow = y + tileSize;
          nextRow = nextRow / tileSize;
          nextColumn = x / tileSize;
          break;
      }

      // console.log(nextRow, nextColumn);
      const tile = tileMap[nextRow][nextColumn];
      if (tile === 1) {
        return true;
      }
    }

    return false;
  }

  function setCanvasSize(canvas) {
    canvas.width = tileMap[0].length * tileSize;
    canvas.height = tileMap.length * tileSize;
  }

  function eatDot(x, y) {
    const row = y / tileSize;
    const column = x / tileSize;

    if (Number.isInteger(row) && Number.isInteger(column)) {
      const tile = tileMap[row][column];
      switch (tile) {
        case 2:
          tileMap[row][column] = 0;
          break;
        case 3:
          tileMap[row][column] = 0;
          break;
      }
    }
  }

  function init_q_table() {
    q_table.forEach((row, rowIdx) => {
      row.forEach((action, colIdx) => {
        let tile = tileMap[rowIdx][colIdx];
        q_table[rowIdx][colIdx] = [0, 0, 0, 0];
        if (tile == 1) {
          q_table[rowIdx][colIdx] = [-1, -1, -1, -1];
        } else {
          // move left not possible
          if (colIdx == 0 || tileMap[rowIdx][colIdx - 1] == 1) {
            q_table[rowIdx][colIdx][MovingDirection.left] = -1;
          }
          // move right not possible
          if (colIdx == tileMap[0].lenght - 1 || tileMap[rowIdx][colIdx + 1] == 1) {
            q_table[rowIdx][colIdx][MovingDirection.right] = -1;
          }
          // move up not possible
          if (rowIdx == 0 || tileMap[rowIdx - 1][colIdx] == 1) {
            q_table[rowIdx][colIdx][MovingDirection.up] = -1;
          }
          // move down not possible
          if (rowIdx == tileMap.length - 1 || tileMap[rowIdx + 1][colIdx] == 1) {
            q_table[rowIdx][colIdx][MovingDirection.down] = -1;
          }
        }
      });
    });
  }

  function getCurrentState() {
    if (pacman == undefined) {
      console.log('alarm: no pacman');
    }
    let pos = pacman.getPosition();
    return q_table[pos.y / tileSize][pos.x / tileSize];
  }

  return {
    draw,
    getNewPacman,
    didCollideWithEnv,
    setCanvasSize,
    eatDot,
    getCurrentState,
  };
};

export { createTileMap };
