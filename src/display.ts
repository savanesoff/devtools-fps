import { State } from ".";
import { renderBuffer } from "./buffer-display";
import { getFPSColor } from "./colors";
import { renderFPS } from "./fps-display";

declare global {
  interface Window {
    devtools_fps_display: HTMLCanvasElement | null;
  }
  interface HTMLCanvasElement {
    ctx: CanvasRenderingContext2D | null;
  }
}

const style = {
  position: "absolute",
  top: "auto",
  bottom: "0",
  left: "0",
  backgroundColor: "rgba(0,0,0,0.2)",
  cursor: "pointer",
  zIndex: "999999",
};

export function getCanvas(): HTMLCanvasElement {
  const canvas = window.devtools_fps_display || createCanvas();
  if (!canvas.parentElement) {
    document.body.appendChild(canvas);
  }

  window.devtools_fps_display = canvas;
  return canvas;
}

function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.id = "devtools-fps-display";
  // @ts-ignore-next-line
  Object.assign(canvas.style, style);

  canvas.ctx = canvas.getContext("2d");
  if (!canvas.ctx) throw new Error("Could not get canvas context");

  return canvas;
}

export function removeCanvas(window: Window) {
  const canvas = window.devtools_fps_display;
  if (canvas && canvas.parentElement) {
    canvas.parentElement.removeChild(canvas);
  }
  window.devtools_fps_display = null;
}

function renderIcon(inspectMode: boolean, canvas: HTMLCanvasElement) {
  if (!canvas.ctx) return;
  if (inspectMode) {
    canvas.ctx.fillStyle = getFPSColor(0);
    canvas.ctx.clearRect(canvas.width - 20, 5, 20, 15);
    canvas.ctx.fillRect(canvas.width - 20, 5, 6, 15);
    canvas.ctx.fillRect(canvas.width - 10, 5, 6, 15);
  } else {
    canvas.ctx.fillStyle = getFPSColor(60);
    // draw play icon
    canvas.ctx.beginPath();
    canvas.ctx.moveTo(canvas.width - 20, 5);
    canvas.ctx.lineTo(canvas.width - 20, 20);
    canvas.ctx.lineTo(canvas.width - 6, 12);
    canvas.ctx.fill();
  }
}

/**
 * Creates the canvas element and appends it to the body
 */
export function renderCanvas(
  state: State,
  buffer: Float32Array,
  force = false
) {
  const canvas = getCanvas();
  renderFPS(canvas, state, force);
  renderBuffer(canvas, state, buffer, force);
  renderIcon(state.inspect, canvas);
}

export function setDisplayState(state: State) {
  const canvas = window.devtools_fps_display;
  if (!canvas) return;
  if (state.inspect) {
    canvas.style.outline = `1px solid ${getFPSColor(state.fps)}`;
    canvas.style.outlineOffset = "-1px";
  } else {
    canvas.style.outline = "none";
  }
}
