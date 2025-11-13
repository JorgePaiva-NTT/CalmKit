import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Stack,
  Grid, Chip, FormControl, InputLabel, Select, MenuItem,
  Slider, ButtonBase
} from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import LogHistory from "./LogHistory";

import { useAuthState } from "../context/AuthContext";
import { Get, Post } from "../utils/http";

export default function Log() {
  const [showHistory, setShowHistory] = useState(false);
  const [favoriteAnchors, setFavoriteAnchors] = useState([]);
  const { token } = useAuthState();
  const [form, setForm] = useState({ trigger: "", emotion: "Calm", contributing: [], intensity: 0, anchor: "" });
  const [contributingFactors, setContributingFactors] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    if (!token) return; // Or redirect to login

    const anchors = await getAnchors();
    setFavoriteAnchors(anchors);

    const factorChoices = ["Grateful", "Stressed", "Productive", "Tired", "Excited"];
    setContributingFactors(factorChoices);
  }
  async function getAnchors() {
    const anchors = await Get(`${import.meta.env.VITE_API_URL}/anchors`, token);
    return anchors;
  }

  async function save(e) {
    e.preventDefault();
    if (!token) return;

    const entry = {
      trigger: form.trigger?.trim() || "",
      emotion: form.emotion || "",
      intensity: Number(form.intensity),
      anchor: form.anchor?.trim() || "",
      contributing: form.contributing.join(", ") || "",
    };

    await Post(`${import.meta.env.VITE_API_URL}/logs`, entry, token);

    setForm({ trigger: "", emotion: "Calm", contributing: [], intensity: 0, anchor: "" });
    setShowHistory(true);
  }

  if (showHistory) {
    return <LogHistory goBack={() => setShowHistory(false)} />;
  }

  const handleContributingToggle = (factor) => {
    setForm(prevForm => {
      const newContributing = prevForm.contributing.includes(factor)
        ? prevForm.contributing.filter(f => f !== factor)
        : [...prevForm.contributing, factor];
      return { ...prevForm, contributing: newContributing };
    });
  };

  /*const mainFeelings = commonEmotions.map((emotion) => {
    return { label: emotion?.label, emoji: emotion?.emoji || "🙂" };
  });*/
  const mainFeelings = [ // Maps to MUI theme colors
    { label: "Happy", icon: "sentiment_very_satisfied", color: "warning" }, // amber
    { label: "Calm", icon: "sentiment_calm", color: "primary" }, // primary
    { label: "Neutral", icon: "sentiment_neutral", color: "gray" }, // slate
    { label: "Sad", icon: "sentiment_sad", color: "info" }, // blue
    { label: "Anxious", icon: "sentiment_stressed", color: "secondary" }, // purple
    { label: "Angry", icon: "sentiment_frustrated", color: "error" }, // red
  ];
  return (
    <Box component="form" onSubmit={save} sx={{ maxWidth: 420, mx: "auto", px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', pt: 3, mb: 2, px: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, textAlign: 'center' }}>
          How are you feeling?
        </Typography>
        <Button startIcon={<HistoryIcon />} onClick={setShowHistory} sx={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-30%)' }}>
          History
        </Button>
      </Box>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 2, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
        Select your main feeling
      </Typography>

      {/* Main Feeling Tabs */}
      <Grid container
        spacing={{ xs: 2, md: 3 }}
        sx={{ pt: 1, mb: 4 }}>
        {mainFeelings.map((feeling) => {
          const isSelected = form.emotion === feeling.label;
          return (
            <Grid item size={4} key={feeling.label}>
              <ButtonBase
                onClick={() => setForm({ ...form, emotion: feeling.label })}
                sx={{
                  height: "100%",
                  width: "100%",
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: '0.75rem',
                  transition: 'all 0.2s',
                  border: '2px solid',
                  borderColor: isSelected ? `${feeling.color}.main` : 'transparent',
                  '&:hover': {
                    borderColor: `${feeling.color}.main`,
                  }
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: `var(--mui-palette-${feeling.color}-main)` }}>{feeling.icon}</span>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{feeling.label}</Typography>
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>

      {/* Contributing Factors */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        What's contributing to this feeling?
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
        {contributingFactors.map(factor => (
          <Chip
            key={factor}
            label={factor}
            onClick={() => handleContributingToggle(factor)}
            color={form.contributing.includes(factor) ? "primary" : "default"}
            variant={form.contributing.includes(factor) ? "filled" : "outlined"}
            sx={{ borderRadius: '9999px', fontWeight: 500 }}
          />
        ))}
      </Box>

      {/* Intensity slider */}
      <Typography sx={{ fontWeight: 600 }}>Intensity (1-10)</Typography>
      <Slider
        value={form.intensity}
        onChange={(_, v) => setForm({ ...form, intensity: v })}
        min={1} max={10} step={1}
        sx={{ mt: 1, mb: 0.5 }}
        valueLabelDisplay="auto"
        aria-label="intensity-slider"
        color="primary"
        track={false}
        marks={[
          { value: 1, label: <Typography variant="caption" color="text.secondary" fontWeight={700}>Mild</Typography> },
          { value: 10, label: <Typography variant="caption" color="text.secondary" fontWeight={700}>Intense</Typography> }
        ]}
      />

      {/* Anchor dropdown */}
      <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Which anchor helped you?</Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="anchor-select-label">Select an anchor...</InputLabel>
        <Select
          labelId="anchor-select-label"
          value={form.anchor}
          label="Select an anchor..."
          onChange={(e) => setForm({ ...form, anchor: e.target.value })}
          sx={{ borderRadius: 3 }}
        >
          <MenuItem value="None / Other"><em>None / Other</em></MenuItem>
          {favoriteAnchors.map((a) => (
            <MenuItem key={a.id} value={a.text}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 1 }}>
                {a.isFavorite ? <Typography color="gold">{"★"}</Typography> : <></>}
                <Typography>{a.text}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Private Note */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }} component="label" htmlFor="notes">
        Add a private note
      </Typography>
      <TextField
        id="notes"
        value={form.trigger}
        onChange={(e) => setForm({ ...form, trigger: e.target.value })}
        multiline
        minRows={4}
        fullWidth
        placeholder="Want to write more about it?"
        variant="outlined"
        sx={{
          mb: 1,
          '& .MuiOutlinedInput-root': {
            borderRadius: '1rem',
            backgroundColor: 'action.hover'
          }
        }}
      />
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 4 }}>
        <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Your entries are private and secure.
        </Typography>
      </Stack>

      {/* Save button */}
      <Button
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        color="primary"
        sx={{
          py: 2,
          borderRadius: '1rem',
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        Save Entry
      </Button>

    </Box>
  );
}
