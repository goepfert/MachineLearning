# Doodle Classifier with Tensorflow and Convolutional Neural Network

Compare [doodle classifier example](https://github.com/goepfert/MachineLearning/tree/master/neural_network/examples/doodle) where a simple one fully connected layer model with 156618 parameters was used. The task here is the same: Classify 28x28 grayscale images from 14 classes.

Here we use tensorflow and with a convolutional neural network with pretty decent results with following architecture:

|    Layer    | Kernel Size | Output Shape |    Number of Parameters    |
| :---------: | :---------: | :----------: | :------------------------: |
|    Input    |      -      | [28, 28, 1]  |             -              |
|   Conv2D    |     3x3     | [26, 26, 5]  |  $(3\cdot3+1)\cdot5 = 50$  |
| Max pooling |     2x2     | [13, 13, 5]  |            $0$             |
|   Conv2D    |     3x3     | [11, 11, 16] | $(5\cdot9+1)\cdot16 = 736$ |
| Max pooling |     2x2     |  [5, 5, 16]  |            $0$             |
|   Flatten   |      -      |    [400]     |   $5\cdot5\cdot16 = 400$   |
|    Dense    |      -      |     [64]     |  $(400+1)\cdot64 = 25664$  |
|    Dense    |      -      |     [14]     |   $(64+1)\cdot14 = 910$    |

Total number of parameters is 27760. This is more than a factor of 5 less than for the one layer fully connected network. And we will see, this architecture outperforms also with respect to accurancy and probably other measures!

## Performace

![doodle_cnn_accuracy.png](https://github.com/goepfert/MachineLearning/blob/master/assets/doodle_cnn_accuracy.PNG)

![doodle_cnn_confusionMatrix.png](https://github.com/goepfert/MachineLearning/blob/master/assets/doodle_cnn_confusionMatrix.PNG)
