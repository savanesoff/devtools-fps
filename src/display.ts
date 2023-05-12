import BufferDisplay from "./buffer-display";
import { getFPSColor } from "./colors";
import FPSDisplay from "./fps-display";

const style = {
  position: "absolute",
  top: "auto",
  bottom: "0",
  left: "auto",
  right: "0",
  backgroundColor: "rgba(0,0,0,0.2)",
  zIndex: "999999",
};

export default class Display {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  fpsDisplay: FPSDisplay;
  bufferDisplay: BufferDisplay;
  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    maxFPS: number
  ) {
    this.canvas = canvas;
    this.canvas.id = "devtools-fps-canvas";
    this.canvas.width = width;
    this.canvas.height = height;
    // @ts-ignore-next-line
    Object.assign(this.canvas.style, style);
    // @ts-ignore-next-line
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) throw new Error("Could not get canvas context");
    this.fpsDisplay = new FPSDisplay(this.ctx);
    this.bufferDisplay = new BufferDisplay(this.ctx, maxFPS);
  }

  renderStateIcon(pause = false, fps: number) {
    if (pause) {
      this.ctx.fillStyle = getFPSColor(0);
      this.ctx.clearRect(this.canvas.width - 20, 5, 20, 15);
      this.ctx.fillRect(this.canvas.width - 20, 5, 6, 15);
      this.ctx.fillRect(this.canvas.width - 10, 5, 6, 15);

      this.canvas.style.outline = `1px solid ${getFPSColor(fps)}`;
      this.canvas.style.outlineOffset = "-1px";
    } else {
      this.ctx.fillStyle = getFPSColor(60);
      // draw play icon
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width - 20, 5);
      this.ctx.lineTo(this.canvas.width - 20, 20);
      this.ctx.lineTo(this.canvas.width - 6, 12);
      this.ctx.fill();
      this.canvas.style.outline = "none";
    }
  }

  renderCurrent(rect: DOMRect, fps: number, pause = false) {
    this.fpsDisplay.renderCurrent(rect);
    this.bufferDisplay.renderCurrent(rect);
    this.renderStateIcon(pause, fps);
  }

  update(
    rect: DOMRect,
    now: number,
    fps: number,
    average: number,
    buffer: Float32Array,
    pause = false
  ) {
    this.fpsDisplay.update(now, rect, fps, average);
    this.bufferDisplay.update(now, rect, buffer);
    this.renderStateIcon(pause, fps);
  }
}
