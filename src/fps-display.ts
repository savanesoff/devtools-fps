import { getFPSColor } from "./colors";

const style = {
  x: 0,
  y: 0,
  height: 24,
  fps: {
    font: "15px Arial",
    x: 3,
    y: 16,
  },
  averageFPS: {
    font: "12px Arial",
    x: 38,
    y: 16,
  },
};

export default class FPSDisplay {
  ctx: CanvasRenderingContext2D;
  lastUpdatedAt = 0;
  updateInterval = 1000 / 3;
  fps = 0;
  average = 0;

  /**
   * Renders FPS and average FPS values into given ctx within rect values
   */
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(rect: DOMRect) {
    // clear area
    this.ctx.clearRect(0, 0, rect.width, style.height);
    // render FPS
    this.ctx.font = style.fps.font;
    this.ctx.fillStyle = getFPSColor(this.fps);
    this.ctx.fillText(this.fps.toFixed(1), style.fps.x, style.fps.y);
    // render average FPS
    this.ctx.font = style.averageFPS.font;
    this.ctx.fillStyle = getFPSColor(this.average);
    this.ctx.fillText(
      `(avg: ${this.average.toFixed(1)})`,
      style.averageFPS.x,
      style.averageFPS.y
    );
  }

  renderCurrent(rect: DOMRect) {
    this.render(rect);
  }

  update(now: number, rect: DOMRect, fps: number, average: number) {
    if (this.lastUpdatedAt && now - this.lastUpdatedAt < this.updateInterval) {
      return;
    }
    this.lastUpdatedAt = now;
    this.fps = fps;
    this.average = average;
    this.render(rect);
  }
}
