import React from "react";
import { useDevtoolsFPS } from "./useDevtoolsFPS";

function Demo() {
  const { state, toggleRender, toggleRun, setSize, setBufferSize } =
    useDevtoolsFPS();
  return (
    <div>
      <h1>devtools-fps</h1>
      <div>
        <p>Controls</p>
        {Object.entries(state).map(([key, value]) => (
          <div key={key}>
            {" "}
            {key}: {value.toString()}{" "}
          </div>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            alignItems: "center",
          }}
        >
          <button
            onClick={toggleRender}
            style={{
              backgroundColor: !state.render ? "pink" : "lightgreen",
            }}
          >
            {state.render ? "Stop Rendering" : "Start Rendering"}
          </button>
          <button
            onClick={toggleRun}
            style={{
              backgroundColor: !state.run ? "pink" : "lightgreen",
            }}
          >
            {state.run ? "Stop Running" : "Start Running"}
          </button>

          <Range
            exec={(value) => {
              setSize({
                width: value,
              });
            }}
            min={100}
            max={window.innerWidth}
            name="Width"
            current={200}
          />
          <Range
            exec={(value) => {
              setSize({
                height: value,
              });
            }}
            min={100}
            max={500}
            name="Height"
            current={200}
          />

          <Range
            exec={setBufferSize}
            min={100}
            max={window.innerWidth}
            name="Buffer Size"
            current={200}
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
    </div>
  );
}
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
      }}
    >
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

function range(from: number, to: number) {
  return {
    [Symbol.iterator]: function* () {
      for (let i = from; i <= to; i++) {
        yield i;
      }
    },
  };
}

export default Demo;
