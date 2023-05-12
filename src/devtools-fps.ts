import Controls from "./controls";
import Display from "./display";
import FPS from "./fps";
import StateMouse from "./state-mouse";
import Tooltip from "./tooltip";

export default class DevtoolsFPS {
  fps: FPS;
  controls: Controls;
  display: Display;
  canvas: HTMLCanvasElement;
  run = false;
  render = true;
  inspect = false;
  snapshot: ReturnType<FPS["getSnapshot"]> | null = null;
  mouseState: StateMouse;
  tooltip: Tooltip | null = null;
  window: Window = window;
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
    this.canvas = document.createElement("canvas");
    window.document.body.appendChild(this.canvas);

    this.display = new Display(this.canvas, width, height, this.maxFPS);
    this.mouseState = new StateMouse(this.canvas);
    this.controls = new Controls(this.canvas, this.mouseState);
    this.fps = new FPS(bufferSize, this.maxFPS);

    this.controls.on("update", () => this.drawCurrent());
    this.mouseState.on("click", () => this.toggleInspect());
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
  }) {
    if (bufferSize) {
      this.fps.buffers.setSize(bufferSize);
    }
    this.canvas.width = width || this.canvas.width;
    this.canvas.height = height || this.canvas.height;
    // @ts-ignore-next-line
    Object.assign(this.canvas.style, style);
    this.mouseState.rect = this.canvas.getBoundingClientRect();

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

      this.tooltip.update(this.mouseState.pageX, this.mouseState.pageY);
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
    this.display.renderCurrent(this.mouseState.rect, this.inspect);
  }

  draw() {
    const buffer =
      this.inspect && this.snapshotBuffer
        ? this.snapshotBuffer
        : this.fps.buffers.fps;
    this.display.update(
      this.mouseState.rect,
      this.fps.now,
      this.fps.fps,
      this.fps.averageFPS,
      buffer,
      this.inspect,
      this.mouseState.controlPoints
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
