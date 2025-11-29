/* eslint-disable no-unused-vars */
import React, { use, useState } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab, Stack, Divider } from "@mui/material";
import { useAuthDispatch } from "../context/AuthContext";
import { styled } from '@mui/material/styles';
import { FormControl, FormLabel } from "@mui/material";
import PasscodeDialog from "./PasscodeDialog";
import { savePasscode, getLocalSaltB64 } from "../utils/crypto";
import { Put } from "../utils/http";
import { GoogleLogin } from "@react-oauth/google";

const Card = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(192, 34%, 31%, 1.00), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function Auth() {
  const [view, setView] = useState(0); // 0 for Login, 1 for Register
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState(null);
  const { login, register, socialLogin, setIsAuthenticated } = useAuthDispatch();
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [registrationToken, setRegistrationToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');

  const handleChange = (event, newValue) => {
    setView(newValue);
    setError(null);
    setForm({ email: "", password: "" });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (view === 0) {
        await login(form);
      } else {
        const token = await register(form);
        setRegistrationToken(token);
        setShowPasscodeDialog(true);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeConfirm = async (code) => {
    try {
      savePasscode(code);
      const token = registrationToken || localStorage.getItem('token');
      const apiUrl = `${import.meta.env.VITE_API_URL}/passphrase`;
      const clientSalt = getLocalSaltB64();
      await Put(apiUrl, { passcode: code, clientSalt }, token);
      setShowPasscodeDialog(false);
      setIsAuthenticated(token);
    } catch (error) {
      console.error('Failed to set passcode:', error);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (view === 1 && !username) {
      setUsernameError(true);
      setUsernameErrorMessage('Username is required.');
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password.value || password.value.length < 3) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 3 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      console.log(tokenResponse);
      await socialLogin("google", { token: tokenResponse.credential });
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed.");
  };


  return (
    <SignUpContainer direction="column" justifyContent="space-between">

      <Card sx={(theme) => ({
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        ...theme.applyStyles('dark', {
          backgroundColor: 'rgba(73, 73, 73, 0.26)',
        }),
      })}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={(theme) => ({
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 700,
              color: '#1a237e', // Dark Navy
              letterSpacing: '-1px',
              fontSize: '3.5rem',
              ...theme.applyStyles('dark', {
                color: '#84fab0', // Teal for dark mode
              }),
            })}
          >
            CalmKit
          </Typography>
          <Typography
            variant="subtitle1"
            sx={(theme) => ({
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 500,
              color: '#1a237e',
              letterSpacing: '2px',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              opacity: 0.7,
              mt: -0.5,
              ...theme.applyStyles('dark', {
                color: '#84fab0',
              }),
            })}
          >
            Wellness App
          </Typography>
        </Box>
        <Tabs
          value={view}
          onChange={handleChange}
          variant="fullWidth"
          TabIndicatorProps={{ sx: { display: 'none' } }}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 3,
            minHeight: '48px',
          }}
        >
          <Tab
            label="Login"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
              '&:not(.Mui-selected)': {
                backgroundColor: 'transparent',
                color: 'text.secondary',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          />
          <Tab
            label="Register"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
              },
              '&:not(.Mui-selected)': {
                backgroundColor: 'transparent',
                color: 'text.secondary',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          />
        </Tabs>
        <Box component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <TextField
              autoComplete="email"
              name="email"
              required
              fullWidth
              id="email"
              placeholder="email"
              error={emailError}
              helperText={emailErrorMessage}
              variant="outlined"
              color={emailError ? 'error' : 'primary'}
              onChange={handleFormChange}
              value={form.email}
              sx={{
                '& .MuiOutlinedInput-input': {
                  boxShadow: '0 0 0 100px #354d54 inset !important',
                },
              }}
            />
          </FormControl>
          {view === 1 ?
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                autoComplete="username"
                name="username"
                error={usernameError}
                helperText={usernameErrorMessage}
                color={usernameError ? 'error' : 'primary'}
                onChange={handleFormChange}
                required
                fullWidth
                id="username"
                placeholder="username"
                value={form.username}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    boxShadow: '0 0 0 100px #354d54 inset !important',
                  },
                }}
              ></TextField>
            </FormControl>
            : null}
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              id="password"
              placeholder="password"
              error={passwordError}
              helperText={passwordErrorMessage}
              color={passwordError ? 'error' : 'primary'}
              name="password"
              type="password"
              value={form.password}
              onChange={handleFormChange}
              required
              fullWidth
              sx={{
                '& .MuiOutlinedInput-input': {
                  boxShadow: '0 0 0 100px #354d54 inset !important',
                },
              }}
            />
          </FormControl>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
            disabled={loading}
            size="large"
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {view === 0 ? "Login" : "Create Account"}
            </Typography>
          </Button>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    width="100%"
                  />
                </Box>
              </Box>

            </Box>
          </Box>
        </Box>
      </Card>
      <PasscodeDialog
        open={showPasscodeDialog}
        onSubmit={handlePasscodeConfirm}
        cancelDisabled={true}
        error={error}
      />
    </SignUpContainer >
  );
}