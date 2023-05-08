import { getFPSColor } from "./colors";

declare global {
  interface Window {
    devtools_fps_tooltip: HTMLDivElement | null;
  }
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  // @ts-ignore-next-line
  fractionalSecondDigits: 3,
  hourCycle: "h23",
};

const style = {
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
};

function getTooltip(window: Window): HTMLDivElement {
  const tooltip = window.devtools_fps_tooltip || createTooltip();
  if (!tooltip.parentElement) {
    document.body.appendChild(tooltip);
  }

  window.devtools_fps_tooltip = tooltip;
  return tooltip;
}

function createTooltip() {
  const tooltip = document.createElement("div");
  tooltip.id = "devtools-fps-tooltip";
  // @ts-ignore-next-line
  Object.assign(tooltip.style, style);
  return tooltip;
}

function setTooltipPosition(tooltip: HTMLElement, e: MouseEvent) {
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;

  const top = e.clientY - height < 0 ? 0 : e.clientY - height;
  const left =
    e.clientX + width > window.innerWidth
      ? window.innerWidth - width
      : e.clientX;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

export function renderTooltip(e: MouseEvent, fps: number, timestamp: number) {
  const tooltip = getTooltip(e.view || window);
  const time = new Date(performance.timeOrigin + timestamp).toLocaleTimeString(
    "en-US",
    TIME_FORMAT
  );
  tooltip.innerText = `${fps.toFixed(1)} fps\n${time}`;
  setTooltipPosition(tooltip, e);
  tooltip.style.color = getFPSColor(fps);
}

export function removeTooltip() {
  const tooltip = window.devtools_fps_tooltip;
  if (tooltip && tooltip.parentElement) {
    tooltip.parentElement.removeChild(tooltip);
  }
  window.devtools_fps_tooltip = null;
}
