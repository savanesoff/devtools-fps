import { getFPSColor } from "./colors";
import { setStyle } from "./json-style";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hourCycle: "h23",
};

const style = {
  "#devtools-fps-tooltip": {
    position: "absolute",
    top: "0",
    left: "0",
    backgroundColor: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "5px",
    borderRadius: "5px",
    fontFamily: "Arial",
    fontSize: "12px",
    zIndex: "999999",
    /* prevent tooltip from blocking mouse events */
    pointerEvents: "none",
  },
};

setStyle(style);

export default class Tooltip {
  tooltip: HTMLDivElement;
  bufferFPS: Float32Array;
  bufferTimes: Float32Array;
  canvas: HTMLCanvasElement;

  constructor(
    canvas: HTMLCanvasElement,
    bufferFPS: Float32Array,
    bufferTimes: Float32Array
  ) {
    this.tooltip = canvas.ownerDocument.createElement("div");
    this.tooltip.id = "devtools-fps-tooltip";
    this.canvas = canvas;
    this.bufferFPS = bufferFPS;
    this.bufferTimes = bufferTimes;
    window.document.body.appendChild(this.tooltip);
  }

  destroy() {
    this.tooltip.remove();
  }

  update(x: number, y: number) {
    const rect = this.canvas.getBoundingClientRect();
    const xPositionWithinCanvas = x - rect.left;
    const bufferValueIndex = Math.floor(
      (xPositionWithinCanvas / rect.width) * this.bufferFPS.length
    );
    const fps = this.bufferFPS[bufferValueIndex];
    const timestamp = this.bufferTimes[bufferValueIndex];
    this.render(fps, timestamp, x, y);
  }

  private render(fps: number, timestamp: number, x: number, y: number) {
    const time = new Date(
      performance.timeOrigin + timestamp
    ).toLocaleTimeString("en-US", TIME_FORMAT);
    this.tooltip.innerText = `${fps.toFixed(1)} fps\n${time}`;
    this.tooltip.style.color = getFPSColor(fps);
    // get rect only after text is set
    const rect = this.tooltip.getBoundingClientRect();
    // ensure tooltip is within window bounds
    const top = y - rect.height < 0 ? 0 : y - rect.height;
    const left =
      x + rect.width > window.innerWidth ? window.innerWidth - rect.width : x;
    // set tooltip position
    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }
}
