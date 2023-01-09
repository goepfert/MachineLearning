import Utils from '../../../Utils.js';

/** Replay buffer for DQN training. */
class ReplayMemory {
  constructor(maxLen) {
    this.maxLen = maxLen;
    this.buffer = [];
    for (let i = 0; i < maxLen; i++) {
      this.buffer.push(null);
    }
    this.index = 0;
    this.length = 0;

    this.bufferIndices_ = [];
    for (let i = 0; i < maxLen; ++i) {
      this.bufferIndices_.push(i);
    }
  }

  /**
   * Append an item to the replay buffer.
   */
  append(item) {
    this.buffer[this.index] = item;
    this.length = Math.min(this.length + 1, this.maxLen);
    this.index = (this.index + 1) % this.maxLen;
  }

  /**
   * Randomly sample a batch of items from the replay buffer.
   * The sampling is done *without* replacement.
   */
  sample(batchSize) {
    if (batchSize > this.maxLen) {
      throw new Error(`batchSize (${batchSize}) exceeds buffer length (${this.maxLen})`);
    }
    this.#shuffle(this.bufferIndices_);

    const out = [];
    for (let i = 0; i < batchSize; ++i) {
      out.push(this.buffer[this.bufferIndices_[i]]);
    }
    return out;
  }

  get maxLen() {
    return this.maxLen;
  }

  /**
   * Shuffles array in place.
   * https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
   */
  #shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
}

export default ReplayMemory;
