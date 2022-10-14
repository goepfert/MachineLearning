# Perceptron example

Number of Inputs: 3 (x, y, bias)\
Number of Outputs: 1\
Activation Function: Sign -> (-1 or 1)

## Workflow

- Generated training samples with known (expected) classification
- Generate Perceptron with Random weights between -1 and 1
- Iterate over the training samples and for every sample train Perceptron (one by one)
- Draw all processed (trained) samples and admire progress

## Legend

- Black line: given function (hyperplane) to learn
- Blue line: currently learned hyperplane based on the adjusted weights
- Green dots: 'left of the plane'
- Red dots: 'right of the plane'
