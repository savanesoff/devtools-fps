/**
 * Interpolates between colors based on FPS value
 */
export function getFPSColor(fps: number) {
  return interpolateColor(fps);
  return fps > 59
    ? "#42e883"
    : fps > 50
    ? "#42e8e3"
    : fps > 25
    ? "#f8b400"
    : "#ff007b";
}
function interpolateColor(value: number): string {
  let colorStart, colorEnd, colorDiff;

  if (value < 25) {
    colorStart = parseInt("ff007b", 16);
    colorEnd = parseInt("f8b400", 16);
    colorDiff = colorEnd - colorStart;
    value /= 25;
  } else if (value < 50) {
    colorStart = parseInt("f8b400", 16);
    colorEnd = parseInt("42e8e3", 16);
    colorDiff = colorEnd - colorStart;
    value = (value - 25) / 25;
  } else if (value < 55) {
    colorStart = parseInt("42e8e3", 16);
    colorEnd = parseInt("42e883", 16);
    colorDiff = colorEnd - colorStart;
    value = (value - 50) / 5;
  } else {
    return "#42e883";
  }

  const red = (colorStart >> 16) & 255;
  const green = (colorStart >> 8) & 255;
  const blue = colorStart & 255;

  const newRed = Math.floor(red + (value * colorDiff) / 65536);
  const newGreen = Math.floor(green + (((value * colorDiff) / 256) % 256));
  const newBlue = Math.floor(blue + ((value * colorDiff) % 256));

  return `#${toHexString(newRed)}${toHexString(newGreen)}${toHexString(
    newBlue
  )}`;
}

function toHexString(value: number): string {
  const hex = value.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
