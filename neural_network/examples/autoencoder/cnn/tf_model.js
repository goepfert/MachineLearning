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
    const IMAGE_CHANNELS = 1; // default

    model.add(
      tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: 3,
        filters: 8,
        strides: 2,
        padding: 'same',
        activation: 'relu',
      })
    );

    model.add(
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 4,
        strides: 2,
        padding: 'same',
        activation: 'relu',
      })
    );

    // 7*7*8 = 392
    // 7*7*4 = 196
    //---------------------------------------------------------------------------

    model.add(
      tf.layers.conv2dTranspose({
        kernelSize: 3,
        filters: 4,
        strides: 2,
        padding: 'same',
        activation: 'relu',
      })
    );

    model.add(
      tf.layers.conv2dTranspose({
        kernelSize: 3,
        filters: 8,
        strides: 2,
        padding: 'same',
        activation: 'relu',
      })
    );

    model.add(
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 1,
        padding: 'same',
        activation: 'sigmoid',
      })
    );

    compile_model(model);

    return model;
  }

  function compile_model(model) {
    // const optimizer = tf.train.adam(3e-4);
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    });
  }

  async function train(xs, ys, model) {
    // https://machinelearningmastery.com/gentle-introduction-mini-batch-gradient-descent-configure-batch-size/
    const BATCH_SIZE = 128;
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training',
      tab: 'Model',
      styles: { height: '1000px' },
    };
    const onEpochEnd = tfvis.show.fitCallbacks(container, metrics);

    return model.fit(xs, ys, {
      batchSize: BATCH_SIZE,
      epochs: 100,
      shuffle: true,
      // validationSplit: 0.2,
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
