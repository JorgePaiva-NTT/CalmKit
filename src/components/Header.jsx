import { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, InputBase, Box, Typography, Tooltip, IconButton, Avatar, Menu, MenuItem, ListItemIcon, Switch,
    Divider, Snackbar, Paper, LinearProgress
} from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuthDispatch, useAuthState } from "../context/AuthContext";
import { useThemeContext } from "../ThemeContext";
import { savePasscode, getLocalSaltB64 } from "../utils/crypto";
import { Get, Put } from "../utils/http";

export default function Header() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [passcodeDialog, setPasscodeDialog] = useState({ open: false, value: '', error: '' });
    const [migration, setMigration] = useState({ open: false, job: null });

    const { token } = useAuthState();
    const { logout } = useAuthDispatch();
    const { mode, toggleTheme } = useThemeContext();

    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
    const username = sessionStorage.getItem("username") || "";
    const avatarColor = sessionStorage.getItem("avatarColor") || "primary.main";

    const confirmPasscode = async () => {
        const code = passcodeDialog.value.trim();
        if (code.length !== 4) {
            setPasscodeDialog((s) => ({ ...s, error: 'Please enter a valid 4-digit code' }));
            return;
        }
        try {
            savePasscode(code);
            console.log(token);
            const apiUrl = `${import.meta.env.VITE_API_URL}/passphrase`;
            const clientSalt = getLocalSaltB64();
            const result = await Put(apiUrl, { passcode: code, clientSalt }, token);
            if (result && result.success) {
                setPasscodeDialog({ open: false, value: '', error: '' });
                setMigration({ open: true, job: null });
            } else {
                setPasscodeDialog((s) => ({ ...s, error: result?.msg || 'Failed to update passcode. Try again.' }));
            }
        } catch (error) {
            setPasscodeDialog((s) => ({ ...s, error: 'Failed to set passcode. Try again.' }));
        }
    }

    useEffect(() => {
        if (!migration.open) return;
        let cancelled = false;
        const tokenUsed = token || sessionStorage.getItem('token');
        const poll = async () => {
            const status = await Get(`${import.meta.env.VITE_API_URL}/passphrase/status`, tokenUsed);
            if (!cancelled && status?.success) {
                setMigration((m) => ({ ...m, job: status.job }));
                const st = status.job?.state;
                if (st === 'completed' || st === 'failed') {
                    setTimeout(() => {
                        if (!cancelled) setMigration({ open: false, job: null });
                    }, 1200);
                }
            }
        };
        const id = setInterval(poll, 1500);
        poll();
        return () => { cancelled = true; clearInterval(id); };
    }, [migration.open, token]);

    const cancelPasscode = () => {
        setPasscodeDialog({ open: false, value: '', error: '' });
    }

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
            <Dialog open={passcodeDialog.open} disableEscapeKeyDown>
                <DialogTitle sx={{ fontWeight: 700 }}>Enter Passcode</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 1 }}>
                        Enter your 4-digit code to unlock your history.
                    </DialogContentText>
                    <InputBase
                        autoFocus
                        fullWidth
                        placeholder="••••"
                        inputMode="numeric"
                        pattern="\\d{4}"
                        value={passcodeDialog.value}
                        onChange={(e) => setPasscodeDialog((s) => ({ ...s, value: e.target.value.replace(/[^0-9]/g, '').slice(0, 4), error: '' }))}
                        sx={{ border: 1, borderColor: 'divider', px: 2, py: 1.25, borderRadius: 2, fontSize: '1.25rem', letterSpacing: '0.4em' }}
                    />
                    {passcodeDialog.error && (
                        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{passcodeDialog.error}</Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button variant="outlined" onClick={cancelPasscode}>Cancel</Button>
                    <Button variant="contained" onClick={confirmPasscode} disabled={passcodeDialog.value.length !== 4}>Unlock</Button>
                </DialogActions>
            </Dialog>

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
                <MenuItem onClick={(e) => setPasscodeDialog((s) => ({ ...s, open: true }))}>
                    <Typography>Set Passcode</Typography>
                </MenuItem>
                <Divider></Divider>
                <MenuItem onClick={() => { logout(); handleClose(); }}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            <Snackbar
                open={migration.open}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                onClose={() => setMigration({ open: false, job: null })}
            >
                <Paper elevation={3} sx={{ px: 2, py: 1.5, borderRadius: 2, minWidth: 320 }}>
                    {(() => {
                        const job = migration.job;
                        const total = job?.total || 0;
                        const processed = job?.processed || 0;
                        const skipped = job?.skipped || 0;
                        const errors = job?.errors || 0;
                        const percent = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
                        const state = job?.state || 'starting';
                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    Re-encrypting your logs… {state === 'completed' ? 'Done' : state === 'failed' ? 'Failed' : ''}
                                </Typography>
                                <LinearProgress variant={total > 0 ? 'determinate' : 'indeterminate'} value={percent} />
                                <Typography variant="caption" color="text.secondary">
                                    {processed}/{total} processed • {skipped} skipped • {errors} errors
                                </Typography>
                            </Box>
                        );
                    })()}
                </Paper>
            </Snackbar>
        </Box>
    );
}
