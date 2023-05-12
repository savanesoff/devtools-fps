export default class Buffers {
  fps: Float32Array;
  times: Float32Array;
  minDelta: number;

  constructor(size: number, fps: number, time: number, minDelta: number) {
    this.fps = new Float32Array(size).fill(fps);
    this.times = new Float32Array(size).fill(time);
    this.minDelta = minDelta;
  }

  update(fps: number, time: number, delta: number) {
    this.fillMissingTime(fps, time, delta);
    this.shift(fps, time);
  }

  fillMissingTime(fps: number, time: number, delta: number) {
    const missing = Math.floor(delta / this.minDelta);
    for (let i = 0; i < missing; i++) {
      this.shift(fps, time - (missing - i) * this.minDelta);
    }
  }

  shift(fps: number, time: number) {
    this.fps.copyWithin(0, 1);
    this.fps[this.fps.length - 1] = fps;
    this.times.copyWithin(0, 1);
    this.times[this.times.length - 1] = time;
  }

  getAverageFPS() {
    return this.fps.reduce((a, b) => a + b) / this.fps.length;
  }

  getSnapshots() {
    return {
      fps: new Float32Array(this.fps),
      times: new Float32Array(this.times),
    };
  }

  setSize(length: number) {
    this.times = new Float32Array(length).map(
      (_, i) => this.times[i - (length - this.times.length)] || this.times[0]
    );
    this.fps = new Float32Array(length).map(
      (_, i) => this.fps[i - (length - this.fps.length)] || this.fps[0]
    );
  }
}
