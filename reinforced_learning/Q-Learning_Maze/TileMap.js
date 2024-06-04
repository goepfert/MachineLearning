import { MovingDirection } from './MovingDirection.js';
import { createPacman } from './Pacman.js';
import Utils from '../../../Utils.js';

const createTileMap = (tileSize) => {
  // 0 - 0 reward, nothing
  // 1 - wall, shall be excluded in possible actions
  // 2 - +1 reward,
  // 4 - -10 reward, poison, end episode
  // 7 - 0 reward, start position
  // 9 - +100 reward, goal, end episode

  // MICE
  // const masterTileMap = [
  //   [1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 1],
  //   [1, 0, 4, 9, 1],
  //   [1, 1, 1, 1, 1],
  // ];

  // Frozen Lake
  const masterTileMap = [
    [1, 1, 1, 1, 1, 1],
    [1, 7, 0, 0, 0, 1],
    [1, 0, 4, 0, 2, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 9, 1],
    [1, 1, 1, 1, 1, 1],
  ];

  // Kitty Cat 1 (upper path)
  // const masterTileMap = [
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 9, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // ];

  // Kitty Cat 2 (lower path)
  // const masterTileMap = [
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 9, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 1, 1, 2, 1, 1, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // ];

  // Kitty Cat 3 (reward 1 or 5)
  // const masterTileMap = [
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 9, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 0, 4, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 1, 0, 4, 0, 0, 1, 0, 0, 1],
  //   [1, 0, 0, 1, 1, 1, 2, 1, 1, 0, 0, 1],
  //   [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // ];

  // Blank
  // const masterTileMap = [
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  //   [1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  //   [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 1],
  //   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  // ];

  let pacman;

  let tileMap = [];
  initTileMap();
  let qTable = [];
  initQTable();

  const wall = new Image();
  wall.src = 'images/Wall.png';

  const agent = new Image();
  // agent.src = 'images/Agent.png';
  // agent.src = 'images/mouse-cartoon-beanie.jpg';

  const goal = new Image();
  goal.src = 'images/Beer.png';

  const reward = new Image();
  reward.src = 'images/Cheese.png';

  const poison = new Image();
  poison.src = 'images/Poison2.png';

  const right_img = new Image();
  right_img.src = 'images/Right50.png';

  const left_img = new Image();
  left_img.src = 'images/Left50.png';

  const up_img = new Image();
  up_img.src = 'images/Up50.png';

  const down_img = new Image();
  down_img.src = 'images/Down50.png';

  function draw(ctx) {
    tileMap.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        drawBlank(ctx, rowIdx, colIdx);
        switch (tile) {
          case 0:
            drawArrow(ctx, rowIdx, colIdx);
            break;
          case 1:
            ctx.drawImage(wall, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 2:
            ctx.drawImage(reward, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            // drawArrow(ctx, rowIdx, colIdx);
            break;
          case 4:
            ctx.drawImage(poison, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 7:
            //   // ctx.drawImage(agent, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            drawArrow(ctx, rowIdx, colIdx);
            break;
          case 9:
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
    ctx.fillStyle = 'DimGray';
    ctx.fillRect(colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
  }

  function drawArrow(ctx, rowIdx, colIdx) {
    const currentState = qTable[rowIdx][colIdx];
    let maxQValue = Math.max(...currentState);
    const direction = currentState.indexOf(maxQValue);

    switch (direction) {
      case MovingDirection.right:
        ctx.drawImage(right_img, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
        break;
      case MovingDirection.left:
        ctx.drawImage(left_img, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
        break;
      case MovingDirection.up:
        ctx.drawImage(up_img, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
        break;
      case MovingDirection.down:
        ctx.drawImage(down_img, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
        break;
    }
  }

  function setCanvasSize(canvas) {
    canvas.width = tileMap[0].length * tileSize;
    canvas.height = tileMap.length * tileSize;
  }

  function initTileMap() {
    tileMap = [];
    tileMap = structuredClone(masterTileMap);
  }

  function initQTable() {
    qTable = tileMap.map((arr) => {
      return arr.slice();
    });

    qTable.forEach((row, rowIdx) => {
      row.forEach((action, colIdx) => {
        const tile = tileMap[rowIdx][colIdx];
        // const r1 = 0;
        // const r2 = 0;
        // const r3 = 0;
        // const r4 = 0;
        const r1 = Math.random() / 500;
        const r2 = Math.random() / 500;
        const r3 = Math.random() / 500;
        const r4 = Math.random() / 500;
        qTable[rowIdx][colIdx] = [r1, r2, r3, r4];
        if (tile == 1) {
          // Wall
          qTable[rowIdx][colIdx] = [-1, -1, -1, -1];
        } else {
          // Moving left not possible
          if (colIdx == 0 || tileMap[rowIdx][colIdx - 1] == 1) {
            qTable[rowIdx][colIdx][MovingDirection.left] = -1;
          }
          // Moving right not possible
          if (colIdx == tileMap[0].lenght - 1 || tileMap[rowIdx][colIdx + 1] == 1) {
            qTable[rowIdx][colIdx][MovingDirection.right] = -1;
          }
          // Moving up not possible
          if (rowIdx == 0 || tileMap[rowIdx - 1][colIdx] == 1) {
            qTable[rowIdx][colIdx][MovingDirection.up] = -1;
          }
          // Moving down not possible
          if (rowIdx == tileMap.length - 1 || tileMap[rowIdx + 1][colIdx] == 1) {
            qTable[rowIdx][colIdx][MovingDirection.down] = -1;
          }
        }
      });
    });

    console.table(qTable);
  }

  function getNewPacman(velocity) {
    tileMap.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        switch (tile) {
          case 7:
            pacman = createPacman(colIdx * tileSize, rowIdx * tileSize, tileSize, velocity, this);
            break;
        }
      });
    });

    return pacman;
  }

  function getCurrentState() {
    Utils.assert(pacman != undefined, 'alarm: no pacman');
    const pos = pacman.getPosition();
    return qTable[pos.y / tileSize][pos.x / tileSize];
  }

  function getReward(clearAfter = false) {
    Utils.assert(pacman != undefined, 'alarm: no pacman');
    const pos = pacman.getPosition();
    const tile = tileMap[pos.y / tileSize][pos.x / tileSize];

    let reward = 0;
    // 0 - 0 reward, nothing
    // 1 - wall, shall be excluded in possible actions
    // 2 - +1 reward,
    // 3 - 0, just for testing
    // 4 - -10 reward, poison, end episode
    // 7 - 0 reward, start position
    // 9 - +100 reward, goal, end episode
    switch (tile) {
      case 0:
        reward = 0;
        if (clearAfter) {
          tileMap[pos.y / tileSize][pos.x / tileSize] = 0;
        }
        break;
      case 2:
        reward = 1; // 1 or 5
        // reward = 5; // 1 or 5
        if (clearAfter) {
          tileMap[pos.y / tileSize][pos.x / tileSize] = 0;
        }
        break;
      case 4:
        reward = -1;
        break;
      case 9:
        reward = 100;
        break;
    }

    return reward;
  }

  function setReward(reward) {
    Utils.assert(pacman != undefined, 'alarm: no pacman');
    const pos = pacman.getPosition();
    tileMap[pos.y / tileSize][pos.x / tileSize] = reward;
  }

  function setQValue(newQvalue, x, y, z) {
    Utils.assert(pacman != undefined, 'alarm: no pacman');
    qTable[y / tileSize][x / tileSize][z] = newQvalue;
  }

  function printQTable() {
    console.table(qTable);
  }

  return {
    draw,
    drawArrow,
    getNewPacman,
    setCanvasSize,
    setReward,
    getCurrentState,
    getReward,
    setQValue,
    printQTable,
    initTileMap,
  };
};

export { createTileMap };
