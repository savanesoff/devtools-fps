import { getCanvas, renderCanvas, setDisplayState } from "./display";
import { removeTooltip, renderTooltip } from "./tooltip";

declare global {
  interface Window {
    devtools_fps_running: Boolean;
  }
}

export const CONFIG = {
  maxFPS: 60,
  width: 180,
  height: 50,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export type State = {
  inspect: boolean;
  run: boolean;
  render: boolean;
  last: number;
  now: number;
  delta: number;
  fps: number;
  averageFPS: number;
};

export const state: State = {
  /** Will inspect the buffers */
  inspect: false,
  /** Will run in the background bu wouldn't render. This is to so the buffers are up to date when render is required */
  run: true,
  /** Will render the monitor */
  render: true,
  /* The last time the FPS was updated */
  last: performance.now() - 1000 / CONFIG.maxFPS,
  /* Current frame timestamp */
  now: performance.now(),
  /* The delta between updates, in milliseconds */
  delta: 1000 / CONFIG.maxFPS,
  fps: CONFIG.maxFPS,
  averageFPS: CONFIG.maxFPS,
};

export type Buffers = {
  fps: Float32Array;
  fpsSnapshot: Float32Array;
  times: Float32Array;
  timesSnapshot: Float32Array;
};

const buffers: Buffers = {
  /* The buffer of FPS values to calculate average over time*/
  fps: new Float32Array(CONFIG.width).fill(state.fps),
  /* Copy of fps buffer for inspect mode */
  fpsSnapshot: new Float32Array(CONFIG.width).fill(state.fps),
  /* The buffer of timestamps */
  times: new Float32Array(CONFIG.width).fill(state.now),
  /* Copy of times buffer for inspect mode */
  timesSnapshot: new Float32Array(CONFIG.width).fill(state.now),
};

// start the loop immediately upon importing package
requestAnimationFrame(() => {
  // we want to guard against multiple imports or multiple starts
  // specifically, we want to avoid multiple update loops with hot module reloading
  if (!window.devtools_fps_running) {
    start();
    update();
  }
  window.devtools_fps_running = true;
  console.info("devtools-fps started...");
});

export function toggleRender() {
  state.render = !state.render;
}

export function toggleRun() {
  state.run = !state.run;
  if (state.run) update();
}

export function setSize({
  width,
  height,
}: { width?: number; height?: number } = {}) {
  const canvas = getCanvas();
  canvas.width = CONFIG.width = width || canvas.width || CONFIG.width;
  canvas.height = CONFIG.height = height || canvas.height || CONFIG.height;
}

export function setBufferSize(size: number) {
  buffers.times = new Float32Array(size).map(
    (_, i) =>
      buffers.times[i - (size - buffers.times.length)] || buffers.times[0]
  );
  buffers.fps = new Float32Array(size).map(
    (_, i) => buffers.fps[i - (size - buffers.fps.length)] || buffers.fps[0]
  );
}
/**
 * Start rendering the FPS monitor
 *
 */
export function start({
  bufferSize = 0,
  style = {} as Omit<Partial<CSSStyleDeclaration>, "width" | "height">,
  width = CONFIG.width,
  height = CONFIG.height,
} = {}) {
  state.render = true;
  const canvas = getCanvas();
  (<any>Object).assign(canvas.style, style);
  canvas.width = CONFIG.width = width;
  canvas.height = CONFIG.height = height;
  canvas.addEventListener("click", onClick);
  buffers.times = new Float32Array(bufferSize || CONFIG.width).fill(state.now);
  buffers.fps = new Float32Array(bufferSize || CONFIG.width).fill(state.fps);
}

/**
 * Updates the FPS monitor and draws the FPS value
 */
function update() {
  computeState();
  if (!state.inspect && state.render) renderCanvas(state, buffers.fps);
  if (state.run) requestAnimationFrame(update);
  else console.log("FPS Monitor stopped");
}

/**
 * Calculates the FPS value from the previous frame
 */
function computeState() {
  state.now = performance.now();
  state.delta = state.now - state.last;
  state.last = state.now;
  state.fps = Math.min(1000 / state.delta, CONFIG.maxFPS);
  state.averageFPS = shiftLeft(state.fps);
}

/**
 * Shifts the buffer left and adds the new value to the end
 * These are the values that are used to calculate the average FPS
 * But also, the buffer is used to draw the graph
 * @param value average FPS value
 */
function shiftLeft(value: number): number {
  let total = 0;
  for (let i = 0; i < buffers.fps.length - 1; i++) {
    total += buffers.fps[i];
    buffers.fps[i] = buffers.fps[i + 1]; // Shift left
    buffers.times[i] = buffers.times[i + 1];
  }
  buffers.times[buffers.times.length - 1] = state.now;
  buffers.fps[buffers.fps.length - 1] = value; // Place new value at tail
  return total / buffers.fps.length;
}

function onClick(e: MouseEvent) {
  if (state.inspect) onInspectModeOff(e);
  else onInspectModeOn(e);
}

function onInspectModeOn(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;
  // stop rendering, but keep updating the buffers
  state.render = false;
  state.inspect = true;
  setDisplayState(state);
  // create a snapshot of the buffers
  buffers.fpsSnapshot = new Float32Array(buffers.fps);
  buffers.timesSnapshot = new Float32Array(buffers.times);

  renderCanvas(state, buffers.fpsSnapshot);
  // add event listeners to the canvas
  canvas.addEventListener("mousemove", onMouseOver);
  canvas.addEventListener("mouseout", removeTooltip);
  // render the tooltip for the current mouse position
  onMouseOver(e);
}

function onInspectModeOff(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;

  state.render = true;
  state.inspect = false;

  setDisplayState(state);

  canvas.removeEventListener("mousemove", onMouseOver);
  canvas.removeEventListener("mouseout", removeTooltip);

  removeTooltip();
}

function onMouseOver(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;
  // extract the buffer value index from the mouse position
  const xPositionWithinCanvas = e.clientX - canvas.offsetLeft;
  // interpolate the buffer value index to the buffer length
  const bufferValueIndex = Math.floor(
    (xPositionWithinCanvas / canvas.width) * buffers.fpsSnapshot.length
  );
  const fps = buffers.fpsSnapshot[bufferValueIndex];
  const timestamp = buffers.timesSnapshot[bufferValueIndex];
  renderTooltip(e, fps, timestamp);
}
