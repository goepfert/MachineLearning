/**
 * main app
 *
 * author: Thomas Goepfert
 */

import { createWindowing } from '../windowing.js';
import { createFFT } from '../fft.js';
import { create_melfilter } from '../mel_filter.js';
import CircularBuffer from '../circularBuffer.js';
import utils from '../utils.js';

// It all starts with a context
let audioContext; // = new AudioContext({ samplerate: 48000 });

const samplerate = 48000;

// Buffer sizes
const BUFFER_SIZE = 1024; // the chunks we get from the input source (e.g. the mic)
const FRAME_SIZE = samplerate * 0.025; // Frame_time == 25 ms
const FRAME_STRIDE = samplerate * 0.01; // Frame_stride == 10 ms (=> 15 ms overlap)

// Ringbuffer
const buffertime = 1; // in seconds

// Ringbuffer Time Domain (1D)
const RB_SIZE = Math.floor((samplerate * buffertime) / BUFFER_SIZE) * BUFFER_SIZE; // ~buffertime in number of samples, ensure integer fraction size of concat
const timeDomainData = new CircularBuffer(RB_SIZE);

// RingBuffer Framing (2D)
const RB_SIZE_FRAMING = utils.getNumberOfFrames(RB_SIZE, FRAME_SIZE, FRAME_STRIDE); // how many frames with overlap fit into time domain ringbuffer

console.log('Length ringbuffer time domain: ', RB_SIZE);
console.log('Length ringbuffer frequency domain with overlap: ', RB_SIZE_FRAMING);

let Data_Pos = 0; // head position
const DFT_Data = []; // after fourier transform [B2P1][RB_SIZE_FRAMING]
const MEL_RAW = []; // log mel filter coefficients
const LOG_MEL = []; // log mel filter coefficients after some scaling for visualization

// Hamming Window
const fenster = createWindowing(FRAME_SIZE); // don't call it window ...

// DFT
const fft = createFFT(FRAME_SIZE);
const B2P1 = FRAME_SIZE / 2 + 1; // Length of frequency domain data

// Mel Filter
const N_MEL_FILTER = 100; // Number of Mel Filterbanks (power of 2 for DCT)
const filter = create_melfilter();
const MIN_FREQUENCY = 100; // lower end of first mel filter bank
// TODO: if we cut off frequencies above 8 kHz, we may save some mips if we downsample e.g. to 16 kHz before (low pass and taking every third sample if we have 48 kHz)
const MAX_FREQUENCY = 4000; // upper end of last mel filterbank
filter.init(samplerate, FRAME_SIZE, MIN_FREQUENCY, MAX_FREQUENCY, N_MEL_FILTER);

// Plotting
const ANIM_INTERVALL = 0;
const MIN_EXP = -1; // 10^{min_exp} linear, log scale minimum
const MAX_EXP = 3; // 10^{max_exp} linear, log scale max

// Prefill arrays
for (let idx = 0; idx < RB_SIZE_FRAMING; idx++) {
  let ft_array = Array.from(Array(B2P1), () => 0);
  DFT_Data.push(ft_array);

  let mel_raw_array = Array.from(Array(N_MEL_FILTER), () => 0);
  MEL_RAW.push(mel_raw_array);

  let mel_array = Array.from(Array(N_MEL_FILTER), () => 255);
  LOG_MEL.push(mel_array);
}

// Canvas width and height
let drawit = [true, true, true];
let canvas;
let canvasCtx;
let canvas_fftSeries;
let context_fftSeries;
let canvas_fftSeries_mel;
let context_fftSeries_mel;

(function create_some_stuff() {
  if (drawit[0]) {
    canvas = document.getElementById('oscilloscope');
    canvasCtx = canvas.getContext('2d');
    canvas.width = 4 * RB_SIZE_FRAMING;
    canvas.height = 100; //B2P1;
  }

  if (drawit[1]) {
    canvas_fftSeries = document.getElementById('fft-series');
    context_fftSeries = canvas_fftSeries.getContext('2d');
    canvas_fftSeries.width = 4 * RB_SIZE_FRAMING;
    canvas_fftSeries.height = B2P1;
  }

  if (drawit[2]) {
    canvas_fftSeries_mel = document.getElementById('fft-series mel');
    context_fftSeries_mel = canvas_fftSeries_mel.getContext('2d');
    canvas_fftSeries_mel.width = 4 * RB_SIZE_FRAMING;
    canvas_fftSeries_mel.height = 4 * N_MEL_FILTER;
  }
})();

/**
 * Handle mic data
 */
const handleSuccess = function (stream) {
  console.log('handle success');

  audioContext = new AudioContext({ samplerate: samplerate });
  const source = audioContext.createMediaStreamSource(stream);

  // Create a ScriptProcessorNode
  const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.onaudioprocess = function (e) {
    const inputBuffer = e.inputBuffer;
    timeDomainData.concat(inputBuffer.getChannelData(0));

    doFraming();
  }; //end onprocess mic data
};

/** Kicks off Mic data handle function
 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 */
navigator.mediaDevices
  .getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
    video: false,
  })
  .then(handleSuccess)
  .catch((err) => console.log(err));

