import { getFPSColor } from "./colors";

const style = {
  marginTop: 24,
  minimumSliceHeight: 0.2,
};

export default class BufferDisplay {
  updateInterval = 1000 / 30;
  ctx: CanvasRenderingContext2D;
  lastUpdatedAt = 0;
  maxFPS: number;
  buffer: Float32Array = new Float32Array(0);

  constructor(ctx: CanvasRenderingContext2D, maxFPS: number) {
    this.ctx = ctx;
    this.maxFPS = maxFPS;
  }

  clear(rect: DOMRect) {
    this.ctx.clearRect(
      0,
      style.marginTop,
      rect.width,
      rect.height - style.marginTop
    );
  }

  render(rect: DOMRect) {
    // clear area
    this.clear(rect);
    // render slices
    let sliceWidth = rect.width / this.buffer.length;
    const maxSliceHeight = rect.height - style.marginTop;
    const minSliceHeight = maxSliceHeight * style.minimumSliceHeight;
    let x = 0;
    // draw slices
    for (let i = 0; i < this.buffer.length; i++) {
      const sliceHeight = Math.max(
        minSliceHeight,
        Math.min(1, this.buffer[i] / this.maxFPS) * maxSliceHeight
      );
      const sliceY = rect.height - sliceHeight;

      this.ctx.fillStyle = getFPSColor(this.buffer[i]);
      this.ctx.fillRect(x, sliceY, Math.ceil(sliceWidth), sliceHeight);
      x += sliceWidth;
    }
  }

  renderCurrent(rect: DOMRect) {
    this.render(rect);
  }

  update(now: number, rect: DOMRect, buffer: Float32Array) {
    if (this.lastUpdatedAt && now - this.lastUpdatedAt < this.updateInterval) {
      return;
    }
    this.lastUpdatedAt = now;
    this.buffer = buffer;
    this.render(rect);
  }
}
