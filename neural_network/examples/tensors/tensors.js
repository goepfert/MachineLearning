/**
 * Things I never can remember exactly ... :(
 */

const row_1 = [1, 2, 3];
const row_2 = [4, 5, 6];

const array2d_1 = [
  [1, 2, 3],
  [4, 5, 6],
];

let array2d_2 = [];
array2d_2.push(row_1);
array2d_2.push(row_2);

// Arrays should be equal
// console.table(array2d_1);
// console.table(array2d_2);

// Access the elements from left to right
const rowIdx = 0;
const colIdx = 1;
let elem = array2d_1[rowIdx][colIdx];
// console.log(elem);
// console.log(array2d_1[0]);

// Create a rank-2 tensor (matrix) matrix tensor from a multidimensional array.
const a = tf.tensor(array2d_1);
// console.log('shape:', a.shape); // [2, 3] -> 2 rows, 3 columns
// a.print();

// Creating a 2d Tensor from flat array
const b = tf.tensor([1.1, 2.9, 3, 4, 5, 6], [2, 3], 'int32');
// console.log('shape:', b.shape);
// b.print();

// ----- more on shapes --------------------------------

const data = Array.from(Array(30), () => {
  return Math.floor(Math.random() * 100);
});
// console.log(data);

//const c = tf.tensor(data, [2, 2, 2, 2]);
//more readable
const c = tf.tensor3d(data, [3, 5, 2]);
// console.log('shape:', c.shape);
// c.print();

// ----- reshaping --------------------------------

const d = tf.tensor([
  [1, 2],
  [3, 4],
]);
// console.log('d shape:', d.shape);
// d.print();

const e = d.reshape([4, 1]);
// console.log('e shape:', e.shape);
// e.print();

//--- data --------------------------------

// console.log(c.data());
// console.log(c.dataSync());
c.data().then((data) => console.log(data));

async function print() {
  let d = await c.data();
  // console.log(d);
}
// print();

//------ memory --------------------------------

function compute() {
  const d1 = Array.from(Array(3000), () => {
    return Math.floor(Math.random() * 100);
  });
  const t1 = tf.tensor2d(d1, [500, 6]);
  const t2 = tf.tensor2d(d1, [500, 6]);

  const res = t1.add(t2);

  // res.print();
  console.log(tf.memory().numTensors);
}

// compute();

setInterval(() => {
  // compute(); // Mem Leak
  tf.tidy(compute);
}, 200);

//----------------------------------------------------------------
