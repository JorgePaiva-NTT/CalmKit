import { useState } from "react"
import { Container, Typography, Box, Tabs, Tab, Paper, Button } from "@mui/material"
import Coach from "./components/Coach"
import Anchors from "./components/Anchors"
import Log from "./components/Log"
import Export from "./components/Export"
import Dashboard from "./components/Dashboard"
import Auth from "./components/Auth"
import { AuthProvider, useAuthDispatch, useAuthState } from "./context/AuthContext";

function AppContent() {
  const [view, setView] = useState(0); // 0=Home, 1=Coach, 2=Anchors, 3=Log, 4=Export
  const { isAuthenticated } = useAuthState();
  const { logout } = useAuthDispatch();

  const handleChange = (event, newValue) => setView(newValue);

  return (
    <Container maxWidth="sm" sx={{ my: 2 }}>
      {isAuthenticated !== true ?
        <Auth /> :
        (isAuthenticated === null) ?
          <Typography>Loading...</Typography>
          :
          <div>
            <Box sx={{ textAlign: "center", my: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Calm Kit
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button onClick={logout} size="small">Logout</Button>
            </Box>

            <Paper elevation={2}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={view} onChange={handleChange} aria-label="app navigation" variant="fullWidth">
                  <Tab label="Home" />
                  <Tab label="Coach" />
                  <Tab label="Anchors" />
                  <Tab label="Log" />
                </Tabs>
              </Box>
              <Box sx={{ p: 3 }}>
                {view === 0 && <Dashboard goCoach={() => setView(1)} goLog={() => setView(3)} />}
                {view === 1 && <Coach />}
                {view === 2 && <Anchors />}
                {view === 3 && <Log />}
                {view === 4 && <Export />}
              </Box>
            </Paper>

            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
              Not medical advice — for grounding & reflection only.
            </Typography>
          </div>
      }
    </Container>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}