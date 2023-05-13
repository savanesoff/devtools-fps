import DevtoolsFPS from "./devtools-fps";

declare global {
  interface Window {
    devtoolsFSP: DevtoolsFPS;
  }
}

const devtoolsFPS =
  window.devtoolsFSP ||
  new DevtoolsFPS({
    width: 220,
    height: 50,
    bufferSize: 220, // making it the same as width will ensure the pixel perfect rendering
  });

window.devtoolsFSP = devtoolsFPS;

export default devtoolsFPS;
