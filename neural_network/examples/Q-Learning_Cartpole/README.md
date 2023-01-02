# cartpole-js
web-implementation of the cartpole pythiscs simulation
[Online example](https://goo.gl/rzxfnA)
requires d3js for rendering

***constructor:***
```
Cartpole(svgContainer, options)
```
initialize a d3 svg container to render the cart
```
let svgContainer = d3.select("#cartpole-drawing")
        .attr("height", height)
        .attr("width", width)
```

***options***
```
- massC: mass of the cart
- massP: mass of the pole
- poleL: length of the pole (is not regarded in the render function)
- forceMult: strength of the action
- dt: time step for the simulation
- cartWidth cartHeight, poleWidth poleHeight: dimensions of cart and pole for rendering purposes
- g: gravitation
```

***step(action)***
```
const {state, reward, done} = step(action = 0)
```
returns current state of the cartpole, the reward (count of frames) and done boolean

***state***

the returned state variable has four variables in it

```               
state.x, state.theta, state.xdot and state.thetadot
```
- x: x position of cart (origin is in the center)
- theta: rotation of pole in radians (0 is pole pointing straight up)
- xdot: velocity in x direction
- thetadot: angle-velocity of the pole

***reset()***

resets the cart to the center with some slight random variation of x and theta

***remder(frameRate)***

renders the current state of the cart
