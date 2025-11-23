import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Skeleton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const getMoodColor = (score) => {
    if (!score) return 'transparent';
    if (score <= 3) return '#ef4444'; // Red
    if (score <= 5) return '#f97316'; // Orange
    if (score <= 7) return '#eab308'; // Yellow
    if (score <= 9) return '#84cc16'; // Light green
    return '#22c55e'; // Green
};

const CalendarMoodView = ({ moodData, selectedDate, onDateSelect, currentMonth, onMonthChange, loading }) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const currentDay = isCurrentMonth ? today.getDate() : null;

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const calendarDayStyles = {
        position: 'relative',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius: '0.5rem',
    }

    const handlePrevMonth = () => {
        onMonthChange(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        onMonthChange(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        onDateSelect(selectedDate === dateStr ? null : dateStr);
    };

    const getDayMoodScore = (day) => {
        if (!moodData || !moodData.dailyScores) return null;
        const dayData = moodData.dailyScores.find(d => d.day === day);
        return dayData?.moodScore || null;
    };

    const calendarDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<Box key={`empty-${i}`} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const moodScore = getDayMoodScore(day);
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        const isSelected = selectedDate === dateStr;
        const isToday = day === currentDay;

        calendarDays.push(
            <Box
                key={day}
                onClick={() => handleDayClick(day)}
                sx={{
                    ...calendarDayStyles,
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                    border: isToday ? '2px solid' : 'none',
                    borderColor: isToday ? 'primary.main' : 'transparent',
                    '&:hover': {
                        bgcolor: isSelected ? 'primary.main' : 'action.hover',
                    },
                    transition: 'all 0.2s',
                }}
            >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {day}
                </Typography>
                {moodScore ? (
                    <Box
                        sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            bgcolor: getMoodColor(moodScore),
                            mt: 0.25,
                        }}
                    />
                ) : (
                    <Skeleton
                        variant="rectangular"
                        sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            mt: 0.25,
                        }}
                        animation={false}
                    />
                )}
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: '1.5rem', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <IconButton size="small" onClick={handlePrevMonth}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                    {monthNames[month]} {year}
                </Typography>
                <IconButton size="small" onClick={handleNextMonth}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
                {weekDays.map(day => (
                    <Typography
                        key={day}
                        sx={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'text.secondary'
                        }}
                    >
                        {day}
                    </Typography>
                ))}
            </Box>


            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                {loading ? (
                    Array.from({ length: 35 }).map((_, index) => (
                        <Skeleton
                            key={`skeleton-${index}`}
                            variant="rectangular"
                            sx={
                                {
                                    width: '100%',
                                    height: '100%',
                                    ...calendarDayStyles
                                }
                            }
                            animation="wave"
                        />
                    ))
                ) : (
                    calendarDays
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Mood:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Typography variant="caption" color="text.secondary">Low</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', bgcolor: '#eab308' }} />
                    <Typography variant="caption" color="text.secondary">Med</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', bgcolor: '#22c55e' }} />
                    <Typography variant="caption" color="text.secondary">High</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default CalendarMoodView;
