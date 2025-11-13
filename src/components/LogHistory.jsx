import React, { useState, useEffect } from 'react';
import {
    Box, Typography, IconButton, InputBase, Select, MenuItem, Button, Paper, Avatar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useAuthState } from '../context/AuthContext';
import { Get } from '../utils/http';

const emotionMap = {
    'Angry': { icon: <SentimentVeryDissatisfiedIcon sx={{ color: 'red.500' }} />, color: 'red.500', bgColor: 'rgba(239, 68, 68, 0.1)' },
    'Anxious': { icon: <SentimentDissatisfiedIcon sx={{ color: 'purple.500' }} />, color: 'purple.500', bgColor: 'rgba(168, 85, 247, 0.1)' },
    'Sad': { icon: <SentimentDissatisfiedIcon sx={{ color: 'blue.500' }} />, color: 'blue.500', bgColor: 'rgba(59, 130, 246, 0.1)' },
    'Neutral': { icon: <SentimentNeutralIcon sx={{ color: 'grey.500' }} />, color: 'grey.500', bgColor: 'rgba(107, 114, 128, 0.1)' },
    'Calm': { icon: <SentimentSatisfiedAltIcon sx={{ color: 'green.500' }} />, color: 'green.500', bgColor: 'rgba(34, 197, 94, 0.1)' },
    'Happy': { icon: <SentimentVerySatisfiedIcon sx={{ color: 'yellow.500' }} />, color: 'yellow.500', bgColor: 'rgba(234, 179, 8, 0.1)' },
};

const LogHistory = ({ goBack }) => {
    const [chartType, setChartType] = useState('bar');
    const [logs, setLogs] = useState([]);
    const { token } = useAuthState();

    useEffect(() => {
        const loadLogs = async () => {
            if (!token) return;
            const logEntries = await Get(`${import.meta.env.VITE_API_URL}/logs`, token);
            setLogs(logEntries);
        };
        loadLogs();
    }, [token]);

    const groupedLogs = logs.reduce((acc, log) => {
        const date = new Date(log.time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        (acc[date] = acc[date] || []).push(log);
        return acc;
    }, {});

    const trendData = Object.entries(
        logs.reduce((acc, log) => {
            acc[log.emotion] = (acc[log.emotion] || 0) + 1;
            return acc;
        }, {})
    ).map(([emotion, count]) => ({
        emotion,
        count,
        color: emotionMap[emotion]?.color || 'grey.400',
    }));

    const maxCount = Math.max(...trendData.map(d => d.count), 0);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', pb: 4, mx: -2 }}>
            <Paper
                elevation={0}
                sx={{
                    position: 'sticky',
                    top: "68px",
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: '1rem',
                    pb: '0.75rem',
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider'
                }}
            >
                <IconButton onClick={goBack}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" component="h1" fontWeight="bold" sx={{ flex: 1, textAlign: 'center' }}>
                    Log History
                </Typography>
                <Box sx={{ width: 40 }} />
            </Paper>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: '1.5rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Emotional Trends</Typography>
                            <Typography variant="body2" color="text.secondary">All time</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: '9999px', bgcolor: 'action.hover' }}>
                            <IconButton size="small" onClick={() => setChartType('bar')} sx={{ bgcolor: chartType === 'bar' ? 'background.default' : 'transparent', boxShadow: chartType === 'bar' ? 1 : 0 }}>
                                <BarChartIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setChartType('line')} sx={{ bgcolor: chartType === 'line' ? 'background.default' : 'transparent', boxShadow: chartType === 'line' ? 1 : 0 }}>
                                <ShowChartIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2, height: '12rem', position: 'relative' }}>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'repeat(4, 1fr)' }}>
                            {[...Array(3)].map((_, i) => <Box key={i} sx={{ borderBottom: '1px dashed', borderColor: 'divider' }} />)}
                        </Box>
                        <Box sx={{ position: 'absolute', inset: 0, bottom: 0, zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 1 }}>
                            {trendData.map(d => (
                                <Box key={d.emotion} sx={{ position: 'relative', display: 'flex', width: '2rem', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', '&:hover .tooltip': { display: 'block' } }}>
                                    <Typography className="tooltip" sx={{ display: 'none', position: 'absolute', top: '-1.75rem', whiteSpace: 'nowrap', borderRadius: 'md', bgcolor: 'grey.800', px: 2, py: 1, fontSize: '0.75rem', fontWeight: '600', color: 'white' }}>
                                        {d.count} times
                                    </Typography>
                                    <Box sx={{ height: `${(d.count / maxCount) * 100}%`, width: '100%', borderRadius: '0.5rem 0.5rem 0 0', bgcolor: d.color, transition: 'all 0.3s', '&:hover': { filter: 'brightness(1.2)' } }} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-around', borderTop: 1, borderColor: 'divider', pt: 1 }}>
                        {trendData.map(d => (
                            <Box key={d.emotion} sx={{ display: 'flex', width: '2rem', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Box sx={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', bgcolor: d.color }} />
                                <Typography sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: '500', color: 'text.secondary' }}>{d.emotion}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                {Object.entries(groupedLogs).reverse().map(([date, logs]) => (
                    <Box key={date}>
                        <Typography sx={{ px: 1, pb: 1, fontSize: '0.875rem', fontWeight: '600', color: 'text.secondary' }}>{date}</Typography>
                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, borderRadius: '1.5rem', p: 0.5 }}>
                            {logs.map((log, index) => (
                                <React.Fragment key={index}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '0.75rem', '&:hover': { bgcolor: 'action.hover' } }}>
                                        <Avatar sx={{ width: 48, height: 48, bgcolor: emotionMap[log.emotion]?.bgColor }}>
                                            {emotionMap[log.emotion]?.icon}
                                        </Avatar>
                                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 }}>
                                            <Typography sx={{ fontSize: '1rem', fontWeight: '600' }}>Feeling: {log.emotion}</Typography>
                                            {log.trigger && <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Note: {log.trigger}</Typography>}
                                            {log.anchor && <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>Anchor: {log.anchor}</Typography>}
                                            {log.intensity && (
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>Intensity</Typography>
                                                    <Box sx={{ mt: 0.5, height: '6px', width: '100%', borderRadius: '9999px', bgcolor: 'action.disabledBackground' }}>
                                                        <Box sx={{ height: '6px', borderRadius: '9999px', bgcolor: emotionMap[log.emotion]?.color, width: `${log.intensity * 10}%` }} />
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                        <ChevronRightIcon sx={{ color: 'text.disabled' }} />
                                    </Box>
                                    {index < logs.length - 1 && <hr style={{ margin: '0 12px', border: 'none', borderTop: '1px solid var(--mui-palette-divider)' }} />}
                                </React.Fragment>
                            ))}
                        </Paper>
                    </Box>
                ))}

                {logs.length === 0 && (
                    <Paper elevation={0} sx={{
                        mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '1.5rem', border: '1px dashed', borderColor: 'divider', p: 4, textAlign: 'center',
                        bgcolor: 'transparent'
                    }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover' }}>
                            <SearchOffIcon sx={{ fontSize: '2rem', color: 'text.secondary' }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: '600' }}>No Logs Found</Typography>
                        <Typography sx={{ mt: 0.5, maxWidth: 'xs', fontSize: '0.875rem', color: 'text.secondary' }}>
                            You haven't logged any emotions yet. Start logging to see your history here.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default LogHistory;