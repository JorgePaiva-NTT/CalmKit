import React, { useState, useEffect } from 'react';
import {
    Box, Typography, IconButton, InputBase, Select, MenuItem, Button, Paper, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, Collapse, Chip, TextField,
    DialogContentText, Snackbar, Alert
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
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useAuthState } from '../context/AuthContext';
import { Get, Delete as DeleteRequest, Post } from '../utils/http';

const emotionMap = {
    'Angry': { icon: <SentimentVeryDissatisfiedIcon sx={{ color: '#ef4444' }} />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    'Anxious': { icon: <SentimentDissatisfiedIcon sx={{ color: '#a855f7' }} />, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' },
    'Sad': { icon: <SentimentDissatisfiedIcon sx={{ color: '#3b82f6' }} />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    'Neutral': { icon: <SentimentNeutralIcon sx={{ color: '#6b7280' }} />, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    'Calm': { icon: <SentimentSatisfiedAltIcon sx={{ color: '#22c55e' }} />, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    'Happy': { icon: <SentimentVerySatisfiedIcon sx={{ color: '#eab308' }} />, color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
};

const LogHistory = ({ goBack }) => {
    const [chartType, setChartType] = useState('bar');
    const [logs, setLogs] = useState([]);
    const [expandedLog, setExpandedLog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, logId: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEmotion, setFilterEmotion] = useState('all');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { token } = useAuthState();

    useEffect(() => {
        const loadLogs = async () => {
            if (!token) return;
            const logEntries = await Get(`${import.meta.env.VITE_API_URL}/logs`, token);
            setLogs(logEntries);
        };
        loadLogs();
    }, [token]);

    const handleDeleteLog = async (logId) => {
        try {
            await DeleteRequest(`${import.meta.env.VITE_API_URL}/logs/${logId}`, token);
            setLogs(logs.filter(log => log._id !== logId));
            setSnackbar({ open: true, message: 'Log deleted successfully', severity: 'success' });
            setDeleteDialog({ open: false, logId: null });
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to delete log', severity: 'error' });
        }
    };

    const toggleExpand = (logId) => {
        setExpandedLog(expandedLog === logId ? null : logId);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = searchQuery === '' ||
            log.trigger?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.anchor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.emotion?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterEmotion === 'all' || log.emotion === filterEmotion;
        return matchesSearch && matchesFilter;
    });

    const groupedLogs = filteredLogs
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .reduce((acc, log) => {
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
        color: emotionMap[emotion]?.color || '#9ca3af',
    }));

    const maxCount = Math.max(...trendData.map(d => d.count), 1);

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
                {/* Search and Filter Controls */}
                <Paper elevation={2} sx={{ p: 2, borderRadius: '1.5rem', display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: '0.75rem', bgcolor: 'action.hover' }}>
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                        <InputBase
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ flex: 1, fontSize: '0.875rem' }}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery('')}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon sx={{ color: 'text.secondary' }} />
                        <Select
                            value={filterEmotion}
                            onChange={(e) => setFilterEmotion(e.target.value)}
                            size="small"
                            sx={{ flex: 1, fontSize: '0.875rem' }}
                        >
                            <MenuItem value="all">All Emotions</MenuItem>
                            {Object.keys(emotionMap).map(emotion => (
                                <MenuItem key={emotion} value={emotion}>{emotion}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Paper>

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
                        {trendData.length > 0 ? (
                            <>
                                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: 'repeat(4, 1fr)' }}>
                                    {[...Array(3)].map((_, i) => <Box key={i} sx={{ borderBottom: '1px dashed', borderColor: 'divider' }} />)}
                                </Box>
                                <Box sx={{ position: 'absolute', inset: 0, bottom: 0, zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 1 }}>
                                    {trendData.map(d => {
                                        const heightPercent = (d.count / maxCount) * 100;

                                        return (
                                            <Box key={d.emotion} sx={{ position: 'relative', display: 'flex', width: '2rem', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', '&:hover .tooltip': { display: 'block' } }}>
                                                <Typography className="tooltip" sx={{ display: 'none', position: 'absolute', bottom: '100%', mb: 1, whiteSpace: 'nowrap', borderRadius: '0.375rem', bgcolor: '#1f2937', px: 2, py: 1, fontSize: '0.75rem', fontWeight: '600', color: 'white', zIndex: 10 }}>
                                                    {d.count} {d.count === 1 ? 'time' : 'times'}
                                                </Typography>
                                                <Box sx={{
                                                    height: `calc(1px * ${heightPercent})`,
                                                    width: '100%',
                                                    borderRadius: '0.5rem 0.5rem 0 0',
                                                    bgcolor: d.color,
                                                    transition: 'all 0.3s',
                                                    '&:hover': { filter: 'brightness(1.2)', transform: 'scaleY(1.05)', transformOrigin: 'bottom' }
                                                }} />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="body2" color="text.secondary">No emotion data to display</Typography>
                            </Box>
                        )}
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
                            {logs.map((log, index) => {
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
                                                <Avatar sx={{ width: 48, height: 48, bgcolor: emotionMap[log.emotion]?.bgColor }}>
                                                    {emotionMap[log.emotion]?.icon}
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
                                                                whiteSpace: isExpanded ? 'normal' : 'nowrap'
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

                {logs.length > 0 && filteredLogs.length === 0 && (
                    <Paper elevation={0} sx={{
                        mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '1.5rem', border: '1px dashed', borderColor: 'divider', p: 4, textAlign: 'center',
                        bgcolor: 'transparent'
                    }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover' }}>
                            <SearchOffIcon sx={{ fontSize: '2rem', color: 'text.secondary' }} />
                        </Avatar>
                        <Typography variant="h6" sx={{ mt: 2, fontWeight: '600' }}>No Matching Logs</Typography>
                        <Typography sx={{ mt: 0.5, maxWidth: 'xs', fontSize: '0.875rem', color: 'text.secondary' }}>
                            Try adjusting your search or filter criteria.
                        </Typography>
                    </Paper>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, logId: null })}
                slotProps={{
                    paper: {
                        sx: { borderRadius: '1rem' }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: '600' }}>Delete Log Entry?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this log entry? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, logId: null })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleDeleteLog(deleteDialog.logId)}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: '0.75rem' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LogHistory;