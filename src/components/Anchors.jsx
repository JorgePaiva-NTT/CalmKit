import { useState, useEffect } from "react"
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box, Typography, List, ListItem, ListItemText, Chip, Accordion, Stack, IconButton,
  TextField, Button, Select, MenuItem, FormControl, InputLabel, Paper, Divider
} from "@mui/material"
import { useAuthState } from "../context/AuthContext"
import { Get, Post, Delete } from "../utils/http"

export default function Anchors() {
  const [newAnchor, setNewAnchor] = useState({ text: "", group: "" });
  const [favorites, setFavorites] = useState([])
  const [allAnchors, setAllAnchors] = useState({})
  const { token } = useAuthState()

  useEffect(() => {
    load()
  }, [token])

  async function load() {
    if (!token) return

    const res = await fetch(`${import.meta.env.VITE_API_URL}/anchors`, {
      headers: { "x-auth-token": token },
    })
    const anchors = await res.json()

    // Filter favorites from the fetched anchors
    const favs = anchors.filter(a => a.isFavorite).sort((a, b) => a.favoriteRank - b.favoriteRank)
    setFavorites(favs)

    // Group all anchors by their group property
    const grouped = anchors.reduce((acc, anchor) => {
      acc[anchor.group] = [...(acc[anchor.group] || []), anchor]
      return acc
    }, {})
    setAllAnchors(grouped)
  }

  async function toggleFavorite(anchorId) {
    if (!token) return
    await Post(`${import.meta.env.VITE_API_URL}/anchors/${anchorId}/toggle-favorite`, {}, token);
    load()
  }

  async function addAnchor(e) {
    e.preventDefault();
    if (!token || !newAnchor.text || !newAnchor.group) return;
    await Post(`${import.meta.env.VITE_API_URL}/anchors`, newAnchor, token);
    setNewAnchor({ text: "", group: "" });
    load();
  }

  async function deleteAnchor(anchorId) {
    if (!token) return;
    await Delete(`${import.meta.env.VITE_API_URL}/anchors/${anchorId}`, token);
    load();
  }

  const handleNewAnchorChange = (e) => {
    setNewAnchor({ ...newAnchor, [e.target.name]: e.target.value });
  };

  return (
    <Stack spacing={4}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Your Top 3 Favorites</Typography>
        {favorites.length > 0 ? (
          <List dense>
            {favorites.map(f => (
              <ListItem key={f._id} disablePadding>
                <ListItemText primary={f.text} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" variant="body2">You haven't selected any favorite anchors yet. Tap an anchor below to add it.</Typography>
        )}
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Add a New Anchor</Typography>
        <Box component="form" onSubmit={addAnchor}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', sm: 'flex-start' }
          }}
        >
          <TextField
            label="New anchor text"
            name="text"
            value={newAnchor.text}
            onChange={handleNewAnchorChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Group</InputLabel>
            <Select
              name="group"
              value={newAnchor.group}
              label="Group"
              onChange={handleNewAnchorChange}
            >
              {Object.keys(allAnchors).map(groupName => (
                <MenuItem key={groupName} value={groupName}>{groupName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton type="submit"
            sx={{
              height: '40px',
              width: '40px',
              alignSelf: 'center',
              color: 'primary.main'
            }}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
      </Paper>

      <Box>
        <Typography variant="h5" component="h2" gutterBottom>Anchors Library</Typography>
        <Typography color="text.secondary" paragraph>Tap an anchor to add it to your favorites (maximum of 3).</Typography>
        <Stack spacing={1}>
          {Object.entries(allAnchors).map(([group, list]) => (
            <Accordion key={group} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">{group}</Typography>
                  <Chip label={list.length} size="small" />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {list.map(anchor => (
                    <Chip
                      key={anchor._id}
                      label={anchor.text}
                      onClick={() => toggleFavorite(anchor._id)}
                      onDelete={() => deleteAnchor(anchor._id)}
                      deleteIcon={<DeleteIcon />}
                      color={anchor.isFavorite ? "primary" : "default"}
                      variant="outlined"
                      sx={{
                        '& .MuiChip-deleteIcon:hover': {
                          color: 'error.main',
                        },
                      }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
          }
        </Stack>
      </Box>
    </Stack >
  )
}