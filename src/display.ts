import { State } from ".";
import { renderBuffer } from "./buffer-display";
import { getFPSColor } from "./colors";
import { renderFPS } from "./fps-display";

declare global {
  interface Window {
    devtools_fps_display: HTMLCanvasElement;
  }
  interface HTMLCanvasElement {
    ctx: CanvasRenderingContext2D | null;
  }
}

const style = {
  position: "absolute",
  top: "0",
  left: "0",
  width: "380px",
  height: "160px",
  backgroundColor: "rgba(,,0,0,0.4)",
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

/**
 * Creates the canvas element and appends it to the body
 */
export function renderCanvas(state: State, buffer: Float32Array) {
  const canvas = getCanvas();
  renderFPS(canvas, state);
  renderBuffer(canvas, state, buffer);
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
