/**
 * TODO: find more suitable name
 */
import { createFFT } from './fft.js';

const Core = (function () {
  /**
   * calculates magnitudes and phases of fragments of given length and hop size from time domain data
   *
   * @param {function} windowing callback function for windowing
   * @return {object} return an object of two arrays, magitudes and phases
   */
  function getSTFT(timedata, frame_size, frame_stride, windowing) {
    const fft = createFFT(frame_size);
    const availableData = timedata.length;
    let nFrames = utils.getNumberOfFrames(availableData, frame_size, frame_stride);
    console.log(
      'getSTFT (available data, number of frames, frame size, frame stride): ',
      availableData,
      nFrames,
      frame_size,
      frame_stride
    );

    let startPos_frame = 0;
    let endPos_frame = frame_size;

    let magnitudes = [];
    let phases = [];

    while (endPos_frame <= availableData) {
      // console.log(startPos_frame, endPos_frame);
      const frame_image = timedata.slice(startPos_frame, endPos_frame);
      if (utils.isFunction(windowing)) {
        windowing(frame_image);
      } else {
        console.log('Core::getSTFT - not valid windowing function given');
      }
      const { mag, phase } = fft.getMagnitudeAndPhase(frame_image);

      magnitudes.push(mag);
      phases.push(phase);

      // next one start position
      startPos_frame += frame_stride;
      endPos_frame = startPos_frame + frame_size;
    }

    return { magnitudes, phases };
  }

  /**
   * Calculates timedomain data from overlapping frequency domain data
   * So to say the inverse funtion of Core::getSTFT(), but w/o windowing function
   *
   * @return {array} returns timedomain buffer
   */
  function getISTFT(magnitudes, phases, frame_size, frame_stride) {
    utils.assert(magnitudes.length === phases.length, 'Core::getISFT length mismatch');

    const fft = createFFT(frame_size);
    let timedomain_data = [];

    for (let i = 0; i < magnitudes.length; i++) {
      timedomain_data.push(fft.inverseTransformMagAndPhase(magnitudes[i], phases[i][0])); // WEIRDDDDDDD!!!!!
      //timedomain_data.push(fft.inverseTransformMagAndPhase(magnitudes[i], phases[i]));
    }

    const tot_length = utils.getSizeOfBuffer(timedomain_data.length, frame_size, frame_stride);
    console.log('total length of time doimain data:', tot_length);

    let time_buffer = [];
    for (let idx = 0; idx < tot_length; idx++) {
      const contributions = getIdxOfContributingArrays(idx, frame_size, frame_stride, timedomain_data.length);

      let contribution = 0;
      // simple add up of all contribution
      // this is correct if one uses hanning window ... and I'm going to use it for simplicity
      for (let cont_idx = 0; cont_idx < contributions.length; cont_idx++) {
        const frame_number = contributions[cont_idx].frame_number;
        const frame_idx = contributions[cont_idx].frame_idx;
        contribution += timedomain_data[frame_number][frame_idx];
      }
      time_buffer.push(contribution);
    }

    //console.log(time_buffer);

    return time_buffer;
  }

  /**
   * returns an object if frame_number and frame_idx in this frame (of number frame_number) that
   * contribute (overlap) to one global index idx
   *
   * example:
   * frame_size = 5
   * frame_stride = 2
   * max_frames = 3
   *
   * [0 1 2 3 4 5]
   *     [0 1 2 3 4 5]
   *         [0 1 2 3 4 5]
   *
   * [0 1 2 3 4 5 6 7 8 9]
   *
   * common indices at idx 4 -> 0, 4; 1, 2; 2,0
   */
  function getIdxOfContributingArrays(idx, frame_size, frame_stride, max_frames) {
    let indices = [];
    let index;
    let frame_number = 0;

    // Trivial
    if (idx < frame_stride) {
      indices.push({ frame_number, frame_idx: idx });
      return indices;
    }

    // Brute force
    for (let frame_number = 0; frame_number < max_frames; frame_number++) {
      if (frame_number > max_frames) {
        break;
      }
      for (let frame_idx = 0; frame_idx < frame_size; frame_idx++) {
        index = frame_idx + frame_number * frame_stride;
        //console.log('frame_numbder / index', frame_number, index);
        if (idx === index) {
          indices.push({ frame_number, frame_idx });
        }
      }
    }

    return indices;
  }

  /**
   * what tho paper says ... (https://arxiv.org/pdf/1609.07132.pdf)
   * implace
   */
  function phase_aware_scaling(clean_mags, clean_phases, noisy_phases) {
    utils.assert(clean_phases.length === noisy_phases.length, 'phase_aware_scaling: size mismatch');

    for (let idx1 = 0; idx1 < clean_phases.length; idx1++) {
      for (let idx2 = 0; idx2 < clean_phases[idx1].length; idx2++) {
        clean_mags[idx1][idx2] = clean_mags[idx1][idx2] * Math.cos(clean_phases[idx1][idx2] - noisy_phases[idx1][idx2]);
      }
    }
  }

  return { getSTFT, getISTFT, getIdxOfContributingArrays, phase_aware_scaling };
})();
