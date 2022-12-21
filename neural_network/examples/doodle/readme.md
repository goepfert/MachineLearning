# Doodle Classifier

Use the simple fully connected network for image classification. Since it is not a CNN, I don't expect too much. But I'll give it a try.

Training and Testing on a given dataset but it should also be possible to draw your own image and let it guess. :smiley:

_Notes_:

- Results and printouts written to the console, no dedicated html dom element.
- Only minimal error handling

## Tasks

### Obtain suitable dataset

There exists a _Quick Draw Dataset_ that contains a collection of millions of drawings contributed by player of the game [Quick, Draw!](https://quickdraw.withgoogle.com/)

I used the simplified drawings have been rendered into a 28x28 grayscale bitmap.

- download 14 examples of those [numpy_bitmaps](https://console.cloud.google.com/storage/browser/quickdraw_dataset/full/numpy_bitmap;tab=objects).

Random selection of image classes

- apple, banana, basketball, butterfly, cat, clock, crown
- fish, flower, icecream, lightbulb, mouth, smiley and tornado

Select first 100 images from each class and convert them to a local dataset description containing label (or class) and 28x28 grayscale values as a flat array (row-major order).

### Train network

The network is still the simple self written network with only one hidden layer.

- 28x28 = 784 inputs
- 196 hidden nodes (kind of arbitrary choice)
- 14 outputs

The output array was [One-Hot](https://machinelearningmastery.com/why-one-hot-encode-data-in-machine-learning/) encoded to match the desired classification purpose.

The number of parameters are
- $(784+1)\cdot196 = 153860$ for the first layer
- $(196+1)\cdot14 = 2758$ for the output layer

And in total 156618 parameters. This is quite a lot for such a fairly simple task.

**Training process**

- Select all 14 pre-converted datasets (100 apples, 100 bananas etc.)
- Randomly select one image from the combined dataset, generated One_hot output array
- Train and repeat
- Display Loss function after a couple of _hidden trainings_ and the last training image
- Save network

### Save and Load network

The network can be saved (serialized or stringyfied) and loaded to/from a text file.

### Check Accuracy

Check percentage of right guesses or prediction for 100 randomly selected images. For an untrained network the accuracy should be in the range of a random guess, i.e. 1/13 = 7.7% or 0.077. After training the accuracy should be much better!

_Note_: The testing data is contained in the same dataset. In production one should split the dataset into training and testing sets.

### Drawing functionality

You can draw your own image into the canvas (btw. the canvas size is 280x280). Before prediction it will be downscaled to match the 28x28 input. I could't find out what algorithm was used in details when the _simplified dataset_ was created. I tried a couple of different algorithms and line width (the line width in you drawing) and this was a quiet acceptable setting:

- line width: 16
- downscale algorithm: hermite resize
