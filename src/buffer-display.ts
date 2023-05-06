import { CONFIG, State } from ".";
import { getFPSColor } from "./colors";

const timing = {
  interval: 1000 / 10, // 10 times per second
  last: 0,
  initialDraw: false,
};

const style = {
  x: 0,
  marginTop: 20,
  minimumSliceHeight: 0.5,
};

/**
 * Renders graph, but not the FPS values
 */
export function renderBuffer(
  canvas: HTMLCanvasElement,
  state: State,
  buffer: Float32Array
) {
  if (state.now - timing.last < timing.interval) {
    return;
  }
  timing.last = state.now;

  canvas.ctx.clearRect(
    0,
    style.marginTop,
    canvas.width,
    canvas.height - style.marginTop
  );
  let sliceWidth = (canvas.width * 1.0) / buffer.length;
  let x = 0;
  let y = 0;

  for (let i = 0; i < buffer.length; i++) {
    const sliceY =
      canvas.height -
      Math.max(style.minimumSliceHeight, buffer[i] / CONFIG.maxFPS) *
        (canvas.height - style.marginTop);

    canvas.ctx.fillStyle = getFPSColor(buffer[i]);
    canvas.ctx.fillRect(x, sliceY, sliceWidth, canvas.height - y);
    x += sliceWidth;
  }
}
