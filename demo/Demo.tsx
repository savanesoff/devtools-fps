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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <label htmlFor="width">Width</label>
            <input
              type="range"
              min="200"
              max={window.innerWidth}
              name="width"
              defaultValue={200}
              onChange={(event) => {
                setSize({
                  width: Number(event.target.value),
                });
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <label htmlFor="height">Height</label>
            <input
              type="range"
              min="80"
              max="500"
              name="height"
              onChange={(event) => {
                setSize({
                  height: Number(event.target.value),
                });
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <label htmlFor="buffer">Buffer Size</label>
            <input
              type="range"
              min="100"
              max={window.innerWidth}
              name="buffer"
              onChange={(event) => {
                setBufferSize(Number(event.target.value));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Demo;
