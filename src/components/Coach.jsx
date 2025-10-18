import React, { useState, useEffect } from "react"
import { ToggleButton, ToggleButtonGroup, Button, Box, Typography, Card, CardContent, ButtonGroup, Stack, LinearProgress } from "@mui/material"
import { db } from "../db"

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
      const dbRoutines = await db.routines.toArray()
      setRoutines(dbRoutines)
      if (dbRoutines.length > 0) {
        setRoutineName(dbRoutines[0].name) // Default to the first routine
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
    <Stack spacing={2}>
      <Typography variant="h5" component="h2" gutterBottom>Quick Coach</Typography>
      <ToggleButtonGroup
        value={routineName}
        exclusive
        onChange={(e, newRoutine) => { if (newRoutine) { setRoutineName(newRoutine); reset(); } }}
        aria-label="routine selection"
      >
        {routines.map(r => <ToggleButton key={r.name} value={r.name}>{r.name}</ToggleButton>)}
      </ToggleButtonGroup>
      {step === -1 ? (
        <Typography color="text.secondary">Click Start to begin your routine.</Typography>
      ) : (
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">{steps[step].title}</Typography>
            {steps[step].text.map((t, i) => <Typography key={i} paragraph>{t}</Typography>)}
            {isTimerRunning && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={(timeLeft / totalTime) * 100} />
                <Typography variant="caption" align="right" display="block">{timeLeft}s remaining</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      <ButtonGroup variant="contained" fullWidth>
        <Button onClick={start}>Start</Button>
        <Button onClick={next} disabled={step === -1 || step >= steps.length - 1}>Next</Button>
        <Button onClick={reset}>Reset</Button>
      </ButtonGroup>
    </Stack>
  )
}