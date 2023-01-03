/**
 * Confused about variables and properties?
 * Read this: https://stackoverflow.com/questions/47960160/variable-and-function-declaration-in-classes-in-es6
 */
class Cartpole {
  constructor(svgContainer, options) {
    if (options === undefined) {
      options = new Object();
    }
    this.options = {
      massC: options.massC || 1,
      massP: options.massP || 1,
      poleL: options.poleL || 1,
      forceMult: options.forceMult || 1,
      dt: options.dt || 0.1,
      cartWidth: options.cartWidth || 60,
      cartHeight: options.cartHeight || 30,
      poleWidth: options.poleWidth || 10,
      poleHeight: options.poleHeight || 120,
      g: options.g || 10,
    };
    this.options.massSum = this.options.massC + this.options.massP;
    this.initDrawing(svgContainer);
    this.reset();
  }

  initDrawing(svgContainer) {
    const { cartWidth, cartHeight, poleWidth, poleHeight } = this.options;
    this.width = svgContainer.node().getBoundingClientRect().width;
    this.height = svgContainer.node().getBoundingClientRect().height;
    this.svgContainer = svgContainer;
    this.xScale = d3.scaleLinear().domain([-5, 5]).range([0, this.width]);

    this.yScale = d3.scaleLinear().domain([0, 5]).range([this.height, 0]);

    this.svgContainer = d3
      .select('#cartpole-drawing')
      .attr('height', this.height)
      .attr('width', this.width)
      .style('background', '#DDDDDD');

    this.line = this.svgContainer
      .append('line')
      .style('stroke', 'black')
      .attr('x1', this.xScale(-5))
      .attr('y1', this.yScale(1))
      .attr('x2', this.xScale(5))
      .attr('y2', this.yScale(1));

    this.cart = this.svgContainer
      .append('rect')
      .data([0])
      .attr('width', cartWidth)
      .attr('height', cartHeight)
      .attr('x', (d) => this.xScale(d) - cartWidth / 2)
      .attr('y', this.yScale(1) - cartHeight / 2)
      .attr('rx', 5)
      .style('fill', 'BurlyWood');

    this.poleG = this.svgContainer
      .append('g')
      .data([180])
      .attr('transform', (d) => 'translate(' + this.xScale(d) + ',' + this.yScale(1) + ')');

    this.pole = this.poleG
      .append('rect')
      .data([180])
      .attr('x', -poleWidth / 2)
      .attr('width', poleWidth)
      .attr('height', poleHeight)
      .attr('transform', (r) => 'rotate(' + r + ')');
  }

  step(action = 0) {
    // if (this.done) {
    //   console.error('simulation ended, but called step method again');
    // }
    if (!(action != 0 || action != 1)) {
      console.error('action', action, 'is no valid action, choose 0 for left and 1 for right.');
      return;
    }
    const { massC, massP, poleL, forceMult, massSum, dt, g } = this.options;
    let F = (action == 0 ? -1 : 1) * forceMult;

    const thetaacc_num =
      g * Math.sin(this.theta) +
      (Math.cos(this.theta) * (-F - massP * poleL * this.thetadot * this.thetadot * Math.sin(this.theta))) / massSum;
    const thetaacc_den = poleL * (4 / 3 - (massP * Math.pow(Math.cos(this.theta), 2)) / massSum);
    let thetaacc = thetaacc_num / thetaacc_den;

    const xacc_num =
      F + massP * poleL * (this.thetadot * this.thetadot * Math.sin(this.theta) - thetaacc * Math.cos(this.theta));
    let xacc = xacc_num / massSum;

    this.thetadot = this.thetadot + thetaacc * dt;
    this.xdot = this.xdot + xacc * dt;

    this.x = this.x + this.xdot * dt;
    this.theta = this.theta + this.thetadot * dt;

    this.#calcReward();

    // if (!this.done) {
    //   this.reward++;
    // }
    // if (this.theta > Math.PI / 15 || this.theta < -Math.PI / 15) {
    //   this.done = true;
    // }
    return this.getCurrentState();
  }

  #calcReward() {
    if (this.x > -2.4 && this.x < 2.4 && this.theta > -Math.PI / 15 && this.theta < Math.PI / 15) {
      this.reward++;
    } else {
      if (this.reward > 0) {
        this.reward--;
      }
    }

    if (this.x < -3.0 || this.x > 3.0 || this.theta < -Math.PI / 5 || this.theta > Math.PI / 5) {
      this.done = true;
      // at least no reward, maybe --?
    }
  }

  getCurrentState() {
    return {
      state: {
        x: this.x,
        theta: this.theta,
        xdot: this.xdot,
        thetadot: this.thetadot,
      },
      reward: this.reward,
      done: this.done,
    };
  }

  render(timestep) {
    const { cartWidth, cartHeight, poleWidth, poleHeight } = this.options;
    this.poleG
      .selectAll('rect')
      .data([(this.theta * 180) / Math.PI + 180])
      .transition()
      .duration(timestep)
      .attr('transform', (r) => 'rotate(' + r + ')');

    this.svgContainer
      .selectAll('g')
      .data([this.x])
      .transition()
      .duration(timestep)
      .attr('transform', (d) => 'translate(' + this.xScale(d) + ',' + this.yScale(1) + ')');

    this.svgContainer
      .selectAll('rect')
      .data([this.x])
      .transition()
      .duration(timestep)
      .attr('x', (d) => this.xScale(d) - cartWidth / 2);
  }

  reset() {
    this.x = 0 + Math.random() * 4.0 - 2.0;
    this.theta = 0 + (Math.random() * Math.PI) / 10 - Math.PI / 10 / 2;
    this.xdot = 0 + Math.random() * 0.1 - 0.05;
    this.thetadot = 0;
    this.done = false;
    this.reward = 0;
  }
}

export default Cartpole;
