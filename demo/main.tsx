import { grey } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, Theme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import Demo from "./Demo";

const theme: Theme = createTheme({
  typography: {
    allVariants: {
      color: "#dedede",
    },
  },
  palette: {
    background: {
      default: "#3d3c3c",
      paper: "#242424",
    },
    primary: {
      // Purple and green play nicely together.
      main: grey[600],
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#11cb5f",
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
