import BufferDisplay from "./buffer-display";
import { getFPSColor } from "./colors";
import FPSDisplay from "./fps-display";
import StateMouse from "./state-mouse";

const style = {
  position: "absolute",
  top: "auto",
  bottom: "0",
  left: "auto",
  right: "0",
  backgroundColor: "rgba(0,0,30,0.5)",
  zIndex: "999999",
};

export default class Display {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  fpsDisplay: FPSDisplay;
  bufferDisplay: BufferDisplay;
  controlPointWidth = 4;
  controlPointLength = 40;
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
    // this.canvas.style.width = `${width}px`;
    // this.canvas.style.height = `${height}px`;
    // @ts-ignore-next-line
    Object.assign(this.canvas.style, style);
    // @ts-ignore-next-line
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) throw new Error("Could not get canvas context");
    this.fpsDisplay = new FPSDisplay(this.ctx);
    this.bufferDisplay = new BufferDisplay(this.ctx, maxFPS);
  }

  renderStateIcon(pause = false) {
    if (pause) {
      this.ctx.fillStyle = getFPSColor(0);
      this.ctx.clearRect(this.canvas.width - 20, 5, 20, 15);
      this.ctx.fillRect(this.canvas.width - 20, 5, 6, 15);
      this.ctx.fillRect(this.canvas.width - 10, 5, 6, 15);

      this.canvas.style.outline = `2px solid ${getFPSColor(0)}`;
      this.canvas.style.outlineOffset = "-2px";
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

  /**
   * Draw active control points
   * @param rect
   * @param controlPoints
   */
  renderControlPoints(
    rect: DOMRect,
    controlPoints: StateMouse["controlPoints"]
  ) {
    const color = getFPSColor(30);
    this.ctx.fillStyle = color;

    if (controlPoints.top && controlPoints.right) {
      // draw corner activation
      this.ctx.fillRect(
        rect.width - this.controlPointLength,
        0,
        this.controlPointLength,
        this.controlPointWidth
      );
      this.ctx.fillRect(
        rect.width - this.controlPointWidth,
        0,
        this.controlPointWidth,
        this.controlPointLength
      );
    } else if (controlPoints.top && controlPoints.left) {
      // draw corner activation
      this.ctx.fillRect(0, 0, this.controlPointLength, this.controlPointWidth);
      this.ctx.fillRect(0, 0, this.controlPointWidth, this.controlPointLength);
    } else if (controlPoints.bottom && controlPoints.left) {
      this.ctx.fillRect(
        0,
        rect.height - this.controlPointLength,
        this.controlPointWidth,
        this.controlPointLength
      );
      this.ctx.fillRect(
        0,
        rect.height - this.controlPointWidth,
        this.controlPointLength,
        this.controlPointWidth
      );
    } else if (controlPoints.bottom && controlPoints.right) {
      this.ctx.fillRect(
        rect.width - this.controlPointLength,
        rect.height - this.controlPointWidth,
        this.controlPointLength,
        this.controlPointWidth
      );
      this.ctx.fillRect(
        rect.width - this.controlPointWidth,
        rect.height - this.controlPointLength,
        this.controlPointWidth,
        this.controlPointLength
      );
    } else if (controlPoints.top) {
      // draw top activation
      this.ctx.fillRect(0, 0, rect.width, this.controlPointWidth);
    } else if (controlPoints.right) {
      // draw right activation
      this.ctx.fillRect(
        rect.width - this.controlPointWidth,
        0,
        this.controlPointWidth,
        rect.height
      );
    } else if (controlPoints.bottom) {
      this.ctx.fillRect(
        0,
        rect.height - this.controlPointWidth,
        rect.width,
        this.controlPointWidth
      );
    } else if (controlPoints.left) {
      this.ctx.fillRect(0, 0, this.controlPointWidth, rect.height);
    }
  }

  renderCurrent(rect: DOMRect, pause = false) {
    this.fpsDisplay.renderCurrent(rect);
    this.bufferDisplay.renderCurrent(rect);
    this.renderStateIcon(pause);
  }

  update(
    rect: DOMRect,
    now: number,
    fps: number,
    average: number,
    buffer: Float32Array,
    pause = false,
    controlPoints: StateMouse["controlPoints"]
  ) {
    this.fpsDisplay.update(now, rect, fps, average);
    this.bufferDisplay.update(now, rect, buffer);
    this.renderStateIcon(pause);
    this.renderControlPoints(rect, controlPoints);
  }
}
