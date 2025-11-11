import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Card, CardContent, Stack,
  IconButton, Grid, Chip, Avatar, Tabs, Tab, FormControl, InputLabel, Select, MenuItem,
  Slider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from '@mui/icons-material/Lock';

import { commonEmotions } from "../calmData";
import { useAuthState } from "../context/AuthContext";
import { Get, Post, Delete } from "../utils/http";

export default function Log() {
  const [entries, setEntries] = useState([]);
  const [favoriteAnchors, setFavoriteAnchors] = useState([]);
  const { token } = useAuthState();
  const [form, setForm] = useState({ trigger: "", emotion: "Calm", contributing: [] });
  const [contributingFactors, setContributingFactors] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    if (!token) return; // Or redirect to login

    const anchors = await getAnchors();
    const logEntries = await Get(`${import.meta.env.VITE_API_URL}/logs`, token);

    // For "What's contributing to this feeling?"
    const factorChoices = ["Grateful", "Stressed", "Productive", "Tired", "Excited"];
    setContributingFactors(factorChoices);

    setEntries(logEntries);
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
      anchor: form.contributing.join(', '),
    };

    await Post(`${import.meta.env.VITE_API_URL}/logs`, entry, token);

    setForm({ trigger: "", emotion: "Calm", contributing: [] });
    load();
  }

  async function deleteEntry(id) {
    if (!token) return;
    await Delete(`${import.meta.env.VITE_API_URL}/logs/${id}`, token);
    load();
  }

  const handleContributingToggle = (factor) => {
    setForm(prevForm => {
      const newContributing = prevForm.contributing.includes(factor)
        ? prevForm.contributing.filter(f => f !== factor)
        : [...prevForm.contributing, factor];
      return { ...prevForm, contributing: newContributing };
    });
  };

  const mainFeelings = commonEmotions.map((emotion) => {
    return { label: emotion?.label, emoji: emotion?.emoji || "🙂" };
  });

  return (
    <Box component="form" onSubmit={save} sx={{ maxWidth: 420, mx: "auto", px: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 800, mb: 2, textAlign: 'center', pt: 3 }}>
        Select your main feeling
      </Typography>

      {/* Main Feeling Tabs */}
      <Tabs
        value={form.emotion}
        onChange={(e, newValue) => setForm({ ...form, emotion: newValue })}
        variant="fullWidth"
        aria-label="main-feeling-tabs"
        indicatorColor="primary"
        textColor="primary"
        scrollButtons
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
      >
        {mainFeelings.map(feeling => (
          <Tab
            key={feeling.label}
            value={feeling.label}
            label={feeling.label}
            icon={
              <Avatar sx={{ bgcolor: `${feeling.color}.main`, color: `${feeling.color}.contrastText`, width: 36, height: 36, mb: 1 }}>
                <span className="material-symbols-outlined">{feeling.emoji}</span>
              </Avatar>
            }
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          />
        ))}
      </Tabs>

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
          { value: 1, label: 'mild' },
          { value: 10, label: 'intense' }
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
          <MenuItem value=""><em>None / Other</em></MenuItem>
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

      {/* History (unchanged) */}
      <Typography variant="h6" sx={{ mt: 4, mb: 1.5, fontWeight: 700 }}>History</Typography>
      <Stack spacing={2} sx={{ mb: 2 }}>
        {entries.length === 0 ? (
          <Typography color="text.secondary">No logs yet.</Typography>
        ) : (
          [...entries].reverse().map((e) => (
            <Card key={e._id} variant="outlined" sx={{ position: "relative", borderRadius: 3 }}>
              <CardContent sx={{ pr: 5 }}>
                <IconButton
                  aria-label="delete"
                  onClick={() => deleteEntry(e._id)}
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>

                <Typography variant="subtitle2" color="text.secondary">
                  {new Date(e.time).toLocaleString()}
                </Typography>

                {e.emotion && (
                  <Chip
                    sx={{ mt: 1 }}
                    avatar={<Avatar sx={{ width: 24, height: 24, fontSize: 16 }}>
                      {commonEmotions.find((emo) => emo.label === e.emotion)?.emoji || "🙂"}
                    </Avatar>}
                    label={e.emotion}
                    size="small"
                  />
                )}

                <Typography sx={{ mt: 1.5 }}><strong>Trigger:</strong> {e.trigger || "—"}</Typography>
                <Typography><strong>Anchor:</strong> {e.anchor || "—"}</Typography>
                {/* Intensity chip removed as per new design */}
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}
