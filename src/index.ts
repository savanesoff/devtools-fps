type MeterDataType = {
  fpsMax: number;
  /* Rendered FSP number */
  fps: number;
  // Average FPS number over the span of the buffer
  averageFPS: number;
  // The last time the FPS was updated
  last: number;
  // canvas context
  ctx: CanvasRenderingContext2D;
  // canvas element
  canvas: HTMLCanvasElement;
  // Whether the monitor is running
  run: boolean;
  // The buffer of FPS values
  bufferFPS: Float32Array;
  // The size of the buffer, typically the width of the canvas
  bufferSize: number;
  // The index of the buffer to update, used to loop through the buffer
  bufferIndex: number;
  // The interval between updates, in milliseconds
  updateInterval: number;
  // The last time the buffer was updated
  lastUpdate: number;
  // The interval between draws of FPS values, in milliseconds, because we down' want to redraw the value every time the FPS is updated
  fpsDrawInterval: number;
  // The last time the FPS was drawn
  fpsDrawLast: number;
  // Whether to draw the initial FPS value
  fpsInitialDraw: boolean;
  // current performance value in ms
  now: number;
  // flag to indicate whether to render the monitor
  render: boolean;
  // The delta between the last and current performance.now() values
  delta: number;
  // The width of the canvas
  width: number;
  // The height of the canvas
  height: number;
  freezedBuffer: Float32Array;
  timestampBuffer: Float32Array;
  freezedBufferTimestamp: Float32Array;
  tooltip: HTMLDivElement;
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  // @ts-ignore-next-line
  fractionalSecondDigits: 3,
  hourCycle: "h23",
};

// init object that would hold all the data
const data = {} as MeterDataType;

/**
 * Autostart the FPS monitor
 */
(function () {
  data.last = performance.now();
  data.fpsMax = 60;
  data.render = false;
  data.bufferSize = 360;
  data.bufferIndex = 0;
  //
  data.updateInterval = 1000 / data.fpsMax;
  data.lastUpdate = 0;
  //
  data.fpsDrawInterval = 700;
  data.fpsDrawLast = 0;
  //
  data.width = 180;
  data.height = 50;
  data.fps = data.averageFPS = 1000 / (performance.timeOrigin - data.last);
  data.run = true;
  setBuffers();

  console.log("FPS Monitor started");

  // start the loop immediately upon importing package
  requestAnimationFrame(() => {
    // we want to guard against multiple imports or multiple starts
    // specifically, we want to avoid multiple update loops with hotmodule reloading
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    if (!window.fms_meter_running) update();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    window.fms_meter_running = true;
  });
})();

function initTooltip() {
  data.tooltip = document.createElement("div");
  data.tooltip.style.position = "absolute";
  data.tooltip.style.top = "0";
  data.tooltip.style.left = "0";
  data.tooltip.style.backgroundColor = "rgba(0,0,0,0.8)";
  data.tooltip.style.color = "white";
  data.tooltip.style.padding = "5px";
  data.tooltip.style.borderRadius = "5px";
  data.tooltip.style.fontFamily = "Arial";
  data.tooltip.style.fontSize = "12px";
  data.tooltip.style.zIndex = "999999";
  data.tooltip.style.pointerEvents = "none";
}

function setBuffers() {
  data.timestampBuffer = new Float32Array(data.bufferSize).fill(data.last);
  data.bufferFPS = new Float32Array(data.bufferSize).fill(data.fpsMax);
}

export function stop() {
  data.run = false;
  data.render = false;
}

/**
 * Start rendering the FPS monitor
 *
 */
export function start({ width = 180, height = 50, bufferSize = 360 } = {}) {
  data.render = true;
  data.width = width;
  data.height = height;
  data.bufferSize = bufferSize;
  setBuffers();
  initCanvas();
}

/**
 * Updates the FPS monitor and draws the FPS value
 */
function update() {
  data.now = performance.now();
  calculateFPS();
  if (data.render && data.now - data.lastUpdate > data.updateInterval) {
    data.lastUpdate = data.now;
    renderCanvas();
  }
  if (data.run) requestAnimationFrame(update);
  else console.log("FPS Monitor stopped");
}

/**
 * Calculates the FPS value from the previous frame
 */
function calculateFPS() {
  const delta = data.now - data.last;
  data.last = data.now;
  data.fps = Math.min(1000 / delta, data.fpsMax);
  data.averageFPS = shiftLeft(data.fps) / data.bufferSize;
}

/**
 * Shifts the buffer left and adds the new value to the end
 * These are the values that are used to calculate the average FPS
 * But also, the buffer is used to draw the graph
 */
function shiftLeft(value: number): number {
  let total = 0;
  for (let i = 0; i < data.bufferFPS.length - 1; i++) {
    total += data.bufferFPS[i];
    data.bufferFPS[i] = data.bufferFPS[i + 1]; // Shift left
    data.timestampBuffer[i] = data.timestampBuffer[i + 1];
  }
  data.timestampBuffer[data.timestampBuffer.length - 1] = data.now;
  data.bufferFPS[data.bufferFPS.length - 1] = value; // Place new value at tail
  return total;
}

