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

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(
      tf.layers.conv2d({
        inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
        kernelSize: 5,
        filters: 8,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
      })
    );

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(
      tf.layers.conv2d({
        kernelSize: 5,
        filters: 16,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
      })
    );
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten());

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
    const optimizer = tf.train.adam(3e-4);
    //const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
  }

  async function train(xs, ys, model) {
    // mhh: Which batch size shall I choose?
    // https://machinelearningmastery.com/gentle-introduction-mini-batch-gradient-descent-configure-batch-size/
    const BATCH_SIZE = 32;
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training',
      tab: 'Model',
      styles: { height: '1000px' },
    };
    //const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);
    const onEpochEnd = tfvis.show.fitCallbacks(container, metrics);

    return model.fit(xs, ys, {
      batchSize: BATCH_SIZE,
      epochs: 10,
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
