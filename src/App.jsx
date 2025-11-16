import { useState } from "react"
import {
  Container, Typography, Box, Paper, Stack, CircularProgress,
  BottomNavigation, BottomNavigationAction
} from "@mui/material"
import Anchors from "./components/Anchors"
import Log from "./components/Log"
import LogHistory from "./components/LogHistory"
import Dashboard from "./components/Dashboard"
import Header from "./components/Header"
import Coach from "./components/Coach"
import Auth from "./components/Auth"
import Chat from "./components/chat/Chat"
import { AuthProvider, useAuthState } from "./context/AuthContext";
import HomeIcon from '@mui/icons-material/Home';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AnchorIcon from '@mui/icons-material/Anchor';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ChatBubble from '@mui/icons-material/ChatBubble';
import HistoryIcon from '@mui/icons-material/History';
import { Get } from "./utils/http";

function AppContent() {
  const [view, setView] = useState(0);
  const { isAuthenticated } = useAuthState();

  const handleChange = (event, newValue) => setView(newValue);

  const getUserData = () => {
    return Get(`${import.meta.env.VITE_API_URL}/user/me`);
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        pb: 12,
        pt: 0,
        px: { xs: 0, sm: 0 }
      }}
    >
      {isAuthenticated !== true ?
        <Auth /> :
        (isAuthenticated === null) ?
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 0 }}>
            <CircularProgress />
          </Box>
          : <>
            {view !== 5 && <Header />}
            <Stack sx={{ px: { xs: 2 } }} paddingTop={"1rem"} spacing={3}>
              {view === 5 ? (
                <Chat />
              ) : (
                <>
                  <Container sx={{ px: { xs: 0, sm: 0 } }} elevation={0}>

                    {view === 0 && <Dashboard goCoach={() => setView(1)} goLog={() => setView(3)} goChat={() => setView(5)} />}
                    {view === 1 && <Coach />}
                    {view === 2 && <Anchors />}
                    {view === 3 && <Log />}
                    {view === 4 && <LogHistory goBack={() => setView(0)} />}
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
                sx={{
                  '& .MuiBottomNavigationAction-root': {
                    minWidth: 'auto',
                    padding: '6px 0',
                    fontSize: '0.75rem'
                  },
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.65rem',
                    '&.Mui-selected': {
                      fontSize: '0.7rem'
                    }
                  }
                }}
              >
                <BottomNavigationAction label="Home" icon={<HomeIcon fontSize="small" />} />
                <BottomNavigationAction label="Coach" icon={<SelfImprovementIcon fontSize="small" />} />
                <BottomNavigationAction label="Anchors" icon={<AnchorIcon fontSize="small" />} />
                <BottomNavigationAction label="Log" icon={<EditNoteIcon fontSize="small" />} />
                <BottomNavigationAction label="History" icon={<HistoryIcon fontSize="small" />} />
                <BottomNavigationAction label="Chat" icon={<ChatBubble fontSize="small" />} />
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