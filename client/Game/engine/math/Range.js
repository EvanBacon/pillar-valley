// @flow

class Range {
  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  bound = v => Math.max(this.min, Math.min(this.max, v));
  get delta() {
    return this.max - this.min;
  }
}
export default Range;
