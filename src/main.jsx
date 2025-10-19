import React from "react"
import { StyledEngineProvider } from '@mui/material/styles';
import ReactDOM from "react-dom/client"
import { CssBaseline, GlobalStyles } from "@mui/material"
import App from "./App"
import "./styles.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
  </React.StrictMode>
)