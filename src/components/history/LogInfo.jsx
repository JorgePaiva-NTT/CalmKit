import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Chip, IconButton, Collapse, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const emotionMap = {
    'Angry': { icon: <SentimentVeryDissatisfiedIcon sx={{ color: '#ef4444' }} />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    'Anxious': { icon: <SentimentDissatisfiedIcon sx={{ color: '#a855f7' }} />, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' },
    'Sad': { icon: <SentimentDissatisfiedIcon sx={{ color: '#3b82f6' }} />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    'Neutral': { icon: <SentimentNeutralIcon sx={{ color: '#6b7280' }} />, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    'Calm': { icon: <SentimentSatisfiedAltIcon sx={{ color: '#22c55e' }} />, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    'Happy': { icon: <SentimentVerySatisfiedIcon sx={{ color: '#eab308' }} />, color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
};

const LogInfo = ({ date, logs, expandedLog, toggleExpand, setDeleteDialog }) => {
    const [viewLogs, setViewLogs] = useState(logs);

    useEffect(() => {
        setViewLogs(logs.reverse());
    }, [logs]);

    return (
        <Box key={date}>
            <Typography sx={{ px: 1, pb: 1, fontSize: '0.875rem', fontWeight: '600', color: 'text.secondary' }}>{date}</Typography>
            <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, borderRadius: '1.5rem', p: 0.5 }}>
                {viewLogs.map((log, index) => {
                    const isExpanded = expandedLog === log._id;
                    const logTime = new Date(log.time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });

                    return (
                        <React.Fragment key={log._id || index}>
                            <Box sx={{
                                borderRadius: '0.75rem',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 1.5,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => toggleExpand(log._id)}
                                >
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: emotionMap[log.emotion]?.bgColor || 'action.hover' }}>
                                        {emotionMap[log.emotion]?.icon || <SentimentNeutralIcon sx={{ color: '#6b7280' }} />}
                                    </Avatar>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography sx={{ fontSize: '1rem', fontWeight: '600' }}>
                                                {log.emotion}
                                            </Typography>
                                            <Chip
                                                label={logTime}
                                                size="small"
                                                sx={{ height: '20px', fontSize: '0.7rem' }}
                                            />
                                        </Box>
                                        {log.trigger && (
                                            <Typography
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    color: 'text.secondary',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: isExpanded ? 'normal' : 'nowrap',
                                                    maxWidth: isExpanded ? '100%' : '50vw'
                                                }}
                                            >
                                                {log.trigger}
                                            </Typography>
                                        )}
                                    </Box>
                                    <IconButton size="small" sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </Box>

                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ px: 2, pb: 2, pt: 0 }}>
                                        {log.anchor && (
                                            <Box sx={{ mb: 1.5 }}>
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 0.5 }}>
                                                    Anchor Used
                                                </Typography>
                                                <Paper sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '0.5rem' }}>
                                                    <Typography sx={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
                                                        "{log.anchor}"
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        )}

                                        {log.intensity !== undefined && (
                                            <Box sx={{ mb: 1.5 }}>
                                                <Typography sx={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 0.5 }}>
                                                    Intensity Level: {log.intensity}/10
                                                </Typography>
                                                <Box sx={{ height: '8px', width: '100%', borderRadius: '9999px', bgcolor: 'action.disabledBackground' }}>
                                                    <Box sx={{
                                                        height: '8px',
                                                        borderRadius: '9999px',
                                                        bgcolor: emotionMap[log.emotion]?.color,
                                                        width: `${log.intensity * 10}%`,
                                                        transition: 'width 0.3s'
                                                    }} />
                                                </Box>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialog({ open: true, logId: log._id });
                                                }}
                                                sx={{ flex: 1 }}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>
                            {index < logs.length - 1 && <hr style={{ margin: '0 12px', border: 'none', borderTop: '1px solid var(--mui-palette-divider)' }} />}
                        </React.Fragment>
                    );
                })}
            </Paper>
        </Box>
    );
};

export default LogInfo;