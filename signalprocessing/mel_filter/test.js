import { create_melfilter } from '../mel_filter.js';

const TIMEDOMAINSIZE = 512;
const FEQUENCYDOMAINSIZE = TIMEDOMAINSIZE / 2 + 1;
const nFilter = 10;

const filter = create_melfilter();
filter.init(40000, TIMEDOMAINSIZE, 0, 20000, nFilter);
//filter.print();
console.log(filter.getFilterBank(0));

let graph_div = document.getElementById('div_g1');

let data = [];
for (let idx = 0; idx < FEQUENCYDOMAINSIZE; idx++) {
  let dummy = [];
  for (let m = 0; m <= nFilter - 1; m++) {
    let fb = filter.getFilterBank(m);
    dummy.push(fb[idx]);
  }
  data.push([idx, ...dummy]);
}

let graph1 = new Dygraph(graph_div, data, {
  drawPoints: true,
  showRoller: true,
  valueRange: [0, 1.0],
});

//
let dummysignal = Array.from(new Array(FEQUENCYDOMAINSIZE), () => 1);
let prod = filter.getLogMelCoefficients(dummysignal);
console.log(prod);
