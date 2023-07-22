import { Box, Button, Container, Link, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import { BufferSizeSlider } from "./BufferSizeSlider";
import { CpuLoadSlider } from "./CpuLoadSlider";
import "./Demo.css";
import { FpsCard } from "./FpsCard";
import { useDevtoolsFPS } from "./useDevtoolsFPS";

function Demo() {
  const { devtoolsFPS } = useDevtoolsFPS();
  return (
    <Container maxWidth="lg">
      <Box
        flex={1}
        display="flex"
        flexDirection={"column"}
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h2">devtools-fps demo</Typography>

        <Link href="https://github.com/savanesoff/overdrag">
          <img src="https://raw.githubusercontent.com/savanesoff/protosus/main/public/icons/by-protosus.svg" />
        </Link>
      </Box>
      <div>
        <Paper elevation={2}>
          <Typography variant="h6" component="h2">
            Controls
          </Typography>

          <Grid container spacing={2}>
            <Grid xs={3} flexDirection="row" justifyContent={"flex-start"}>
              <Button
                onClick={devtoolsFPS.toggleRun}
                variant="contained"
                sx={{
                  color: !devtoolsFPS.run ? "#a33d4e" : "#1d9f81",
                }}
              >
                {devtoolsFPS.run ? "Stop" : "Start"}
              </Button>
              <FpsCard />
            </Grid>
            <Grid xs={3}>
              <BufferSizeSlider />
            </Grid>
            <Grid xs={3}>
              <CpuLoadSlider />
            </Grid>
          </Grid>
        </Paper>
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
    </Container>
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
