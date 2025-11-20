import { useState, useEffect } from "react"
import {
  Box, Typography, Stack, IconButton, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Paper, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, InputAdornment, Tooltip, Tabs, Tab, Chip
} from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { useAuthState } from "../context/AuthContext"
import { Get, Post, Delete } from "../utils/http"

export default function Customization() {
  const [tabValue, setTabValue] = useState(0);
  const [newAnchor, setNewAnchor] = useState({ text: "", group: "", isUserCreated: true });
  const [favorites, setFavorites] = useState([])
  const [allAnchors, setAllAnchors] = useState({})
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Factors state
  const [defaultFactors, setDefaultFactors] = useState([]);
  const [customFactors, setCustomFactors] = useState([]);
  const [newFactor, setNewFactor] = useState("");
  const [openAddFactorDialog, setOpenAddFactorDialog] = useState(false);

  const { token } = useAuthState()

  useEffect(() => {
    loadAnchors();
    loadFactors();
  }, [token])

  async function loadAnchors() {
    if (!token) return
    const res = await Get(`${import.meta.env.VITE_API_URL}/anchors`, token);
    const anchors = res;

    const favs = anchors.filter(a => a.isFavorite).sort((a, b) => a.favoriteRank - b.favoriteRank)
    setFavorites(favs)

    const grouped = anchors.reduce((acc, anchor) => {
      acc[anchor.group] = [...(acc[anchor.group] || []), anchor]
      return acc
    }, {})
    setAllAnchors(grouped)
  }

  async function loadFactors() {
    if (!token) return;
    const res = await Get(`${import.meta.env.VITE_API_URL}/factors`, token);
    if (res) {
      setDefaultFactors(res.defaultFactors || []);
      setCustomFactors(res.customFactors || []);
    }
  }

  async function toggleFavorite(anchorId) {
    if (!token) return
    await Post(`${import.meta.env.VITE_API_URL}/anchors/${anchorId}/toggle-favorite`, {}, token);
    loadAnchors()
  }

  async function addAnchor(e) {
    e.preventDefault();
    if (!token || !newAnchor.text || !newAnchor.group) return;
    await Post(`${import.meta.env.VITE_API_URL}/anchors`, newAnchor, token);
    setNewAnchor({ text: "", group: "" });
    setOpenAddDialog(false);
    loadAnchors();
  }

  async function deleteAnchor(anchorId) {
    if (!token) return;
    await Delete(`${import.meta.env.VITE_API_URL}/anchors/${anchorId}`, token);
    loadAnchors();
  }

  async function addFactor(e) {
    e.preventDefault();
    if (!token || !newFactor.trim()) return;
    const res = await Post(`${import.meta.env.VITE_API_URL}/factors`, { factor: newFactor }, token);
    if (res) {
      setDefaultFactors(res.defaultFactors || []);
      setCustomFactors(res.customFactors || []);
    }
    setNewFactor("");
    setOpenAddFactorDialog(false);
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
          Customization
        </Typography>
        <Typography color="text.secondary" component={"p"} sx={{ mb: 2 }}>
          Manage your anchors and tracking factors.
        </Typography>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label="Anchors" />
          <Tab label="Factors" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Box sx={{ px: { xs: 2, sm: 0 } }}>
            <TextField
              fullWidth
              placeholder="Find a specific phrase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  sx: { borderRadius: '2rem' },
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
        </>
      )}

      {tabValue === 1 && (
        <Box sx={{ px: { xs: 2, sm: 0 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Default Factors
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {defaultFactors.map(factor => (
              <Chip key={factor} label={factor} variant="outlined" />
            ))}
          </Box>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            My Factors
          </Typography>
          {customFactors.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 2 }}>No custom factors yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {customFactors.map(factor => (
                <Chip
                  key={factor}
                  label={factor}
                  color="primary"
                  onDelete={() => { }} // Placeholder for delete functionality
                  deleteIcon={<PersonIcon />} // Visual indicator it's custom
                />
              ))}
            </Box>
          )}

          <Fab
            color="primary"
            aria-label="add factor"
            onClick={() => setOpenAddFactorDialog(true)}
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
          >
            <AddIcon />
          </Fab>

          <Dialog open={openAddFactorDialog} onClose={() => setOpenAddFactorDialog(false)} fullWidth maxWidth="sm">
            <DialogTitle>Add Custom Factor</DialogTitle>
            <DialogContent>
              <Stack component="form" onSubmit={addFactor} spacing={2} sx={{ pt: 1 }}>
                <TextField
                  autoFocus
                  label="Factor name"
                  value={newFactor}
                  onChange={(e) => setNewFactor(e.target.value)}
                  fullWidth
                  variant="outlined"
                  helperText="E.g., 'Work', 'Family', 'Weather'"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddFactorDialog(false)}>Cancel</Button>
              <Button onClick={addFactor} variant="contained">Add</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

    </Stack >
  )
}