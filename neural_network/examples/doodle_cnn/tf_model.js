/**
 * CNN Model for Doodle Classification
 *
 * model details: https://codelabs.developers.google.com/codelabs/tfjs-training-classfication/index.html#0
 */

'use strict';

// shape[width, height]
function createNetwork(width, height, nClasses) {
  const IMAGE_WIDTH = width; // columns
  const IMAGE_HEIGHT = height; // rows
  const NUM_OUTPUT_CLASSES = nClasses;

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
        filters: 5,
        strides: 1,
        //padding: 'same',
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
      })
    );

    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    model.add(
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 16,
        strides: 1,
        //padding: 'same',
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
      })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    model.add(tf.layers.flatten());

    model.add(
      tf.layers.dense({
        units: 64,
        kernelInitializer: 'varianceScaling',
        activation: 'relu',
      })
    );

    // Our last layer is a dense layer which has 10 output units, one for each
    model.add(
      tf.layers.dense({
        units: NUM_OUTPUT_CLASSES,
        kernelInitializer: 'varianceScaling',
        activation: 'softmax',
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
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }

  async function train(xs, ys, model) {
    // https://machinelearningmastery.com/gentle-introduction-mini-batch-gradient-descent-configure-batch-size/
    const BATCH_SIZE = 16;
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training',
      tab: 'Model',
      styles: { height: '1000px' },
    };
    const onEpochEnd = tfvis.show.fitCallbacks(container, metrics);

    return model.fit(xs, ys, {
      batchSize: BATCH_SIZE,
      epochs: 15,
      shuffle: true,
      validationSplit: 0.2,
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
