const width = 4;
const height = 4;

// 7: start position
const map = [
  [7, 1, 1, -10],
  [0, 0, 0, 1],
  [1, 10, -10, 0],
  [1, 0, 1, 10],
];

const nActions = 4;
const nStates = width * height;
const q_table = [];

// q_table.forEach((row, rowIdx) => {
//   row.forEach((reward, colIdx) => {});
// });

// Fill Q-Table
// [left, right, up, down]
for (let stateIdx = 0; stateIdx < nStates; stateIdx++) {
  q_table.push([-1, 0, -1, 0]);
  q_table.push([0, 0, -1, 0]);
  q_table.push([0, 0, -1, 0]);
  q_table.push([0, -1, -1, 0]);
  q_table.push([-1, 0, 0, 0]);
  q_table.push([0, 0, 0, 0]);
  q_table.push([0, 0, 0, 0]);
  q_table.push([0, -1, 0, 0]);
  q_table.push([-1, 0, 0, 0]);
  q_table.push([0, 0, 0, 0]);
  q_table.push([0, 0, 0, 0]);
  q_table.push([0, -1, 0, 0]);
  q_table.push([-1, 0, 0, -1]);
  q_table.push([0, 0, 0, -1]);
  q_table.push([0, 0, 0, -1]);
  q_table.push([0, -1, 0, -1]);
}

console.table(q_table);

const learning_rate = 0.8;
const discount_rate = 0.95;
let epsilon = 1;
const epsilon_max = 1.0;
const epsilon_min = 0.01;
const decay_rate = 0.005;

let current_state = 0;

// Choose action
let action = -1;
let available_actions = q_table[current_state];
let rnd = Math.random();
if (rnd > epsilon) {
  const max = Math.max(...available_actions);
  const max_index = arr.indexOf(max);
} else {
}
