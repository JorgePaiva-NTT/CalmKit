import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Card, CardContent, Stack, Slider,
  FormControl, InputLabel, Select, MenuItem, IconButton, Grid, Chip, Avatar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
// import { db } from "../db"; // No longer using local DB for logs
import { commonEmotions } from "../calmData";
import { useAuthState } from "../context/AuthContext";

export default function Log() {
  const [entries, setEntries] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [favoriteAnchors, setFavoriteAnchors] = useState([]);
  const { token } = useAuthState();
  const [form, setForm] = useState({ trigger: "", emotion: "", intensity: 5, anchor: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    // For now, we'll keep anchors local, but logs are remote.
    // You would also move anchors to the backend.
    // const favAnchors = await db.anchors.where("isFavorite").equals(1).sortBy("favoriteRank");

    if (!token) return; // Or redirect to login

    const res = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
      headers: { "x-auth-token": token },
    });
    const logEntries = await res.json();

    setEntries(logEntries);
    // setFavoriteAnchors(favAnchors);
  }

  async function save(e) {
    e.preventDefault();
    if (!token) return;

    const entry = {
      trigger: form.trigger?.trim() || "",
      emotion: form.emotion || "",
      intensity: Number(form.intensity),
      anchor: form.anchor?.trim() || "",
    };

    await fetch(`${VITE_API_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(entry),
    });

    setForm({ trigger: "", emotion: "", intensity: 5, anchor: "" });
    load();
  }

  async function deleteEntry(id) {
    if (!token) return;

    await fetch(`${VITE_API_URL}/logs/${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });
    load();
  }

  const getIntensityColor = (intensity) => {
    if (intensity > 7) return "error";
    if (intensity > 4) return "warning";
    return "success";
  };

  // Only show the 4 emotions from your mock, using your commonEmotions data for emoji
  const emotionChoices = ["Anxious", "Sad", "Angry", "Overwhelmed"].map((label) => {
    const e = commonEmotions.find((x) => x.label === label);
    return { label, emoji: e?.emoji || "🙂" };
  });

  return (
    <Box component="form" onSubmit={save} sx={{ maxWidth: 420, mx: "auto" }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2 }}>
        Log Your Experience
      </Typography>

      {/* Trigger */}
      <Typography sx={{ fontWeight: 600, mb: 1 }}>What triggered this feeling?</Typography>
      <TextField
        value={form.trigger}
        onChange={(e) => setForm({ ...form, trigger: e.target.value })}
        multiline
        minRows={3}
        maxRows={6}
        fullWidth
        placeholder="Describe what happened..."
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': { borderRadius: 3 },
          // Target the multiline input class used by MUI so the textarea wraps and stays inside the box
          '& .MuiOutlinedInput-inputMultiline': {
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            boxSizing: 'border-box',
            width: '100%',
            display: 'block',
            overflow: 'auto',     // keep overflowing text inside with scrollbar if needed
            resize: 'vertical',   // allow only vertical resize
          },
        }}
      />

      {/* Emotion grid */}
      <Typography sx={{ fontWeight: 600, mb: 1 }}>How are you feeling?</Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {emotionChoices.map((e) => {
          const selected = form.emotion === e.label;
          return (
            <Grid item xs={6} key={e.label}>
              <Card
                variant="outlined"
                onClick={() => setForm({ ...form, emotion: e.label })}
                sx={{
                  borderRadius: 3,
                  cursor: "pointer",
                  ...(selected ? { borderColor: "primary.main", boxShadow: 2 } : {}),
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontSize: "1.25rem" }}>{e.emoji}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{e.label}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Intensity slider */}
      <Typography sx={{ fontWeight: 600 }}>Intensity (1-10)</Typography>
      <Slider
        value={form.intensity}
        onChange={(_, v) => setForm({ ...form, intensity: v })}
        min={1} max={10} step={1}
        sx={{ mt: 1, mb: 0.5 }}
        valueLabelDisplay="off"
      />
      <Typography align="center" sx={{ mb: 2, fontWeight: 700 }}>
        {form.intensity}
      </Typography>

      {/* Anchor dropdown */}
      <Typography sx={{ fontWeight: 600, mb: 1 }}>Which anchor helped you?</Typography>
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
            <MenuItem key={a.id} value={a.text}>{a.text}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Save button (purple gradient) */}
      <Button
        type="submit"
        fullWidth
        size="large"
        sx={{
          py: 1.5,
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 700,
          background: "linear-gradient(135deg, #6a6cff 0%, #8b5cf6 50%, #a78bfa 100%)",
          color: "white",
          "&:hover": {
            background: "linear-gradient(135deg, #5a5cff 0%, #7c4dff 50%, #9a7bff 100%)",
          },
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
          entries.map((e) => (
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
                {e.intensity && (
                  <Chip
                    sx={{ mt: 1 }}
                    label={`Intensity: ${e.intensity}`}
                    size="small"
                    color={getIntensityColor(e.intensity)}
                  />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}
