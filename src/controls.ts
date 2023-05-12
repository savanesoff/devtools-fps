import { EventEmitter } from "events";
import { buffers, state } from ".";
import { renderCanvas, setDisplayState } from "./display";
import StateMouse from "./state-mouse";
import { removeTooltip, renderTooltip } from "./tooltip";

export default class Controls extends EventEmitter {
  state: StateMouse | null = null;
  canvas: HTMLCanvasElement | null = null;
  snapThreshold = 20;
  window: Window = window;
  border = {
    color: "#f00",
    width: 3,
    spread: 0,
    blur: 0,
  };
  minHeight = 50;
  minWidth = 150;
  inspecting = false;

  static instance: Controls;

  constructor(canvas: HTMLCanvasElement) {
    super();
    if (Controls.instance) {
      return Controls.instance;
    }
    this.canvas = canvas;
    this.window = canvas.ownerDocument?.defaultView || window;
    this.state = new StateMouse(canvas);
    this.state.on("update", this.onStateUpdate.bind(this));
    this.state.on("click", this.onClick.bind(this));
    Controls.instance = this;
  }

  onClick(state: StateMouse) {
    if (!this.canvas) return;
    this.inspecting = !this.inspecting;
  }

  onStateUpdate(state: StateMouse) {
    this.updateCursorStyle(state);
    if (state.dragging) {
      this.drag(state.pageX - state.offsetX, state.pageY - state.offsetY);
    } else if (!state.down) {
      this.activeControlPoints(state);
    } else if (state.down) {
      this.reSize(state);
    }
    this.emit("update", state);
  }

  reSize(state: StateMouse) {
    if (!this.canvas) return;
    if (state.controlPoints.top) {
      this.movePointTop(state);
    }
    if (state.controlPoints.bottom) {
      this.movePointBottom(state);
    }
    if (state.controlPoints.left) {
      this.movePointLeft(state);
    }
    if (state.controlPoints.right) {
      this.movePointRight(state);
    }
  }

  private movePointRight(state: StateMouse) {
    if (!this.canvas) return;
    this.canvas.width = Math.max(
      this.minWidth,
      Math.min(
        state.pageX -
          state.startRect.left +
          state.startRect.width -
          state.offsetX,
        this.window.innerWidth - state.startRect.left
      )
    );
  }

  private movePointLeft(state: StateMouse) {
    if (!this.canvas) return;
    const left = Math.max(
      0,
      Math.min(
        state.pageX - state.offsetX,
        state.startRect.right - this.minWidth
      )
    );

    this.canvas.width = Math.max(this.minWidth, state.startRect.right - left);
    this.canvas.style.left = `${left}px`;
  }

  private movePointBottom(state: StateMouse) {
    if (!this.canvas) return;
    this.canvas.height = Math.max(
      this.minHeight,
      Math.min(
        state.pageY -
          state.startRect.top +
          state.startRect.height -
          state.offsetY,
        this.window.innerHeight - state.startRect.top
      )
    );
  }

  private movePointTop(state: StateMouse) {
    if (!this.canvas) return;
    const top = Math.max(
      0,
      Math.min(
        state.pageY - state.offsetY,
        state.startRect.bottom - this.minHeight
      )
    );

    this.canvas.height = Math.max(this.minHeight, state.startRect.bottom - top);
    this.canvas.style.top = `${top}px`;
  }

  activeControlPoints(state: StateMouse) {
    if (!this.canvas) return;
    const shadow = [
      state.controlPoints.top
        ? `0 ${this.border.width}px ${this.border.blur}px ${this.border.spread}px ${this.border.color} inset`
        : null,
      state.controlPoints.bottom
        ? `0 ${this.border.width}px ${this.border.blur}px ${this.border.spread}px ${this.border.color}`
        : null,
      state.controlPoints.left
        ? `${this.border.width}px 0 ${this.border.blur}px ${this.border.spread}px ${this.border.color} inset`
        : null,
      state.controlPoints.right
        ? `${this.border.width}px 0 ${this.border.blur}px ${this.border.spread}px ${this.border.color}`
        : null,
    ];
    this.canvas.style.boxShadow = shadow.filter((v) => v).join(", ");
  }

  private updateCursorStyle(state: StateMouse) {
    if (!this.canvas) return;
    if (
      (state.controlPoints.left && state.controlPoints.top) ||
      (state.controlPoints.right && state.controlPoints.bottom)
    ) {
      this.window.document.body.style.cursor = "nwse-resize";
    } else if (
      (state.controlPoints.left && state.controlPoints.bottom) ||
      (state.controlPoints.right && state.controlPoints.top)
    ) {
      this.window.document.body.style.cursor = "nesw-resize";
    } else if (state.controlPoints.top || state.controlPoints.bottom) {
      this.window.document.body.style.cursor = "ns-resize";
    } else if (state.controlPoints.left || state.controlPoints.right) {
      this.window.document.body.style.cursor = "ew-resize";
    } else if (state.over) {
      this.window.document.body.style.cursor = "pointer";
    } else {
      this.window.document.body.style.cursor = "default";
    }
  }

  drag(x: number, y: number) {
    if (!this.canvas) return;
    // snap to the edges of the window
    const left =
      x < this.snapThreshold
        ? 0
        : x + this.canvas.width + this.snapThreshold > this.window.innerWidth
        ? this.window.innerWidth - this.canvas.width
        : x;
    // snap to the edges of the window
    const top =
      y < this.snapThreshold
        ? 0
        : y + this.canvas.height + this.snapThreshold > this.window.innerHeight
        ? this.window.innerHeight - this.canvas.height
        : y;
    this.canvas.style.left = left + "px";
    this.canvas.style.top = top + "px";
  }
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

  //   canvas.addEventListener("mousemove", onMouseOver);
  canvas.addEventListener("mouseout", removeTooltip);
  // render the tooltip for the current mouse position
  onMouseOver(e);
}

function onInspectModeOff(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;

  state.render = true;
  state.inspect = false;

  setDisplayState(state);

  //   canvas.removeEventListener("mousemove", onMouseOver);
  canvas.removeEventListener("mouseout", removeTooltip);

  removeTooltip();
}

const moveState = {
  hitStatus: null as ReturnType<typeof getHitStatus> | null,
};

function updateTooltip(e: MouseEvent) {
  const canvas = e.target as HTMLCanvasElement;
  const xPositionWithinCanvas = e.clientX - canvas.offsetLeft;
  const bufferValueIndex = Math.floor(
    (xPositionWithinCanvas / canvas.width) * buffers.fpsSnapshot.length
  );
  const fps = buffers.fpsSnapshot[bufferValueIndex];
  const timestamp = buffers.timesSnapshot[bufferValueIndex];
  renderTooltip(e, fps, timestamp);
}
