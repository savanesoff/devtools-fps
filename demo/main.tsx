import { grey } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, Theme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import { getFPSColor } from "../src/colors";
import Demo from "./Demo";

const theme: Theme = createTheme({
  typography: {
    allVariants: {
      color: "#afafaf",
    },
  },

  palette: {
    background: {
      default: "#e6e6e6",
      paper: "#1c1c1c",
    },
    primary: {
      // Purple and green play nicely together.
      main: grey[600],
    },
    secondary: {
      // This is green.A700 as hex.
      main: getFPSColor(60),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Demo />
    </ThemeProvider>
  </React.StrictMode>
);
