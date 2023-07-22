import SpeedIcon from "@mui/icons-material/Speed";
import { Box, Slider, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { getFPSColor } from "../src/colors";

let stressLevel = 0;
let collection: HTMLDivElement[] = [];
// induce stress on the browser
function loadCPU() {
  collection.forEach((div) => {
    div.parentElement?.removeChild(div);
  });

  collection = Array.from({ length: stressLevel * 20 }).map(() => {
    const div = document.createElement("div");
    div.style.width = "1px";
    div.style.height = "1px";
    div.style.opacity = "0.01";
    div.style.position = "absolute";
    document.body.appendChild(div);
    return div;
  });

  requestAnimationFrame(loadCPU);
}
loadCPU();

export function CpuLoadSlider() {
  const [level, setLevel] = useState(0);
  const [color, setColor] = useState(getFPSColor(60));

  const loadCpu = useCallback((level: number) => {
    setLevel(level);
    // remove the divs from the DOM to prevent memory leak
    stressLevel = level;
  }, []);

  useEffect(() => {
    // interpolate  color value of 0-60 from level value of 0-100
    const color = getFPSColor(((100 - level) / 100) * 60);
    setColor(color);
  }, [level]);

  return (
    <Box>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <SpeedIcon
          sx={{
            color: color,
          }}
        />
        <Slider
          aria-label="Buffer Size"
          min={0}
          max={100}
          step={10}
          valueLabelDisplay="on"
          valueLabelFormat={(value) => `${value}%`}
          value={level}
          marks
          sx={{
            color: color,
            "& .MuiSlider-markLabel": {
              color: "secondary.main",
              marginTop: -1,
            },
            "& .MuiSlider-valueLabel": {
              backgroundColor: color,
            },
          }}
          onChange={(event, value) => {
            loadCpu(value as number);
          }}
        />
      </Stack>
      <Typography id="input-slider" gutterBottom align="center">
        CPU Load
      </Typography>
    </Box>
  );
}
