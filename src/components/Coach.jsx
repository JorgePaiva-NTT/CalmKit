import React, { useState, useEffect } from "react"
import {
  ToggleButton, ToggleButtonGroup, Button, Box, Typography, Card, CardContent, Stack,
  CircularProgress, Fade
} from "@mui/material"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function parseDuration(title) {
  const match = title.match(/\(([\d.]+)\s*(s|min)\)/)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2]

  if (unit === "min") return value * 60
  return value
}

export default function Coach() {
  const [routines, setRoutines] = useState([])
  const [routineName, setRoutineName] = useState("")
  const [step, setStep] = useState(-1)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  useEffect(() => {
    const loadRoutines = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/routines`);
      const apiRoutines = await res.json();
      setRoutines(apiRoutines);
      if (apiRoutines.length > 0) {
        setRoutineName(apiRoutines[0].name); // Default to the first routine
      }
    }
    loadRoutines()
  }, [])

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) {
      setIsTimerRunning(false)
      return
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [isTimerRunning, timeLeft])

  const startTimer = (duration) => {
    setTotalTime(duration)
    setTimeLeft(duration)
    setIsTimerRunning(true)
  }

  const steps = routines.find(r => r.name === routineName)?.steps || []

  const startStep = (stepIndex) => {
    setStep(stepIndex)
    const duration = parseDuration(steps[stepIndex].title)
    if (duration > 0) {
      startTimer(duration)
    } else {
      setIsTimerRunning(false)
    }
  }

  const next = () => {
    if (step < steps.length - 1) {
      startStep(step + 1)
    }
  }

  const reset = () => {
    setStep(-1)
    setIsTimerRunning(false)
    setTimeLeft(0)
  }

  const start = () => {
    if (steps.length > 0) {
      startStep(0)
    }
  }

  return (
    <Stack spacing={3} sx={{ textAlign: 'center' }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
        Quick Coach
      </Typography>

      <ToggleButtonGroup
        value={routineName}
        exclusive
        onChange={(e, newRoutine) => { if (newRoutine) { setRoutineName(newRoutine); reset(); } }}
        aria-label="routine selection"
        fullWidth
      >
        {routines.map(r => <ToggleButton key={r.name} value={r.name}>{r.name}</ToggleButton>)}
      </ToggleButtonGroup>

      {step === -1 ? (
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Ready to begin your routine?
          </Typography>
          <Button
            onClick={start}
            size="large"
            startIcon={<PlayArrowIcon />}
            sx={{
              py: 1.5,
              px: 5,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6a6cff 0%, #8b5cf6 50%, #a78bfa 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #5a5cff 0%, #7c4dff 50%, #9a7bff 100%)",
              },
            }}
          >
            Start: {routineName}
          </Button>
        </Box>
      ) : (
        <Fade in={true} timeout={500}>
          <Card variant="outlined" sx={{ mt: 2, borderRadius: 4, p: 2 }}>
            <CardContent>
              {isTimerRunning ? (
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                  <CircularProgress
                    variant="determinate"
                    value={(timeLeft / totalTime) * 100}
                    size={100}
                    thickness={2}
                  />
                  <Box
                    sx={{
                      top: 0, left: 0, bottom: 0, right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {timeLeft}
                    </Typography>
                  </Box>
                </Box>
              ) : <Box sx={{ height: 116, mb: 3 }} /> /* Placeholder for spacing */}

              <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                {steps[step].title}
              </Typography>

              {steps[step].text.map((t, i) => (
                <Typography key={i} paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'text.secondary' }}>
                  {t}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Fade>
      )}

      {step > -1 && (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Button
            onClick={next}
            disabled={step >= steps.length - 1}
            variant="contained"
            size="large"
          >
            Next Step
          </Button>
          <Button onClick={reset} variant="text">Reset</Button>
        </Stack>
      )}
    </Stack>
  )
}