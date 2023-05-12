import { EventEmitter } from "events";
import StateMouse from "./state-mouse";

export default class Controls extends EventEmitter {
  mouse: StateMouse;
  canvas: HTMLCanvasElement;
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

  constructor(canvas: HTMLCanvasElement, mouse: StateMouse) {
    super();
    this.canvas = canvas;
    this.window = canvas.ownerDocument?.defaultView || window;
    this.mouse = mouse;
    this.mouse.on("update", this.onStateUpdate.bind(this));
  }

  onStateUpdate() {
    this.updateCursorStyle();
    if (this.mouse.dragging) {
      this.drag();
    } else if (this.mouse.down) {
      this.reSize();
    }
    this.emit("update", this.mouse);
  }

  reSize() {
    if (this.mouse.controlPoints.top) {
      this.movePointTop();
    }
    if (this.mouse.controlPoints.bottom) {
      this.movePointBottom();
    }
    if (this.mouse.controlPoints.left) {
      this.movePointLeft();
    }
    if (this.mouse.controlPoints.right) {
      this.movePointRight();
    }
  }

  private movePointRight() {
    this.canvas.width = Math.max(
      this.minWidth,
      Math.min(
        this.mouse.pageX -
          this.mouse.startRect.left +
          this.mouse.startRect.width -
          this.mouse.offsetX,
        this.window.innerWidth - this.mouse.startRect.left
      )
    );
  }

  private movePointLeft() {
    const left = Math.max(
      0,
      Math.min(
        this.mouse.pageX - this.mouse.offsetX,
        this.mouse.startRect.right - this.minWidth
      )
    );

    this.canvas.width = Math.max(
      this.minWidth,
      this.mouse.startRect.right - left
    );
    this.canvas.style.left = `${left}px`;
  }

  private movePointBottom() {
    this.canvas.height = Math.max(
      this.minHeight,
      Math.min(
        this.mouse.pageY -
          this.mouse.startRect.top +
          this.mouse.startRect.height -
          this.mouse.offsetY,
        this.window.innerHeight - this.mouse.startRect.top
      )
    );
  }

  private movePointTop() {
    const top = Math.max(
      0,
      Math.min(
        this.mouse.pageY - this.mouse.offsetY,
        this.mouse.startRect.bottom - this.minHeight
      )
    );

    this.canvas.height = Math.max(
      this.minHeight,
      this.mouse.startRect.bottom - top
    );
    this.canvas.style.top = `${top}px`;
  }

  private updateCursorStyle() {
    if (
      (this.mouse.controlPoints.left && this.mouse.controlPoints.top) ||
      (this.mouse.controlPoints.right && this.mouse.controlPoints.bottom)
    ) {
      this.window.document.body.style.cursor = "nwse-resize";
    } else if (
      (this.mouse.controlPoints.left && this.mouse.controlPoints.bottom) ||
      (this.mouse.controlPoints.right && this.mouse.controlPoints.top)
    ) {
      this.window.document.body.style.cursor = "nesw-resize";
    } else if (
      this.mouse.controlPoints.top ||
      this.mouse.controlPoints.bottom
    ) {
      this.window.document.body.style.cursor = "ns-resize";
    } else if (
      this.mouse.controlPoints.left ||
      this.mouse.controlPoints.right
    ) {
      this.window.document.body.style.cursor = "ew-resize";
    } else if (this.mouse.over) {
      this.window.document.body.style.cursor = "pointer";
    } else {
      this.window.document.body.style.cursor = "default";
    }
  }

  drag() {
    const x = this.mouse.pageX - this.mouse.offsetX;
    const y = this.mouse.pageY - this.mouse.offsetY;
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
