import DevtoolsFPS from "./devtools-fps";

declare global {
  interface Window {
    devtoolsFSP: DevtoolsFPS;
  }
}

const devtoolsFPS =
  window.devtoolsFSP ||
  new DevtoolsFPS({
    width: 200,
    height: 80,
    bufferSize: 200, // making it the same as width will ensure the pixel perfect rendering
  });

window.devtoolsFSP = devtoolsFPS;

export default devtoolsFPS;
