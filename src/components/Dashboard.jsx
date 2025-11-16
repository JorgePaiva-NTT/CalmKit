import { useState } from "react";
import {
  Box, Typography, Card, CardMedia, CardContent, CardActions,
  Button, Stack, Avatar, IconButton
} from "@mui/material";
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CloseIcon from '@mui/icons-material/Close';

import { MainDashboardCard, DashboardCard } from './Common/DashboardCard.jsx'

export default function Dashboard({ goCoach, goLog, goChat }) {
  const [insightVisible, setInsightVisible] = useState(true);

  return (
    <Stack spacing={2}>

      <MainDashboardCard goToPageAction={goLog} actionText="Log Emotion"
        title="How are you feeling?"
        description="Log your emotions to track your progress."
        imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAM454tkaCej_ku_5INItZS4TYKczBpiCV9Ja0wYGAHWAmz0Cyw3m90w1AznFq-BKBtuCeK6MCwSAc4fBEJlINmW7pf6LVpMVbVEkiTAHorNfTAeWbzc5VJPTfRuIuVqNURn9LhBW5XRDed7l25CAWlQokA06VTVTpiXspQlUzkBvybaMXd1IcZw2_l_x3zBHKObE9ZMvciE3sjEWHf7AhwWWJKk5vPFuz8dNCmHWkipjCwMbmm2Ua69j8cTB9Td_R1YDlaM6mLHtg"></MainDashboardCard>

      <DashboardCard goToPageAction={goCoach} actionText="Continue" title="Guided Step-by-Step Coach" description="Personalized coaching sessions to help you navigate your feelings." imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuD3nMIUXDl4aVFZ2zf0C4CQmrlg_GJf_pgDzqaBV2Uwrz7dU-wnhMrLvQKzcVqHKNmHbQyfRX-BWN4RNuRxWFmM1tdP2qS42V3C5Q9t7Dgl1q9VF21GjRiX6Wxu-62sxLEdKA7Jd5n6kk07zQtMWICDWkekuXqBpMjEcqDaPwDo8zVoiNdX9vOTcOiHxCDFaRakt7OIGiy5WB8LSKIifwQCTK-MFsDEpq0Agw5yYsbblW16ulEoKbdIinrkgUyfXyyxbZe2SjKaK5k"></DashboardCard>

      <DashboardCard goToPageAction={goChat} actionText="Start Chat" title="Talk to Your AI Coach" description="What's on your mind? Chat anytime." imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuA8l3LRJBhpsi9YpAaVgUx06L5GNTPxHFTAeyYQQJrljwjbEFe12o3LGrwMxND9zuzJ059FiNDH552wfFIXxS-WDczkOhsvMrMO4L7J3fnBFLIv3lNQp-AfFVSbK44i2j0dX0nORC1bjNoJB3IjxrfQErlg7FSKBwNgPQun8q5o5CmHaQPhbHdBcJEsDE1jH3q_YG--CdgArYa2LUYrhRl9-GbVyDOqH-gXMi-nyJBJPTXKUi8zA0OROdeMUcOnjyFOwpg7ILgk-zo"></DashboardCard>
      
      
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