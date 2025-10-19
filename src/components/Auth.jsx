/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Box, Typography, TextField, Button, Tabs, Tab, Stack } from "@mui/material";
import { useAuthDispatch } from "../context/AuthContext";
import { styled } from '@mui/material/styles';
import { FormControl, FormLabel } from "@mui/material";

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


export default function Auth(props) {
  const [view, setView] = useState(0); // 0 for Login, 1 for Register
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { login, register } = useAuthDispatch();

  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');

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
        await register(form);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "An error occurred. Please try again.");
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
            />
          </FormControl>
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
    </SignUpContainer >
  );
}