/**
 * Creates the canvas element and appends it to the body
 */
function initCanvas() {
  data.canvas =
    (window.document.getElementById("fps-monitor") as HTMLCanvasElement) ||
    document.createElement("canvas");

  data.canvas.id = "fps-monitor";
  data.canvas.width = data.width;
  data.canvas.height = data.height;
  data.canvas.style.position = "absolute";
  data.canvas.style.bottom = "0";
  data.canvas.style.right = "0";
  data.canvas.style.zIndex = "999999";
  data.canvas.style.backgroundColor = "rgba(0,0,0,0.2)";

  data.canvas.addEventListener("click", (e: MouseEvent) => {
    if (data.render) {
      onInspectModeOn(e);
    } else {
      onInspectModeOff();
    }
  });

  const ctx = data.canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  data.ctx = ctx;
  data.ctx.font = "15px Arial";
}

function onInspectModeOn(e: MouseEvent) {
  data.render = false;
  data.canvas.style.outline = `1px solid ${getColor(data.averageFPS)}`;
  data.canvas.style.outlineOffset = "-1px";
  data.freezedBuffer = new Float32Array(data.bufferFPS);
  data.freezedBufferTimestamp = new Float32Array(data.timestampBuffer);
  data.canvas.addEventListener("mousemove", onMouseOver);
  data.canvas.addEventListener("mouseout", onMouseOut);
  onMouseOver(e);
}

function onInspectModeOff() {
  data.canvas.removeEventListener("mousemove", onMouseOver);
  onMouseOut();
  data.render = true;
  data.canvas.style.outline = "none";
}

function onMouseOut() {
  document.body.removeChild(data.tooltip);
}

function onMouseOver(e: MouseEvent) {
  const xPositionWithinCanvas = e.clientX - data.canvas.offsetLeft;
  const bufferValueIndex = Math.floor(
    (xPositionWithinCanvas / data.canvas.width) * data.bufferSize
  );
  const fps = data.freezedBuffer[bufferValueIndex];
  const ms = data.freezedBufferTimestamp[bufferValueIndex];
  const time = new Date(performance.timeOrigin + ms).toLocaleTimeString(
    "en-US",
    TIME_FORMAT
  );

  if (!data.tooltip) {
    initTooltip();
  }

  data.tooltip.innerText = `${fps.toFixed(1)} fps\n${time}`;
  document.body.appendChild(data.tooltip);

  const tooltipWidth = data.tooltip.offsetWidth;
  const tooltipHeight = data.tooltip.offsetHeight;

  const top = e.clientY - tooltipHeight < 0 ? 0 : e.clientY - tooltipHeight;
  const left =
    e.clientX + tooltipWidth > window.innerWidth
      ? window.innerWidth - tooltipWidth
      : e.clientX;
  data.tooltip.style.left = `${left}px`;
  data.tooltip.style.top = `${top}px`;
  data.tooltip.style.color = getColor(fps);
}

/**
 *  Renders FPS values, but not the graph
 */
function renderFPS() {
  data.ctx.clearRect(0, 0, data.canvas.width, 24);

  data.ctx.fillStyle = getColor(data.fps);
  data.ctx.fillText(`${data.fps.toFixed(1)}`, 1, 15);

  data.ctx.fillStyle = getColor(data.averageFPS);
  data.ctx.fillText(`avg: ${data.averageFPS.toFixed(1)}`, data.width / 2, 15);
}

/**
 * Renders graph, but not the FPS values
 */
function renderGraph() {
  data.ctx.clearRect(0, 20, data.canvas.width, data.canvas.height - 20);
  const sliceWidth = (data.canvas.width * 1.0) / data.bufferSize;
  let x = 0;
  let y = 0;

  for (let i = 0; i < data.bufferSize; i++) {
    const v = Math.max(0.5, data.bufferFPS[i] / data.fpsMax);
    const width = sliceWidth;
    data.ctx.fillStyle = getColor(data.bufferFPS[i]);
    y = data.canvas.height - v * (data.canvas.height - 20);
    data.ctx.fillRect(x, y, width, data.canvas.height - y);
    x += width;
  }
}

/**
 * Renders both the FPS values and the graph
 */
function renderCanvas() {
  if (data.canvas.parentElement !== document.body) {
    document.body.appendChild(data.canvas);
  }

  if (
    !data.fpsInitialDraw ||
    data.now - data.fpsDrawLast > data.fpsDrawInterval
  ) {
    data.fpsInitialDraw = true;
    data.fpsDrawLast = data.now;
    renderFPS();
  }
  renderGraph();
}

/**
 * Interpolates between colors based on FPS value
 */
function getColor(fps: number) {
  return fps > 59
    ? "#42e883"
    : fps > 50
    ? "#42e8e3"
    : fps > 25
    ? "#f8b400"
    : "#ff007b";
}
