import React from "react";
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Stack } from "@mui/material";
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import EditNoteIcon from '@mui/icons-material/EditNote';

export default function Dashboard({ goCoach, goLog }) {
  return (
    <Stack spacing={2} sx={{ textAlign: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Welcome
      </Typography>
      <Typography color="text.secondary" paragraph>
        What would you like to do today?
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={5}>
          <Card>
            <CardActionArea onClick={goCoach} sx={{ textAlign: 'center', p: 2 }}>
              <SelfImprovementIcon sx={{ fontSize: 40 }} color="primary" />
              <CardContent>
                <Typography variant="h6" component="div">
                  Coach
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Guided routines
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Card>
            <CardActionArea onClick={goLog} sx={{ textAlign: 'center', p: 2 }}>
              <EditNoteIcon sx={{ fontSize: 40 }} color="primary" />
              <CardContent>
                <Typography variant="h6" component="div">
                  Log
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Record a moment
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}