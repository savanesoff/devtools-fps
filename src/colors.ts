/**
 * Interpolates between colors based on FPS value
 */
export function getFPSColor(fps: number) {
  return fps > 59
    ? "#5be7a9"
    : fps > 55
    ? "#8dc6ff"
    : fps > 25
    ? "#f8b400"
    : "#ff007b";
}
