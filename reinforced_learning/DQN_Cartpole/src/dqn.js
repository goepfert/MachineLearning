/**
 * No compilation neccessary
 */
function createDeepQNetwork(numActions) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [4], units: 64, activation: 'relu', kernelInitializer: 'heUniform' }));
  // model.add(tf.layers.dense({ units: 32, activation: 'relu', kernelInitializer: 'heUniform' }));
  // model.add(tf.layers.dropout({ rate: 0.1 }));
  model.add(tf.layers.dense({ units: numActions }));

  return model;
}

/**
 * Copy the weights from a source deep-Q network to another.
 * https://github.com/tensorflow/tfjs-examples/tree/master/snake-dqn
 */
function copyWeights(destNetwork, srcNetwork) {
  let originalDestNetworkTrainable;
  if (destNetwork.trainable !== srcNetwork.trainable) {
    originalDestNetworkTrainable = destNetwork.trainable;
    destNetwork.trainable = srcNetwork.trainable;
  }
  destNetwork.setWeights(srcNetwork.getWeights());
  if (originalDestNetworkTrainable != null) {
    destNetwork.trainable = originalDestNetworkTrainable;
  }
}

export { createDeepQNetwork, copyWeights };
