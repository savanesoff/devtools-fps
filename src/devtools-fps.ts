import Overdrag from "../../overdrag/src";
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
  snapshotBuffers: {
    buffers: { fps: Float32Array; times: Float32Array };
    fps: number;
    averageFPS: number;
  } | null = null;
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
    this.setElementBounds({ width, height });
    this.canvas = element;
    this.display = new Display(this.canvas, this.maxFPS);
    this.fps = new FPS(bufferSize, this.maxFPS);
    // this prevents delay between size change and rendering
    this.on("update", () => this.drawCurrent());
    this.on("click", () => this.toggleInspect());
    this.on(Overdrag.EVENTS.OVER, this.onMouseEnter);
    this.cursors.OVER = "default";
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
    this.setElementBounds({ width, height });
    if (style) {
      Object.assign(this.canvas.style, style);
    }
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
      this.snapshotBuffers = this.fps.getSnapshot();
      this.onMouseEnter();
      this.renderTooltip();
    } else {
      this.snapshotBuffers = null;
      this.removeTooltip();
    }
  }

  onMouseEnter() {
    if (!this.inspect || !this.snapshotBuffers) return;
    this.tooltip = new Tooltip(
      this.canvas,
      this.snapshotBuffers.buffers.fps,
      this.snapshotBuffers.buffers.times
    );

    this.on(Overdrag.EVENTS.MOVE, this.renderTooltip);
    this.on(Overdrag.EVENTS.OUT, this.removeTooltip);
  }

  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
      this.off(Overdrag.EVENTS.MOVE, this.renderTooltip);
      this.off(Overdrag.EVENTS.OUT, this.removeTooltip);
    }
  }

  renderTooltip() {
    if (this.tooltip) {
      this.tooltip.update(this.clientX, this.clientY);
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
      this.inspect && this.snapshotBuffers?.buffers.fps
        ? this.snapshotBuffers?.buffers.fps
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
