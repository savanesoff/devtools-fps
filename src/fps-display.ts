import { State } from ".";
import { getFPSColor } from "./colors";

const timing = {
  interval: 1000 / 3, // 3 times per second
  last: 0,
  initialDraw: false,
};

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

export function renderFPS(canvas: HTMLCanvasElement, state: State) {
  if (!canvas.ctx || state.now - timing.last < timing.interval) {
    return;
  }

  timing.last = state.now;
  canvas.ctx.clearRect(style.x, style.y, canvas.width, style.height);

  // draw FPS
  canvas.ctx.font = style.fps.font;
  canvas.ctx.fillStyle = getFPSColor(state.fps);
  canvas.ctx.fillText(`${state.fps.toFixed(1)}`, style.fps.x, style.fps.y);
  // draw average FPS
  canvas.ctx.font = style.averageFPS.font;
  canvas.ctx.fillStyle = getFPSColor(state.averageFPS);
  canvas.ctx.fillText(
    `(avg: ${state.averageFPS.toFixed(1)})`,
    style.averageFPS.x,
    style.averageFPS.y
  );
}
