import { Paper, Typography } from "@mui/material";
import { getFPSColor } from "../src/colors";
import "./Demo.css";
import { useDevtoolsFPS } from "./useDevtoolsFPS";

export function FpsCard() {
  const { devtoolsFPS, _ } = useDevtoolsFPS();
  return (
    <Paper
      elevation={2}
      sx={{
        padding: 1,
      }}
    >
      <Typography variant="body1" component="p">
        <Typography variant="body1" component="span">
          fps:{" "}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          sx={{
            color: getFPSColor(devtoolsFPS.fps.fps),
          }}
        >
          {devtoolsFPS.fps.fps.toFixed(2)}
        </Typography>
      </Typography>

      <Typography variant="body1" component="p">
        <Typography variant="body1" component="span">
          avg:{" "}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          sx={{
            color: getFPSColor(devtoolsFPS.fps.averageFPS),
          }}
        >
          {devtoolsFPS.fps.averageFPS.toFixed(2)}
        </Typography>
      </Typography>
    </Paper>
  );
}
