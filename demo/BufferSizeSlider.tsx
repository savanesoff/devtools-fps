import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import { Box, Slider, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDevtoolsFPS } from "./useDevtoolsFPS";

export function BufferSizeSlider() {
  const { devtoolsFPS } = useDevtoolsFPS();
  const [value, setValue] = useState(devtoolsFPS.fps.buffers.fps.length);
  return (
    <Box>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <DensitySmallIcon color="secondary" />
        <Slider
          aria-label="Buffer Size"
          min={100}
          max={window.innerWidth}
          step={50}
          valueLabelDisplay="on"
          value={value}
          marks={[{ value: devtoolsFPS.position.width, label: "Fit" }]}
          color="secondary"
          sx={{
            "& .MuiSlider-markLabel": {
              color: "secondary.main",
              marginTop: -1,
            },
            "& .MuiSlider-valueLabel": {
              backgroundColor: "secondary.dark",
            },
          }}
          onChange={(event, value) => {
            devtoolsFPS.config({ bufferSize: value as number });
            setValue(value as number);
          }}
        />
      </Stack>
      <Typography id="input-slider" gutterBottom align="center">
        Buffer Size
      </Typography>
    </Box>
  );
}
