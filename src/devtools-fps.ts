import Overdrag from "overdrag";
import Display from "./display";
import FPS from "./fps";
import Tooltip from "./tooltip";

export default class DevtoolsFPS extends Overdrag {
  fps: FPS;
  display: Display;
  canvas: HTMLCanvasElement;
  run = false;
  render = true;
  inspect = false;
  snapshot: ReturnType<FPS["getSnapshot"]> | null = null;
  tooltip: Tooltip | null = null;
  snapshotBuffer: Float32Array | null = null;
  maxFPS = 60;
  constructor({
    width,
    height,
    bufferSize,
  }: {
    width: number;
    height: number;
    bufferSize: number;
  }) {
    const element = document.createElement("canvas");
    window.document.body.appendChild(element);
    super({ element });
    this.canvas = element;
    this.display = new Display(this.canvas, width, height, this.maxFPS);
    this.fps = new FPS(bufferSize, this.maxFPS);

    this.on("update", () => this.drawCurrent());
    this.on("click", () => this.toggleInspect());
    this.start();
  }

  config({
    bufferSize = 0,
    style = {} as Omit<
      Partial<CSSStyleDeclaration>,
      "width" | "height" | "position"
    >,
    width = this.canvas.width,
    height = this.canvas.height,
  } = {}) {
    if (bufferSize) {
      this.fps.buffers.setSize(bufferSize);
    }
    this.canvas.width = width || this.canvas.width;
    this.canvas.height = height || this.canvas.height;
    Object.assign(this.canvas.style, style);

    this.drawCurrent();
  }

  start() {
    this.run = true;
    this.update();
  }

  stop() {
    this.run = false;
  }

  toggleRun = () => {
    this.run = !this.run;
    if (this.run) this.update();
  };

  toggleInspect() {
    this.inspect = !this.inspect;
    if (this.inspect) {
      const buffers = this.fps.getSnapshot().buffers;
      this.tooltip = new Tooltip(this.canvas, buffers.fps, buffers.times);

      this.tooltip.update(this.offsetX, this.offsetY);
      this.snapshotBuffer = buffers.fps;
    } else if (this.tooltip != null) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  setBufferSize(size: number) {
    this.fps.buffers.setSize(size);
  }

  drawCurrent() {
    this.display.renderCurrent(
      this.canvas.getBoundingClientRect(),
      this.inspect
    );
  }

  draw() {
    const buffer =
      this.inspect && this.snapshotBuffer
        ? this.snapshotBuffer
        : this.fps.buffers.fps;
    this.display.update(
      this.canvas.getBoundingClientRect(),
      this.fps.now,
      this.fps.fps,
      this.fps.averageFPS,
      buffer,
      this.inspect,
      this.controls
    );
  }

  update() {
    this.fps.update();
    if (this.render) {
      this.draw();
    }

    if (this.run) {
      requestAnimationFrame(() => this.update());
    } else console.log("FPS Monitor stopped");
  }
}
