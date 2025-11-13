import { useState } from "react";
import {
  Box, Typography, Card, CardMedia, CardContent, CardActions,
  Button, Stack, Avatar, IconButton
} from "@mui/material";
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';

export default function Dashboard({ goCoach, goLog, goChat }) {
  const [insightVisible, setInsightVisible] = useState(true);

  return (
    <Stack spacing={2}>
      {/* How are you feeling Card */}
      <Card sx={{ borderRadius: '1.5rem', mx: { xs: 2, sm: 0 } }}>
        <CardMedia
          component="img"
          height="194"
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuAM454tkaCej_ku_5INItZS4TYKczBpiCV9Ja0wYGAHWAmz0Cyw3m90w1AznFq-BKBtuCeK6MCwSAc4fBEJlINmW7pf6LVpMVbVEkiTAHorNfTAeWbzc5VJPTfRuIuVqNURn9LhBW5XRDed7l25CAWlQokA06VTVTpiXspQlUzkBvybaMXd1IcZw2_l_x3zBHKObE9ZMvciE3sjEWHf7AhwWWJKk5vPFuz8dNCmHWkipjCwMbmm2Ua69j8cTB9Td_R1YDlaM6mLHtg"
          alt="Calm abstract gradient of green and blue waves"
        />
        <CardContent>
          <Typography variant="h6" component="p" fontWeight="bold">
            How are you feeling?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Log your emotions to track your progress.
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
          <Button variant="contained" onClick={goLog} sx={{ borderRadius: '0.75rem' }}>Log Emotion</Button>
        </CardActions>
      </Card>

      {/* Step-by-Step Coach Card */}
      <Card sx={{ display: 'flex', justifyContent: 'space-between', borderRadius: '1.5rem', mx: { xs: 2, sm: 0 }, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <CardContent sx={{ p: 1, flex: '1 0 auto' }}>
            <Typography component="div" variant="h6" fontWeight="bold">
              Guided Step-by-Step Coach
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              Personalized coaching sessions to help you navigate your feelings.
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button variant="contained" color="secondary" onClick={goCoach} sx={{ borderRadius: '0.75rem' }}>Continue</Button>
          </Box>
        </Box>
        <CardMedia
          component="img"
          sx={{ width: 120, height: 120, borderRadius: '1rem' }}
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuD3nMIUXDl4aVFZ2zf0C4CQmrlg_GJf_pgDzqaBV2Uwrz7dU-wnhMrLvQKzcVqHKNmHbQyfRX-BWN4RNuRxWFmM1tdP2qS42V3C5Q9t7Dgl1q9VF21GjRiX6Wxu-62sxLEdKA7Jd5n6kk07zQtMWICDWkekuXqBpMjEcqDaPwDo8zVoiNdX9vOTcOiHxCDFaRakt7OIGiy5WB8LSKIifwQCTK-MFsDEpq0Agw5yYsbblW16ulEoKbdIinrkgUyfXyyxbZe2SjKaK5k"
          alt="Abstract image of a pathway through a forest"
        />
      </Card>

      {/* AI Coach Card */}
      <Card sx={{ display: 'flex', justifyContent: 'space-between', borderRadius: '1.5rem', mx: { xs: 2, sm: 0 }, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CardContent sx={{ p: 1, flex: '1 0 auto' }}>
            <Typography component="div" variant="h6" fontWeight="bold">
              Talk to Your AI Coach
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              What's on your mind? Chat anytime.
            </Typography>
          </CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pt: 1 }}>
            <Button variant="contained" color="secondary" onClick={goChat} sx={{ borderRadius: '0.75rem' }}>Start Chat</Button>
          </Box>
        </Box>
        <CardMedia
          component="img"
          sx={{ width: 120, height: 120, borderRadius: '1rem' }}
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuA8l3LRJBhpsi9YpAaVgUx06L5GNTPxHFTAeyYQQJrljwjbEFe12o3LGrwMxND9zuzJ059FiNDH552wfFIXxS-WDczkOhsvMrMO4L7J3fnBFLIv3lNQp-AfFVSbK44i2j0dX0nORC1bjNoJB3IjxrfQErlg7FSKBwNgPQun8q5o5CmHaQPhbHdBcJEsDE1jH3q_YG--CdgArYa2LUYrhRl9-GbVyDOqH-gXMi-nyJBJPTXKUi8zA0OROdeMUcOnjyFOwpg7ILgk-zo"
          alt="Abstract image representing AI"
        />
      </Card>

      {/* Daily Insight Card */}
      {
        insightVisible && (
          <Card sx={{ display: 'flex', alignItems: 'center', borderRadius: '1.5rem', mx: { xs: 2, sm: 0 }, p: 2, bgcolor: 'rgba(19, 236, 109, 0.15)', position: 'relative' }}>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', mr: 2 }}>
              <LightbulbIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">Daily Insight</Typography>
              <Typography variant="body2">Overthinking is the art of creating problems that weren't even there.</Typography>
            </Box>
            <IconButton onClick={() => setInsightVisible(false)} size="small" sx={{ position: 'absolute', top: 8, right: 8 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Card>
        )
      }
    </Stack >
  );
}