import React, { useState, useEffect } from "react"
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, Chip } from "@mui/material"
import { db } from "../db"

export default function Anchors() {
  const [favorites, setFavorites] = useState([])
  const [allAnchors, setAllAnchors] = useState({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const favs = await db.anchors.where("isFavorite").equals(1).sortBy("favoriteRank")
    setFavorites(favs)

    const all = await db.anchors.toArray()
    const grouped = all.reduce((acc, anchor) => {
      acc[anchor.group] = [...(acc[anchor.group] || []), anchor]
      return acc
    }, {})
    setAllAnchors(grouped)
  }

  async function toggleFavorite(anchor) {
    if (anchor.isFavorite) {
      // Unfavorite it
      await db.anchors.update(anchor.id, { isFavorite: 0, favoriteRank: null })
    } else {
      // Favorite it
      const favCount = await db.anchors.where("isFavorite").equals(1).count()
      if (favCount >= 3) {
        const oldestFav = await db.anchors.where("isFavorite").equals(1).sortBy("favoriteRank")
        await db.anchors.update(oldestFav[0].id, { isFavorite: 0, favoriteRank: null })
      }
      await db.anchors.update(anchor.id, { isFavorite: 1, favoriteRank: Date.now() })
    }
    load()
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>Anchors Library</Typography>
      <Typography color="text.secondary" paragraph>Tap to favorite (max 3). Favorites are shown below.</Typography>
      {Object.entries(allAnchors).map(([group, list]) => (
        <Card key={group} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{group}</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {list.map(anchor => (
                <Chip key={anchor.id} label={anchor.text} onClick={() => toggleFavorite(anchor)} color={anchor.isFavorite ? "primary" : "default"} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
      <Typography variant="h6" sx={{ mt: 3 }}>Your Top 3</Typography>
      <List dense>
        {favorites.map(f => (
          <ListItem key={f.id}><ListItemText primary={f.text} /></ListItem>
        ))}
      </List>
    </Box>
  )
}