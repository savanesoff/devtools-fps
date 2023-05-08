import { startControls } from "./controls";
import { getCanvas, renderCanvas } from "./display";

declare global {
  interface Window {
    devtools_fps_running: Boolean;
  }
}

export const CONFIG = {
  maxFPS: 60,
  width: innerWidth / 3,
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

export const buffers: Buffers = {
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
    config();
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
  onFrame(true);
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
export default function config({
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

  canvas.addEventListener("mousedown", startControls, true);
  setBufferSize(bufferSize);
}

/**
 * Updates the FPS monitor and draws the FPS value
 */
function update() {
  onFrame();
  if (state.run) requestAnimationFrame(update);
  else console.log("FPS Monitor stopped");
}

function onFrame(force = false) {
  computeState();
  if (!state.inspect && state.render) renderCanvas(state, buffers.fps, force);
  if (state.inspect) renderCanvas(state, buffers.fpsSnapshot, force);
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
