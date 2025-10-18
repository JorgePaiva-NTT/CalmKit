import { db } from "../db"
import { Box, Typography, Button, Stack } from "@mui/material"

export default function Export() {
  const exportData = async () => {
    const data = {
      exportedAt: new Date().toISOString(),
      top3: await db.anchors.toArray(),
      log: await db.logs.toArray()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "calm-kit-backup.json"
    a.click()
  }

  const clearAll = async () => {
    if (confirm("Clear all stored data?")) {
      await db.logs.clear()
      await db.anchors.clear()
      alert("Cleared.")
    }
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>Export & Data</Typography>
      <Stack direction="row" spacing={2} sx={{ my: 2 }}>
        <Button variant="contained" onClick={exportData}>Download Backup</Button>
        <Button variant="outlined" color="error" onClick={clearAll}>Clear All Data</Button>
      </Stack>
      <Typography color="text.secondary">Everything is stored in your browser (IndexedDB).</Typography>
    </Box>
  )
}