let nextStartPos = 0;
function doFraming() {
  let headPos = timeDomainData.getHeadPos();
  let availableData = headPos - nextStartPos;
  if (availableData < 0) {
    availableData = headPos + timeDomainData.getLength() - nextStartPos;
  }

  if (availableData < FRAME_SIZE) {
    return;
  }

  let nFrames = utils.getNumberOfFrames(availableData, FRAME_SIZE, FRAME_STRIDE);
  let startPos = nextStartPos;
  let endPos = (nextStartPos + FRAME_SIZE) % RB_SIZE;

  for (let idx = 0; idx < nFrames; idx++) {
    let frame_buffer = timeDomainData.getSlice(startPos, endPos);

    // Windowing
    fenster.hamming(frame_buffer);

    // Fourier Transform
    const mag = fft.getPowerspectrum(frame_buffer);
    DFT_Data[Data_Pos] = utils.logRangeMapBuffer(mag, MIN_EXP, MAX_EXP, 255, 0);

    // Apply mel filter
    let mel_array = filter.getMelCoefficients(mag);

    MEL_RAW[Data_Pos] = mel_array;
    LOG_MEL[Data_Pos] = utils.logRangeMapBuffer(mel_array, MIN_EXP, MAX_EXP, 255, 0);

    // Bookeeping
    Data_Pos = (Data_Pos + 1) % RB_SIZE_FRAMING;
    startPos = (startPos + FRAME_STRIDE) % RB_SIZE;
    endPos = (endPos + FRAME_STRIDE) % RB_SIZE;
  }

  nextStartPos = startPos;
}

/**
 * Recursive draw function
 * Called as fast as possible by the browser (as far as I understood)
 * Why not making an IIFE ...
 */
const draw = function () {
  let barWidth;
  let barHeight;
  let mag = 0;
  let x = 0;

  // Draw magnitudes
  if (drawit[0]) {
    barWidth = canvas.width / B2P1;
    canvasCtx.fillStyle = '#FFF';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < B2P1; i++) {
      let pos = Data_Pos - 1;
      if (pos < 0) pos = 0;
      mag = DFT_Data[pos][i];
      mag = Math.round(mag);
      barHeight = -canvas.height + utils.map(mag, 0, 255, 0, canvas.height) - 1;
      canvasCtx.fillStyle = utils.rainbow[mag];
      canvasCtx.fillRect(x, canvas.height, barWidth, barHeight);
      x += barWidth;
    }
    canvasCtx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw time series on top
    canvasCtx.beginPath();
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#000099';
    let sliceWidth = canvas.width / BUFFER_SIZE;
    x = 0;
    let timearray = timeDomainData.getSlice(timeDomainData.lastHead, timeDomainData.head);
    for (let i = 0; i < BUFFER_SIZE; i++) {
      let v = timearray[i] + 1;
      let y = (v * canvas.height) / 2;
      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    //canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }

  // Draw FT Time Series
  if (drawit[1]) {
    context_fftSeries.fillStyle = '#FFF';
    context_fftSeries.fillRect(0, 0, canvas_fftSeries.width, canvas_fftSeries.height);

    let rectHeight = canvas_fftSeries.height / B2P1;
    let rectWidth = canvas_fftSeries.width / RB_SIZE_FRAMING;
    let xpos = 0;
    let ypos;
    for (let xidx = Data_Pos; xidx <= Data_Pos + RB_SIZE_FRAMING; xidx++) {
      ypos = canvas_fftSeries.height;
      for (let yidx = 0; yidx < B2P1; yidx++) {
        mag = DFT_Data[xidx % RB_SIZE_FRAMING][yidx];
        mag = Math.round(mag);
        if (mag != 0) {
          context_fftSeries.fillStyle = utils.rainbow[mag];
          context_fftSeries.fillRect(xpos, ypos, rectWidth, -rectHeight);
        } else {
          //
        }
        ypos -= rectHeight;
      }
      xpos += rectWidth;
    }
    context_fftSeries.strokeRect(0, 0, canvas_fftSeries.width, canvas_fftSeries.height);
  }

  // Draw mel spectrum
  if (drawit[2]) {
    context_fftSeries_mel.fillStyle = '#FFF';
    context_fftSeries_mel.fillRect(0, 0, canvas_fftSeries_mel.width, canvas_fftSeries_mel.height);

    let rectHeight = canvas_fftSeries_mel.height / N_MEL_FILTER;
    let rectWidth = canvas_fftSeries_mel.width / RB_SIZE_FRAMING;
    let xpos = 0;
    for (let xidx = Data_Pos; xidx < Data_Pos + RB_SIZE_FRAMING; xidx++) {
      let ypos = canvas_fftSeries_mel.height;
      for (let yidx = 0; yidx < N_MEL_FILTER; yidx++) {
        mag = LOG_MEL[xidx % RB_SIZE_FRAMING][yidx];
        mag = Math.round(mag);
        context_fftSeries_mel.fillStyle = utils.rainbow[mag];
        context_fftSeries_mel.fillRect(xpos, ypos, rectWidth, -rectHeight);
        ypos -= rectHeight;
      }
      xpos += rectWidth;
    }

    context_fftSeries_mel.strokeRect(0, 0, canvas_fftSeries_mel.width, canvas_fftSeries_mel.height);
  }

  // draw asap ... but wait some time to get other things done
  setTimeout(() => {
    requestAnimationFrame(draw);
  }, ANIM_INTERVALL);
}; // end draw fcn

draw();
