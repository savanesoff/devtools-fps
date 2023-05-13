import React from "react";
import devtoolsFPS from "../src";
import "./Demo.css";
import { useDevtoolsFPS } from "./useDevtoolsFPS";
// customize the devtools-fps panel
devtoolsFPS.config({
  bufferSize: window.innerWidth / 2,
  width: window.innerWidth / 2,
  height: 200,
  style: {
    backgroundColor: "rgba(0,0,30,0.5)",
    opacity: "0.9",
    left: window.innerWidth / 4 + "px",
    boxShadow: "5px 5px 10px 0 rgba(0,0,0,0.5)",
  },
});

function Demo() {
  const { devtoolsFPS } = useDevtoolsFPS();
  return (
    <div>
      <h1>
        Demo: <span className="brand">devtools-fps</span>
      </h1>
      <div>
        <div className="info-block">
          <p>Data</p>
          <div>fps: {devtoolsFPS.fps.fps}</div>
          <div>average: {devtoolsFPS.fps.averageFPS}</div>
        </div>
        <div className="info-block">
          <h3>Controls</h3>
          <div className="controls-container">
            <button
              onClick={() => devtoolsFPS.toggleRun()}
              style={{
                backgroundColor: !devtoolsFPS.run ? "pink" : "lightgreen",
              }}
            >
              {devtoolsFPS.run ? "Stop" : "Start"}
            </button>

            <Range
              exec={(value) => {
                devtoolsFPS.config({ bufferSize: value });
              }}
              min={100}
              max={window.innerWidth}
              name="Buffer Size"
              current={devtoolsFPS.fps.buffers.fps.length}
            />

            <Range
              exec={stress}
              min={0}
              max={100}
              name="Stress level %"
              current={0}
            />
          </div>
        </div>
        <div className="info-block">
          <h3>Info</h3>
          <p>
            Devtools-fps starts running as soon as you import the "module". No
            additional configurations required, however you can set defaults,
            see below, or click{" "}
            <a
              style={{
                color: "lightblue",
              }}
              href="https://github.com/savanesoff/devtools-fps#readme"
            >
              here for more info
            </a>
          </p>
          <ol>
            <li>
              Use your cursor to drag the{" "}
              <span className="brand">devtools-fps</span> to the desired
              location
            </li>
            <li>
              Click on <span className="brand">devtools-fps</span> to toggle
              "INSPECT" mode
              <ol>
                <li>
                  While in "INSPECT" mode, you can see tooltip with buffer FPS
                  and time origin of the event. Use it to find out what is
                  causing the FPS drop.
                </li>
              </ol>
            </li>
            <li>
              Use your cursor to resize{" "}
              <span className="brand">devtools-fps</span> however you need
            </li>

            <li>
              Use "devtoolFPS.config()" to set:{" "}
              <ol>
                <li>bufferSize: number</li>
                <li>width: number</li>
                <li>height: number</li>
                <li>style: CSSProperties</li>
              </ol>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Range component
function Range({
  exec,
  name,
  min,
  max,
  current,
}: {
  exec: (value: number) => void;
  name: string;
  min: number;
  max: number;
  current?: number;
}) {
  const [value, setValue] = React.useState(current || min);
  return (
    <div className="range-container">
      <label htmlFor={name}>
        {name}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        name={name}
        defaultValue={current || min}
        onChange={(event) => {
          setValue(Number(event.target.value));
          exec(Number(event.target.value));
        }}
      />
    </div>
  );
}

let stressLevel = 0;

// induce stress on the browser
function stress(level: number) {
  stressLevel = level;
  const collection = Array.from({ length: stressLevel * 5 }).map(() => {
    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.opacity = "0.01";
    div.style.position = "absolute";
    document.body.appendChild(div);
    return div;
  });
  requestAnimationFrame(() => {
    collection.forEach((div) => {
      div.parentElement?.removeChild(div);
    });

    if (stressLevel > 0) {
      stress(stressLevel);
    }
  });
}

export default Demo;
