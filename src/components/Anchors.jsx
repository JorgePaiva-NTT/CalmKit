import { useState, useEffect } from "react"
import {
  Box, Typography, Stack, IconButton, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Paper, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Tooltip
} from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';

import { useAuthState } from "../context/AuthContext"
import { Get, Post, Delete } from "../utils/http"

export default function Anchors() {
  const [newAnchor, setNewAnchor] = useState({ text: "", group: "", isUserCreated: true });
  const [favorites, setFavorites] = useState([])
  const [allAnchors, setAllAnchors] = useState({})
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const { token } = useAuthState()

  useEffect(() => {
    load()
  }, [token])

  async function load() {
    if (!token) return
    console.log(token);
    const res = await Get(`${import.meta.env.VITE_API_URL}/anchors`, token);
    const anchors = res;

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
    setNewAnchor({ ...newAnchor, [e.target.name]: e.target.value, isUserCreated: true });
  };

  const filteredAnchors = Object.entries(allAnchors).reduce((acc, [group, list]) => {
    const filteredList = list.filter(anchor =>
      anchor.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredList.length > 0) {
      acc[group] = filteredList;
    }
    return acc;
  }, {});

  return (
    <Stack spacing={2}>
      <Box sx={{ px: { xs: 2, sm: 0 } }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Your Anchor Phrases
        </Typography>
        <Typography color="text.secondary" component={"p"} sx={{ mb: 2 }}>
          Find or create phrases that ground you.
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 0 } }}>
        <TextField
          fullWidth
          placeholder="Find a specific phrase"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              sx: {
                borderRadius: '2rem'
              },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box>
        {Object.entries(filteredAnchors).map(([group, list]) => (
          <Box key={group} sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ px: { xs: 2, sm: 0 }, mb: 1.5 }}>
              {group}
            </Typography>
            <Stack spacing={1.5} sx={{ px: { xs: 2, sm: 0 } }}>
              {list.map(anchor => (
                <Paper
                  key={anchor._id}
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 1.5,
                    borderRadius: '1rem',
                    bgcolor: 'action.hover'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1 }}>
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 500 }}>{anchor.text}</Typography>
                    {anchor.isUserCreated && (
                      <Tooltip title="Created by you">
                        <PersonIcon color="action" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box >
                  <Box>
                    {anchor.isUserCreated && (
                      <IconButton onClick={() => deleteAnchor(anchor._id)}><DeleteIcon /></IconButton>
                    )}
                    <IconButton onClick={() => toggleFavorite(anchor._id)} color={anchor.isFavorite ? "primary" : "default"}>
                      {anchor.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setOpenAddDialog(true)}
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a New Anchor</DialogTitle>
        <DialogContent>
          <Stack component="form" onSubmit={addAnchor} spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="New anchor text"
              name="text"
              value={newAnchor.text}
              onChange={handleNewAnchorChange}
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={addAnchor} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

    </Stack >
  )
}