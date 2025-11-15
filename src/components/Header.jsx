import { useState } from "react";
import {
    Box, Typography, Tooltip, IconButton, Avatar, Menu, MenuItem, ListItemIcon, Switch
} from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuthDispatch } from "../context/AuthContext";
import { useThemeContext } from "../ThemeContext";

export default function Header() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { logout } = useAuthDispatch();
    const { mode, toggleTheme } = useThemeContext();

    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
    const username = sessionStorage.getItem("username") || "";
    const avatarColor = sessionStorage.getItem("avatarColor") || "primary.main";

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }

    return (
        <Box sx={{
            px: { xs: 1, sm: 1 },
            py: { xs: 1, sm: 1 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: "secondary.main",
        }}>
            <Box>
                <Typography variant="h5" component="h1" fontWeight="bold">
                    {getGreeting()}, {username.split(" ")[0] || 'there'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {today}
                </Typography>
            </Box>
            <Tooltip title="Account menu">
                <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
                    <Avatar sx={{ bgcolor: avatarColor, width: 40, height: 40 }}>
                        {username.split(" ")[0][0]?.toUpperCase()}
                        {username.split(" ").length > 1 ? username.split(" ")[1][0]?.toUpperCase() : ""}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl}
                id="account-menu-app"
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
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem>
                    <ListItemIcon sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar /> {username}
                    </ListItemIcon>
                </MenuItem>
                <MenuItem onClick={(e) => e.stopPropagation()}>
                    <ListItemIcon>
                        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </ListItemIcon>
                    <Typography>Dark Mode</Typography>
                    <Switch checked={mode === 'dark'} onChange={toggleTheme} sx={{ ml: 'auto' }} />
                </MenuItem>
                <MenuItem onClick={() => { logout(); handleClose(); }}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
}
