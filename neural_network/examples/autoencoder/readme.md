Examples of autoencoders

Dataset: Imagedateset used for [doodle classification](https://github.com/goepfert/MachineLearning/tree/master/neural_network/examples/doodle). 28x28 bitmaps with 784 pixels.

# Ressources

- [Building autoencoders in keras](https://blog.keras.io/building-autoencoders-in-keras.html)

## Simple

- Image in \to same image out
- Only dense layers, no CNN
- encoding dimensionality: 32 (to be checked)

Network architecture:
- dense layer: input_shape [784], units 32, activation relu
- dense layer: units 784, activation sigmoid


