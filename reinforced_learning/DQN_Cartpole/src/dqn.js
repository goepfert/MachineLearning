function createDeepQNetwork(numActions) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [4], units: 64, activation: 'relu', kernelInitializer: 'heUniform' }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu', kernelInitializer: 'heUniform' }));
  // model.add(tf.layers.dropout({ rate: 0.25 }));
  model.add(tf.layers.dense({ units: numActions }));

  return model;
}

/**
 * Copy the weights from a source deep-Q network to another.
 *
 */
function copyWeights(destNetwork, srcNetwork) {
  // https://github.com/tensorflow/tfjs/issues/1807:
  // Weight orders are inconsistent when the trainable attribute doesn't
  // match between two `LayersModel`s. The following is a workaround.
  // TODO(cais): Remove the workaround once the underlying issue is fixed.
  let originalDestNetworkTrainable;
  if (destNetwork.trainable !== srcNetwork.trainable) {
    originalDestNetworkTrainable = destNetwork.trainable;
    destNetwork.trainable = srcNetwork.trainable;
  }

  destNetwork.setWeights(srcNetwork.getWeights());

  // Weight orders are inconsistent when the trainable attribute doesn't
  // match between two `LayersModel`s. The following is a workaround.
  // TODO(cais): Remove the workaround once the underlying issue is fixed.
  // `originalDestNetworkTrainable` is null if and only if the `trainable`
  // properties of the two LayersModel instances are the same to begin
  // with, in which case nothing needs to be done below.
  if (originalDestNetworkTrainable != null) {
    destNetwork.trainable = originalDestNetworkTrainable;
  }
}

export { createDeepQNetwork, copyWeights };
