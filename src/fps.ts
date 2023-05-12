import Buffers from "./buffers";

export default class FPS {
  fps: number;
  now: number;
  delta: number;
  last: number;
  averageFPS: number;
  maxFPS: number;
  minDelta: number;
  buffers: Buffers;
  constructor(bufferSize: number, maxFPS: number) {
    this.maxFPS = maxFPS;
    this.minDelta = 1000 / this.maxFPS;
    this.fps = this.maxFPS;
    this.now = performance.now();
    this.delta = 1000 / this.fps;
    this.last = this.now - this.delta;
    this.buffers = new Buffers(bufferSize, this.fps, this.now, this.minDelta);
    this.averageFPS = this.maxFPS;
  }

  update() {
    this.now = performance.now();
    this.delta = this.now - this.last;
    this.last = this.now;
    this.fps = 1000 / this.delta;
    this.buffers.update(this.fps, this.now, this.delta);
    this.averageFPS = this.buffers.getAverageFPS();
  }

  getSnapshot(): {
    buffers: { fps: Float32Array; times: Float32Array };
    fps: number;
    averageFPS: number;
  } {
    return {
      buffers: this.buffers.getSnapshots(),
      fps: this.fps,
      averageFPS: this.averageFPS,
    };
  }
}
