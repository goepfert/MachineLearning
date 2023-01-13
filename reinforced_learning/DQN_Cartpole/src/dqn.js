import globals from '../globalVar.js';

/**
 * No compilation necessary
 */
function createDeepQNetwork(numActions) {
  const model = tf.sequential();
  //model.add(tf.layers.dense({ units: 16, activation: 'relu', kernelInitializer: 'RandomNormal', inputShape: [4] }));
  model.add(tf.layers.dense({ units: 16, activation: 'relu', kernelInitializer: 'RandomNormal', inputShape: [4] }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu', kernelInitializer: 'RandomNormal' }));
  // model.add(tf.layers.dropout({ rate: 0.1 })); // do not .. nananahhh
  model.add(tf.layers.dense({ units: numActions }));

  return model;
}

/**
 * Copy the weights from a source deep-Q network to another.
 * https://github.com/tensorflow/tfjs-examples/tree/master/snake-dqn
 *
 * What about soft update? https://arxiv.org/pdf/1509.02971.pdf
 * Not sure if I know what I'm doing here :|
 */
function copyWeights(destNetwork, srcNetwork, tau) {
  if (tau == undefined) {
    tau = globals.tau;
  }
  // console.log('🚀 ~ file: dqn.js:26 ~ copyWeights ~ tau', tau);

  tf.tidy(() => {
    let originalDestNetworkTrainable;
    if (destNetwork.trainable !== srcNetwork.trainable) {
      originalDestNetworkTrainable = destNetwork.trainable;
      destNetwork.trainable = srcNetwork.trainable;
    }
    // destNetwork.setWeights(srcNetwork.getWeights()); // == tau=1

    // dest_weight = dest_weight * (1-TAU) + src_weight * TAU
    const srcWeights = srcNetwork.getWeights();
    const destWeights = destNetwork.getWeights();
    for (let i = 0; i < srcWeights.length; i++) {
      let shape = srcWeights[i].shape;
      let srcData = srcWeights[i].dataSync().slice();
      let destData = destWeights[i].dataSync().slice();
      for (let j = 0; j < srcData.length; j++) {
        destData[j] = destData[j] * (1 - tau) + srcData[j] * tau;
      }
      let newDestWeight = tf.tensor(destData, shape);
      destWeights[i] = newDestWeight;
    }
    destNetwork.setWeights(destWeights);

    if (originalDestNetworkTrainable != null) {
      destNetwork.trainable = originalDestNetworkTrainable;
    }
  });
}

export { createDeepQNetwork, copyWeights };
