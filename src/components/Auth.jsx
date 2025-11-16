/* eslint-disable no-unused-vars */
import React, { use, useState } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab, Stack } from "@mui/material";
import { useAuthDispatch } from "../context/AuthContext";
import { styled } from '@mui/material/styles';
import { FormControl, FormLabel } from "@mui/material";
import PasscodeDialog from "./PasscodeDialog";
import { savePasscode, getLocalSaltB64 } from "../utils/crypto";
import { Put } from "../utils/http";

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
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));


export default function Auth() {
  const [view, setView] = useState(0); // 0 for Login, 1 for Register
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState(null);
  const { login, register, setIsAuthenticated } = useAuthDispatch();
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);
  const [registrationToken, setRegistrationToken] = useState(null);

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


  return (
    <SignUpContainer direction="column" justifyContent="space-between">
      <Card >
        <Typography variant="h4" component="h1" sx={{ textAlign: "center", fontWeight: 700, mb: 2 }}>
          Welcome to Calm Kit
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={view} onChange={handleChange} variant="fullWidth">
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </Box>
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
              color={passwordError ? 'error' : 'primary'}
              onChange={handleFormChange}
              value={form.email}
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
          >
            {view === 0 ? "Login" : "Create Account"}
          </Button>
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