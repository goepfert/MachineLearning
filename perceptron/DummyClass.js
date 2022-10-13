class DummyClass {
  /**
   * this.a = 10 or
   * a = 10
   * or this.a inside the contructor function
   */
  a = 10; //https://stackoverflow.com/questions/47960160/variable-and-function-declaration-in-classes-in-es6

  constructor() {}

  /**
   * https://stackoverflow.com/questions/55611/javascript-private-methods
   */
  #privatFunction() {}
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export?retiredLocale=de
export default DummyClass;
