/**
 * https://www.tensorflow.org/tutorials/generative/autoencoder
 */

'use strict';

function createNetwork(width, height) {
  const IMAGE_WIDTH = width; // columns
  const IMAGE_HEIGHT = height; // rows

  /**
   * create the network
   */
  function getModel() {
    const model = tf.sequential();

    model.add(
      tf.layers.dense({
        name: 'layer1_encoder',
        inputShape: [IMAGE_WIDTH * IMAGE_HEIGHT],
        units: (IMAGE_WIDTH * IMAGE_HEIGHT) / 2,
        activation: 'relu',
      })
    );

    model.add(
      tf.layers.dense({
        name: 'layer2_encoder',
        units: 1,
        activation: 'sigmoid',
      })
    );

    model.add(
      tf.layers.dense({
        name: 'layer1_decoder',
        units: (IMAGE_WIDTH * IMAGE_HEIGHT) / 2,
        activation: 'sigmoid',
      })
    );

    model.add(
      tf.layers.dense({
        name: 'layer2_decoder',
        units: IMAGE_WIDTH * IMAGE_HEIGHT,
        activation: 'sigmoid',
      })
    );

    compile_model(model);

    return model;
  }

  function compile_model(model) {
    // const optimizer = tf.train.adam(3e-4);
    const optimizer = tf.train.adam(1e-3);
    // const optimizer = tf.train.adam(0.1);
    model.compile({
      optimizer: optimizer,
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });
  }

  async function train(xs, ys, model) {
    // https://machinelearningmastery.com/gentle-introduction-mini-batch-gradient-descent-configure-batch-size/
    const BATCH_SIZE = 1;
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training',
      tab: 'Model',
      styles: { height: '1000px' },
    };
    const onEpochEnd = tfvis.show.fitCallbacks(container, metrics);

    return model.fit(xs, ys, {
      batchSize: BATCH_SIZE,
      epochs: 50,
      shuffle: true,
      validationSplit: 0,
      callbacks: onEpochEnd,
    });
  }

  return {
    getModel: getModel,
    train: train,
    compile_model: compile_model,
  };
}

export { createNetwork };
