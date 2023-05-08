import { buffers, state } from ".";
import { getCanvas, renderCanvas, setDisplayState } from "./display";
import { removeTooltip, renderTooltip } from "./tooltip";

const offset = {
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
  snap: 20,
};

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

export function startControls(e: MouseEvent): void {
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

function onClick(e: MouseEvent) {
  e.preventDefault();
  if (state.inspect) onInspectModeOff(e);
  else onInspectModeOn(e);
  return false;
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

function onMouseUp(e: MouseEvent) {
  const moved =
    Math.abs(offset.startX - e.pageX) > 5 ||
    Math.abs(offset.startY - e.pageY) > 5;

  window?.removeEventListener("mousemove", onMousemove);
  if (!moved) {
    onClick(e);
  }
}
