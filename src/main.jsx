import React, { useMemo } from "react"
import { inject } from "@vercel/analytics"
import { StyledEngineProvider } from '@mui/material/styles';
import ReactDOM from "react-dom/client"
import { CssBaseline } from "@mui/material"
import { ThemeProvider } from '@mui/material/styles';
import App from "./App"
import "./styles.css"
import getTheme from "./theme";
import { ThemeContextProvider, useThemeContext } from "./ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

function ThemedApp() {
  const { mode } = useThemeContext();
  const theme = useMemo(() => getTheme(mode), [mode]);

  inject();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeContextProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <ThemedApp />
        </GoogleOAuthProvider>
      </ThemeContextProvider>
    </StyledEngineProvider>
  </React.StrictMode>
)