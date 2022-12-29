import { MovingDirection } from './MovingDirection.js';
import { createPacman } from './Pacman.js';

const createTileMap = (tileSize) => {
  let pacman;
  //1 - wall, shall be excluded in possible actions
  //0 - 0 reward, nothing
  //2 - +1 reward, yellow dot
  //3 - +2 reward, pink dot
  //4 - -1 reward, ghost
  //5 - +100 reward, goal
  //7 - 0 reward, start position

  // MICE
  // const tileMap = [
  //   [1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 1],
  //   [1, 0, 4, 5, 1],
  //   [1, 1, 1, 1, 1],
  // ];

  // Frozen Lake
  // const tileMap = [
  //   [1, 1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 0, 1],
  //   [1, 0, 4, 2, 4, 1],
  //   [1, 0, 3, 0, 0, 1],
  //   [1, 4, 0, 0, 5, 1],
  //   [1, 1, 1, 1, 1, 1],
  // ];

  // Kitty
  // const masterTileMap = [
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  //   [1, 7, 1, 0, 4, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  //   [1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  //   [1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 2, 0, 2, 0, 1, 1, 1, 1],
  //   [1, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // ];

  // Eat them all
  const masterTileMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  let tileMap = [];
  initTileMap();
  let q_table = [];
  initQTable();

  const yellowDot = new Image();
  yellowDot.src = 'images/yellowDot.png';

  const pinkDot = new Image();
  pinkDot.src = 'images/pinkDot.png';

  const wall = new Image();
  wall.src = 'images/wall.png';

  const ghost = new Image();
  ghost.src = 'images/ghost.png';

  const goal = new Image();
  goal.src = 'images/goal.png';

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
            ctx.drawImage(pinkDot, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 4:
            ctx.drawImage(ghost, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 5:
            ctx.drawImage(goal, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
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
            // tileMap[rowIdx][colIdx] = 0; // Replace with nothing
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

  function clearReward() {
    if (pacman == undefined) {
      console.log('alarm: no pacman');
    }
    let pos = pacman.getPosition();

    tileMap[pos.y / tileSize][pos.x / tileSize] = 0;
  }

  function initTileMap() {
    tileMap = [];
    tileMap = structuredClone(masterTileMap);
  }

  function initQTable() {
    q_table = tileMap.map((arr) => {
      return arr.slice();
    });

    q_table.forEach((row, rowIdx) => {
      row.forEach((action, colIdx) => {
        let tile = tileMap[rowIdx][colIdx];
        let r1 = Math.random() / 10;
        let r2 = Math.random() / 10;
        let r3 = Math.random() / 10;
        let r4 = Math.random() / 10;
        q_table[rowIdx][colIdx] = [r1, r2, r3, r4];
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

    console.table(q_table);
  }

  function getCurrentState() {
    if (pacman == undefined) {
      console.log('alarm: no pacman');
    }
    let pos = pacman.getPosition();
    return q_table[pos.y / tileSize][pos.x / tileSize];
  }

  function getReward() {
    if (pacman == undefined) {
      console.log('alarm: no pacman');
    }
    let pos = pacman.getPosition();

    const tile = tileMap[pos.y / tileSize][pos.x / tileSize];
    //0 - 0 reward, nothing
    //2 - +1 reward, yellow dot
    //3 - +10 reward, pink dot
    //4 - -1 reward, ghost
    //5 - +100 reward, goal
    //7 - 0 reward, start position
    switch (tile) {
      case 0:
        return 0;
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return -1;
      case 5:
        return 100;
      case 7:
        return 0;
      default:
        return 0;
    }
  }

  function setQValue(newQvalue, x, y, z) {
    if (pacman == undefined) {
      console.log('alarm: no pacman');
    }
    q_table[y / tileSize][x / tileSize][z] = newQvalue;
  }

  function printQTable() {
    console.table(q_table);
  }

  return {
    draw,
    getNewPacman,
    didCollideWithEnv,
    setCanvasSize,
    clearReward,
    getCurrentState,
    getReward,
    setQValue,
    printQTable,
    initTileMap,
  };
};

export { createTileMap };
