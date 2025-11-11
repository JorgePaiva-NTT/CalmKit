import { createTheme } from "@mui/material/styles";

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: {
              main: "#13ec6d",
              contrastText: "#102218",
            },
            secondary: {
              main: "#e0e0e0",
              contrastText: "#000",
            },
            background: {
              default: "#f6f8f7",
              paper: "#ffffff",
            },
          }
        : {
            primary: {
              main: "#13ec6d",
              contrastText: "#102218",
            },
            secondary: {
              main: "#28392f",
              contrastText: "#ffffff",
            },
            background: {
              default: "#102218",
              paper: "#1c2720",
            },
            text: {
              primary: "#ffffff",
              secondary: "#9db9a8",
            },
          }),
    },
    typography: {
      fontFamily: ["Lexend", "sans-serif"].join(","),
    },
  });

export default getTheme;
