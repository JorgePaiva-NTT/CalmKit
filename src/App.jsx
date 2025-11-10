import { useState } from "react"
import {
  Container, Typography, Box, Paper, Stack, CircularProgress, GlobalStyles,
  BottomNavigation, BottomNavigationAction, Avatar,
  Tooltip, IconButton, ListItemIcon, Menu, MenuItem
} from "@mui/material"
import Coach from "./components/Coach"
import Anchors from "./components/Anchors"
import Log from "./components/Log"
import Dashboard from "./components/Dashboard"
import Auth from "./components/Auth"
import Chat from "./components/chat/Chat"
import { AuthProvider, useAuthDispatch, useAuthState } from "./context/AuthContext";
import HomeIcon from '@mui/icons-material/Home';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AnchorIcon from '@mui/icons-material/Anchor';
import EditNoteIcon from '@mui/icons-material/EditNote';
import Logout from '@mui/icons-material/Logout';
import ChatBubble from '@mui/icons-material/ChatBubble';

function AppContent() {
  const [view, setView] = useState(0); // 0=Home, 1=Coach, 2=Anchors, 3=Log, 4=Export
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated } = useAuthState();
  const { logout } = useAuthDispatch();

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event, newValue) => setView(newValue);

  const username = sessionStorage.getItem("username") || "";
  const avatarColor = sessionStorage.getItem("avatarColor") || "primary.main";

  return (
    <Container maxWidth="sm" sx={{ pb: 12, pt: 4 }}>
      {isAuthenticated !== true ?
        <Auth /> :
        (isAuthenticated === null) ?
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
          : <>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                  Calm Kit
                </Typography>
                <Tooltip title="Logout">
                  <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}>
                    <Avatar sx={{ bgcolor: avatarColor, width: 40, height: 40 }}>
                      {username.split(" ")[0][0]?.toUpperCase()}
                      {username.split(" ").length > 1 ? username.split(" ")[1][0]?.toUpperCase() : ""}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                  <MenuItem>
                    <ListItemIcon sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar /> {username}
                    </ListItemIcon>
                  </MenuItem>
                  <MenuItem onClick={() => { logout(); handleClose(); }}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>

              </Box>

              <Container sx={{}} elevation={0}>
                {view === 0 && <Dashboard goCoach={() => setView(1)} goLog={() => setView(3)} />}
                {view === 1 && <Coach />}
                {view === 2 && <Anchors />}
                {view === 3 && <Log />}
                {view === 4 && <Chat />}
              </Container>

              <Typography variant="caption" display="block" color="text.secondary" sx={{ textAlign: "center" }}>
                Not medical advice — for grounding & reflection only.
              </Typography>
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