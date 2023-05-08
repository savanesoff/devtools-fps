import { CONFIG, State } from ".";
import { getFPSColor } from "./colors";

const timing = {
  interval: 1000 / 20, // 10 times per second
  last: 0,
  initialDraw: false,
};

const style = {
  x: 0,
  marginTop: 24,
  minimumSliceHeight: 0.2,
};

/**
 * Renders graph, but not the FPS values
 */
export function renderBuffer(
  canvas: HTMLCanvasElement,
  state: State,
  buffer: Float32Array,
  force = false
) {
  if (!canvas.ctx || (!force && state.now - timing.last < timing.interval)) {
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

  for (let i = 0; i < buffer.length; i++) {
    const sliceY =
      canvas.height -
      Math.max(style.minimumSliceHeight, buffer[i] / CONFIG.maxFPS) *
        (canvas.height - style.marginTop);

    canvas.ctx.fillStyle = getFPSColor(buffer[i]);
    canvas.ctx.fillRect(
      x,
      sliceY,
      Math.ceil(sliceWidth),
      canvas.height - sliceY
    );
    x += sliceWidth;
  }
}
