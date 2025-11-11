import { useState, useEffect } from "react";
import {
  Stack, Typography, Box, List, ListItem, ListItemButton, ListItemText, LinearProgress,
  ListItemAvatar, Avatar, Chip, Fab, CircularProgress, Card, CardContent, Button, Fade, SvgIcon
} from "@mui/material";
import * as Icons from '@mui/icons-material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Get } from "../utils/http";
import { useAuthState } from "../context/AuthContext";

const DynamicIcon = ({ name }) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    return <Icons.HelpOutline />;
  }

  return <IconComponent />;
};

function parseDuration(step) {
  return step.time;
}

function RoutinePlayer({ routine, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentStep = routine.steps[stepIndex];

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = parseDuration(currentStep);
      if (duration > 0) {
        setTotalTime(duration);
        setTimeLeft(duration);
        setIsTimerRunning(true);
      } else {
        setIsTimerRunning(false);
      }
    }, 100); // Small delay to ensure component is ready

    return () => clearTimeout(timer);
  }, [stepIndex, currentStep]);

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) {
      setIsTimerRunning(false);
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isTimerRunning, timeLeft]);

  const next = () => {
    if (stepIndex < routine.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <Stack spacing={2}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ alignSelf: 'flex-start' }}><Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>Back to Routines</Typography></Button>
      <Fade in={true} timeout={500}>
        <Card variant="outlined" sx={{ mt: 2, borderRadius: 4, p: 2, textAlign: 'center' }}>
          {/* New Progress Indicator */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Step {stepIndex + 1} of {routine.steps.length}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ width: '100%', maxWidth: 'xs' }}>
              {routine.steps.map((_, index) => (
                <LinearProgress
                  key={index}
                  variant="determinate"
                  value={index === stepIndex ? 100 : 0}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: '9999px',
                  }}
                />
              ))}
            </Stack>
          </Box>
          <CardContent>
            {isTimerRunning ? (
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                <CircularProgress variant="determinate" value={(timeLeft / totalTime) * 100} size={100} thickness={2} />
                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h4" component="div" color="text.secondary" sx={{ fontWeight: 700 }}>{timeLeft}</Typography>
                </Box>
              </Box>
            ) : <Box sx={{ height: 116, mb: 3 }} />}
            <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>{currentStep.title}</Typography>
            {currentStep.text.map((t, i) => (
              <Typography key={i} paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>{t}</Typography>
            ))}
          </CardContent>
        </Card>
      </Fade>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button onClick={next} disabled={stepIndex >= routine.steps.length - 1} variant="contained" size="large">Next Step</Button>
        <Button onClick={onBack} variant="text">End Routine</Button>
      </Stack>
    </Stack>
  );
}

export default function Coach() {
  const [routines, setRoutines] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const { token } = useAuthState();


  useEffect(() => {
    const loadRoutines = async () => {
      try {
        const apiRoutines = await Get(`${import.meta.env.VITE_API_URL}/routines`, token);
        setRoutines(apiRoutines);
      } catch (error) {
        console.error("Failed to fetch routines:", error);
      }
    };
    loadRoutines();
  }, []);

  if (selectedRoutine) {
    return <RoutinePlayer routine={selectedRoutine} onBack={() => setSelectedRoutine(null)} />;
  }

  const filteredRoutines = routines.filter(routine => {
    if (filter === 'All') {
      return true;
    }
    return routine.tags && routine.tags.includes(filter);
  });

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Find Your Calm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose an exercise to quiet your mind.
        </Typography>
      </Box>

      { /* List the tags from available routines */}
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
        <Chip label="All" color={filter === 'All' ? 'primary' : 'default'} onClick={() => setFilter('All')} />
        {
          routines != null && routines.length > 0 &&
          Array.from(new Set(routines.flatMap(r => r.tags))).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              color={filter === tag ? 'primary' : 'default'}
              onClick={() => setFilter(tag)}
            />
          ))
        }
      </Stack>

      <List sx={{ width: '100%' }}>
        {filteredRoutines.map((routine) => (
          <ListItem
            key={routine.name}
            disablePadding
            secondaryAction={
              <ChevronRightIcon color="action" />
            }
            sx={{
              mb: 1.5,
              bgcolor: 'action.hover',
              borderRadius: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <ListItemButton sx={{ borderRadius: '1rem', p: 1.5 }} onClick={() => setSelectedRoutine(routine)}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.default', color: 'text.primary', width: 56, height: 56, mr: 1 }}>
                  <DynamicIcon name={routine.icon} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={routine.name}
                slotProps={
                  {
                    secondary: { component: 'div' }
                  }
                }
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {routine.description || `${routine.steps.length} steps`}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {routine.tags?.map(tag => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}