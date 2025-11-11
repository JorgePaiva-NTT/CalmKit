import { useState } from "react"
import {
  Container, Typography, Box, Paper, Stack, CircularProgress,
  BottomNavigation, BottomNavigationAction
} from "@mui/material"
import Anchors from "./components/Anchors"
import Log from "./components/Log"
import Dashboard from "./components/Dashboard"
import Coach from "./components/Coach"
import Auth from "./components/Auth"
import Chat from "./components/chat/Chat"
import { AuthProvider, useAuthState } from "./context/AuthContext";
import HomeIcon from '@mui/icons-material/Home';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AnchorIcon from '@mui/icons-material/Anchor';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ChatBubble from '@mui/icons-material/ChatBubble';

function AppContent() {
  const [view, setView] = useState(0);
  const { isAuthenticated } = useAuthState();

  const handleChange = (event, newValue) => setView(newValue);

  return (
    <Container
      maxWidth="md"
      sx={{
        pb: 12,
        pt: 2,
        px: { xs: 0, sm: 2 }
      }}
    >
      {isAuthenticated !== true ?
        <Auth /> :
        (isAuthenticated === null) ?
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
          : <>
            <Stack spacing={3}>
              {view === 4 ? ( // Chat view has its own header management
                <Chat />
              ) : (
                <>
                  <Container sx={{ px: { xs: 0, sm: 2 } }} elevation={0}>
                    {view === 0 && <Dashboard goCoach={() => setView(1)} goLog={() => setView(3)} goChat={() => setView(4)} />}
                    {view === 1 && <Coach />}
                    {view === 2 && <Anchors />}
                    {view === 3 && <Log />}
                  </Container>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ textAlign: "center" }}>
                    Not medical advice — for grounding & reflection only.
                  </Typography>
                </>
              )}
            </Stack>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
              <BottomNavigation
                showLabels
                value={view}
                onChange={handleChange}
              >
                <BottomNavigationAction label="Home" icon={<HomeIcon />} />
                <BottomNavigationAction label="Coach" icon={<SelfImprovementIcon />} />
                <BottomNavigationAction label="Anchors" icon={<AnchorIcon />} />
                <BottomNavigationAction label="Log" icon={<EditNoteIcon />} />
                <BottomNavigationAction label="Chat" icon={<ChatBubble />} />
              </BottomNavigation>
            </Paper>
          </>
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