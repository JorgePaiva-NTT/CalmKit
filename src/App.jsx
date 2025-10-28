import { useState } from "react"
import { Container, Typography, Box, Tabs, Tab, Paper, Button, Stack, CircularProgress } from "@mui/material"
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {isAuthenticated !== true ?
        <Auth /> :
        (isAuthenticated === null) ?
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
          :
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                Calm Kit
              </Typography>
              <Button onClick={logout} size="small" variant="outlined">Logout</Button>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={view} onChange={handleChange} aria-label="app navigation" variant="fullWidth">
                  <Tab label="Home" />
                  <Tab label="Coach" />
                  <Tab label="Anchors" />
                  <Tab label="Log" />
                  {/* The Export tab is currently hidden but can be enabled here */}
                </Tabs>
              </Box>
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {view === 0 && <Dashboard goCoach={() => setView(1)} goLog={() => setView(3)} />}
                {view === 1 && <Coach />}
                {view === 2 && <Anchors />}
                {view === 3 && <Log />}
                {/* {view === 4 && <Export />} */}
              </Box>
            </Paper>

            <Typography variant="caption" display="block" color="text.secondary" sx={{ textAlign: "center" }}>
              Not medical advice — for grounding & reflection only.
            </Typography>
          </Stack>
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