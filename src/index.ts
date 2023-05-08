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
  minBufferTimeSlice: 1000 / 30,
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
  canvas.width = CONFIG.width = Math.min(
    width || canvas.width || CONFIG.width,
    window.innerWidth
  );
  canvas.height = CONFIG.height = Math.min(
    height || canvas.height || CONFIG.height,
    window.innerHeight / 3
  );

  const rect = canvas.getBoundingClientRect();
  const left =
    rect.right > window.innerWidth
      ? window.innerWidth - canvas.width
      : canvas.style.left || 0;

  canvas.style.left = left + "px";

  const top =
    rect.bottom > window.innerHeight
      ? window.innerHeight - canvas.height
      : canvas.style.top || 0;

  canvas.style.top = top + "px";
}

export function setBufferSize(size: number) {
  const length = size || CONFIG.width;
  buffers.times = new Float32Array(length).map(
    (_, i) =>
      buffers.times[i - (length - buffers.times.length)] || buffers.times[0]
  );
  buffers.fps = new Float32Array(length).map(
    (_, i) => buffers.fps[i - (length - buffers.fps.length)] || buffers.fps[0]
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
  setSize({ width, height });
  const canvas = getCanvas();
  // assign styles
  (<any>Object).assign(canvas.style, style);

  canvas.addEventListener("mousedown", onMousedown, true);
  setBufferSize(bufferSize);
}

const offset = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  snap: 20,
};

function onMousedown(e: MouseEvent): void {
  const canvas = getCanvas();
  const rect = canvas.getBoundingClientRect();
  offset.startX = e.pageX;
  offset.startY = e.pageY;
  offset.x = e.pageX - rect.left;
  offset.y = e.pageY - rect.top;

  window?.addEventListener("mousemove", onMousemove);

  window?.addEventListener("mouseup", onMouseUp);
  e.preventDefault();
}

function onMouseUp(e: MouseEvent) {
  const moved =
    Math.abs(offset.startX - e.pageX) > 5 ||
    Math.abs(offset.startY - e.pageY) > 5;

  window?.removeEventListener("mousemove", onMousemove);
  if (!moved) {
    onClick(e);
  }
}

function onMousemove(e: MouseEvent) {
  const canvas = getCanvas();
  const x = e.pageX - offset.x;
  const y = e.pageY - offset.y;
  const left =
    x < offset.snap
      ? 0
      : x + canvas.width + offset.snap > window.innerWidth
      ? window.innerWidth - canvas.width
      : x;
  const top =
    y < offset.snap
      ? 0
      : y + canvas.height + offset.snap > window.innerHeight
      ? window.innerHeight - canvas.height
      : y;
  canvas.style.left = left + "px";
  canvas.style.top = top + "px";
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
  // If the delta is too large, we need to fill the buffer with missing values
  const missing = Math.floor(state.delta / CONFIG.minBufferTimeSlice);
  for (let i = 0; i < missing; i++) {
    shiftLeft(state.fps, state.now - (missing - i) * CONFIG.minBufferTimeSlice);
  }
  state.averageFPS = shiftLeft(state.fps, state.now);
}

/**
 * Shifts the buffer left and adds the new value to the end
 * These are the values that are used to calculate the average FPS
 * But also, the buffer is used to draw the graph
 * @param value average FPS value
 */
function shiftLeft(fps: number, time: number): number {
  let total = 0;
  for (let i = 0; i < buffers.fps.length - 1; i++) {
    total += buffers.fps[i];
    buffers.fps[i] = buffers.fps[i + 1]; // Shift left
    buffers.times[i] = buffers.times[i + 1];
  }
  buffers.times[buffers.times.length - 1] = time;
  buffers.fps[buffers.fps.length - 1] = fps; // Place new value at tail
  return total / buffers.fps.length;
}

function onClick(e: MouseEvent) {
  e.preventDefault();
  if (state.inspect) onInspectModeOff(e);
  else onInspectModeOn(e);
  return false;
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
