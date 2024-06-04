# Examples of autoencoders

Dataset: Imagedateset used for [doodle classification](https://github.com/goepfert/MachineLearning/tree/master/neural_network/examples/doodle). 28x28 bitmaps with 784 pixels.

## Resources

TODO: Cleanup with resources given here: https://github.com/goepfert/MachineLearning/wiki/5.-Advanced-Topics#autoencoders

- [Building autoencoders in keras](https://blog.keras.io/building-autoencoders-in-keras.html)
- [Understanding Variational Autoencoders (VAEs)](https://towardsdatascience.com/understanding-variational-autoencoders-vaes-f70510919f73) - Good reading for understanding PCA
- [Intuitively Understanding Variational Autoencoders](https://towardsdatascience.com/intuitively-understanding-variational-autoencoders-1bfe67eb5daf) - Good reading for unserstanding Kullback–Leibler divergence


## Simple

- Image in $\to$ same image out, trying to reconstruct the original image
- Only dense layers, no CNN (or even VAD)
- Encoding dimensionality: 196

Network architecture:
- dense layer: input_shape [784], units 196, activation relu
- dense layer: units 784, activation sigmoid

## CNN

- Image in /to same image out

Network architecture:

|    Layer    | Kernel Size | Output Shape |
| :---------: | :---------: | :----------: |
|    Input    |      -      | [28, 28, 1]  |
|   Conv2D    |     3x3     | [14, 14, 8]  |
|   Conv2D    |     3x3     |  [7, 7, 4]   |
| Conv2DTrans |     3x3     | [14, 14, 4]  |
| Conv2DTrans |     3x3     | [28, 28, 8]  |
|   Conv2D    |     3x3     | [28, 28, 1]  |
