import { useState, useEffect } from "react"
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, List, ListItem, ListItemText, Chip, Accordion, Stack } from "@mui/material"
import { useAuthState } from "../context/AuthContext"

export default function Anchors() {
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

    await fetch(`${import.meta.env.VITE_API_URL}/anchors/${anchorId}/toggle-favorite`, {
      method: "POST", // Using POST as it modifies server state
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    })

    // Reload the anchors to reflect the change
    load()
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mt: 3 }}>Your Top 3</Typography>
      <List dense>
        {favorites.map(f => (
          <ListItem key={f._id}><ListItemText primary={f.text} /></ListItem>
        ))}
      </List>
      <Typography variant="h5" component="h2" gutterBottom>Anchors Library</Typography>
      <Typography color="text.secondary" paragraph>Tap to favorite (max 3). Favorites are shown below.</Typography>
      {Object.entries(allAnchors).map(([group, list]) => (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">{group}</Typography>
              <Chip label={`(${list.length})`} size="small"></Chip>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {list.map(anchor => (
                <Chip key={anchor._id} label={anchor.text} onClick={() => toggleFavorite(anchor._id)} color={anchor.isFavorite ? "primary" : "default"} />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))
      }
    </Box >
  )
}