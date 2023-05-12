import { EventEmitter } from "events";
export default class StateMouse extends EventEmitter {
  pageX: number = 0;
  pageY: number = 0;
  downX: number = 0;
  downY: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  dragging = false;
  down = false;
  tolerance = 10;
  canvas: HTMLCanvasElement;
  rect: DOMRect;
  startRect: DOMRect;
  controlPoints = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };
  controlsActive = false;
  cursor = "pointer";
  over = false;
  click = false;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.rect = this.startRect = this.canvas.getBoundingClientRect();
    this.onMove = this.onMove.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.canvas.ownerDocument.addEventListener("mousemove", this.onMove);
    this.canvas.ownerDocument.addEventListener("mousedown", this.onDown);
  }

  private onMove(e: MouseEvent) {
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    if (this.down) {
      // update rect only when mouse is down
      this.rect = this.canvas.getBoundingClientRect();
    } else {
      this.updateControlPointsState();
      this.over = this.isMouseOver();
      this.controlsActive = this.isControlPointActive();
    }
    this.emit("update", this);
  }

  private onDown(e: MouseEvent) {
    if (!this.over) {
      return;
    }
    e.preventDefault();
    this.down = true;
    this.startRect = this.rect;
    this.downX = this.pageX;
    this.downY = this.pageY;
    this.offsetX = this.pageX - this.rect.left;
    this.offsetY = this.pageY - this.rect.top;
    this.dragging = !this.controlsActive;
    this.canvas.ownerDocument.addEventListener("mouseup", this.onUp);
    this.emit("update", this);
  }

  private onUp(e: MouseEvent) {
    e.preventDefault();
    this.click = this.isClick();
    this.down = false;
    this.dragging = false;
    this.canvas.ownerDocument.removeEventListener("mouseup", this.onUp);
    this.emit("update", this);
    if (this.click) this.emit("click", this);
  }

  private isClick() {
    return (
      Math.abs(this.pageX - this.downX) < this.tolerance &&
      Math.abs(this.pageY - this.downY) < this.tolerance
    );
  }

  /**
   * Sets control points activation status (Edge of canvas)
   */
  private updateControlPointsState() {
    this.controlPoints.left =
      this.over && Math.abs(this.pageX - this.rect.left) < this.tolerance;
    this.controlPoints.right =
      this.over && Math.abs(this.pageX - this.rect.right) < this.tolerance;
    this.controlPoints.top =
      this.over && Math.abs(this.pageY - this.rect.top) < this.tolerance;
    this.controlPoints.bottom =
      this.over && Math.abs(this.pageY - this.rect.bottom) < this.tolerance;
  }

  private isControlPointActive() {
    return (
      this.controlPoints.left ||
      this.controlPoints.right ||
      this.controlPoints.top ||
      this.controlPoints.bottom
    );
  }

  private isMouseOver() {
    return (
      this.rect.left - this.tolerance <= this.pageX &&
      this.pageX < this.rect.right + this.tolerance &&
      this.rect.top - this.tolerance < this.pageY &&
      this.pageY < this.rect.bottom + this.tolerance
    );
  }
}
