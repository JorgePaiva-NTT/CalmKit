import React from "react"
import ReactDOM from "react-dom/client"
import { CssBaseline, GlobalStyles } from "@mui/material"
import App from "./App"
import "./styles.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CssBaseline />
    <GlobalStyles
      styles={{
        body: {
          backgroundColor: "#e3f2fd", // A light, soothing blue
        },
      }}
    />
    <App />
  </React.StrictMode>
)