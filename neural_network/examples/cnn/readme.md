# Convolutional Neural Network

Example application to load a representative grayscale image (no depth or color channels) and visualize an actual convolution with different filter found around the web.

Loading a grayscale image (480x480) and apply a 2d convolution

- different selectable 3x3 filters to get an impression about their behavior
  - Blur, sharpening, edge detection, random, ...
- stride 1, padding _same_ $\to$ output has same dimension as the input image

:exclamation: Note that the pixel values of the output image should not be interpreted as an actual image. For visualization purpose the pixel values need to be constrained or mapped to be between [0, 255]. But I assume this information should not be lost for further processing.

Apply a max pooling layer on this conv2d output

- rectangular but variable size
- stride equals _filter_ size
- output is stretched to have the same size as the conv2d output but it's actually smaller

Further processing (more layers) doesn't make much sense here because it would require to much work to mimic a real convolutional layer.

- Decouple output data from image data (only map or constrain image data)
- Implement activation layer between convolution and pooling
- How to deal with bias parameters???

If you are interested in more/better visualizations than search for _cnn feature map visualization_ or similar.
