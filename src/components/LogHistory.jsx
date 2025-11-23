import { useState, useEffect } from 'react';
import {
    Box, Typography, IconButton, InputBase, Select, MenuItem, Button, Paper, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions,
    DialogContentText, Snackbar, Alert,
    Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import { useAuthState } from '../context/AuthContext';
import { Get, Delete as DeleteRequest } from '../utils/http';
import LogInfo from './history/LogInfo';
import MonthlyTrend from './history/MonthlyTrend';
import CalendarMoodView from './history/CalendarMoodView';
import CalmSelect from './Common/CalmSelect';
import ClearIcon from '@mui/icons-material/Clear';

const emotionMap = {
    'Angry': { icon: <SentimentVeryDissatisfiedIcon sx={{ color: '#ef4444' }} />, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
    'Anxious': { icon: <SentimentDissatisfiedIcon sx={{ color: '#a855f7' }} />, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.1)' },
    'Sad': { icon: <SentimentDissatisfiedIcon sx={{ color: '#3b82f6' }} />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    'Neutral': { icon: <SentimentNeutralIcon sx={{ color: '#6b7280' }} />, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    'Calm': { icon: <SentimentSatisfiedAltIcon sx={{ color: '#22c55e' }} />, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
    'Happy': { icon: <SentimentVerySatisfiedIcon sx={{ color: '#eab308' }} />, color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
};

const LogHistory = ({ goBack, onNavigateToChat }) => {

    const filterToday = { label: "Today", value: "today" };
    const filterLast7Days = { label: "Last 7 Days", value: "last7days" };
    const filterLastMonth = { label: "Last Month", value: "lastmonth" };
    const filterAll = { label: "All", value: "all" };

    const [chartType, setChartType] = useState('bar');
    const [showMonthly, setShowMonthly] = useState(false);

    const [logs, setLogs] = useState([]);
    const [viewLogs, setViewLogs] = useState([]);

    const [expandedLog, setExpandedLog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, logId: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEmotion, setFilterEmotion] = useState(filterAll);
    const [timeInterval, setTimeInterval] = useState(filterLast7Days);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    // Calendar state
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarMoodData, setCalendarMoodData] = useState(null);
    const [calendarLoading, setCalendarLoading] = useState(false);

    const { token } = useAuthState();

    const getDateRangeParams = () => {
        const now = new Date();
        const params = {};

        switch (timeInterval.value) {
            case filterToday.value:
                params.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
                params.endDate = new Date().toISOString();
                break;
            case filterLast7Days.value:
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
                params.startDate = sevenDaysAgo.toISOString();
                params.endDate = new Date().toISOString();
                break;
            case filterLastMonth.value:
                const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                params.startDate = thirtyDaysAgo.toISOString();
                params.endDate = new Date().toISOString();
                break;
            default:
                // 'all' - no date params
                break;
        }

        return params;
    };

    useEffect(() => {
        if (!selectedDate) return;
        setShowCalendar(false);
    }, [selectedDate])

    useEffect(() => {
        const fetchDayLogs = async () => {
            if (!selectedDate || !token) return;
            setLoading(true);

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            const params = {
                startDate: startOfDay.toISOString(),
                endDate: endOfDay.toISOString(),
            };

            const queryString = new URLSearchParams(params).toString();
            const url = `${import.meta.env.VITE_API_URL}/logs?${queryString}`;

            const logEntries = await Get(url, token);
            setLogs(Array.isArray(logEntries) ? logEntries : []);
            setLoading(false);
        };
        fetchDayLogs();
    }, [selectedDate, token]);

    useEffect(() => {
        const load = async () => {
            if (selectedDate) return;

            setLoading(true);
            if (!token) { setLoading(false); return; }

            const dateParams = getDateRangeParams();
            const queryString = new URLSearchParams(dateParams).toString();
            const url = `${import.meta.env.VITE_API_URL}/logs${queryString ? `?${queryString}` : ''}`;

            const logEntries = await Get(url, token);
            setLogs(Array.isArray(logEntries) ? logEntries : []);
            setLoading(false);
        };
        load();
    }, [token, timeInterval, selectedDate]);

    useEffect(() => {
        setViewLogs(Array.isArray(logs) ? logs : []);
    }, [logs]);

    useEffect(() => {
        const fetchMoodData = async () => {
            setCalendarLoading(true);
            try {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth() + 1;
                const response = await Get(`${import.meta.env.VITE_API_URL}/logs/mood-trends/${year}/${month}`, token);
                setCalendarMoodData(response);
            } catch (error) {
                console.error('Failed to fetch mood data:', error);
            } finally {
                setCalendarLoading(false);
            }
        };
        if (showCalendar && token) {
            fetchMoodData();
        }
    }, [showCalendar, currentMonth, token]);

    const handleDeleteLog = async (logId) => {
        try {
            await DeleteRequest(`${import.meta.env.VITE_API_URL}/logs/${logId}`, token);
            setViewLogs(viewLogs.filter(log => log._id !== logId));
            setSnackbar({ open: true, message: 'Log deleted successfully', severity: 'success' });
            setDeleteDialog({ open: false, logId: null });
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to delete log', severity: 'error' });
        }
    };

    const toggleExpand = (logId) => {
        setExpandedLog(expandedLog === logId ? null : logId);
    };

    const handleDiscussLog = (log) => {
        if (onNavigateToChat) {
            onNavigateToChat(log);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilterEmotion(filterAll);
        setSelectedDate(null);
        setTimeInterval(filterLast7Days);
    };

    const hasActiveFilters = searchQuery !== '' || filterEmotion.value !== filterAll.value || selectedDate !== null || timeInterval.value !== filterLast7Days.value;

    const filteredLogs = viewLogs.filter(log => {
        const matchesSearch = searchQuery === '' ||
            log.trigger?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.anchor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.emotion?.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedDate) {
            const logDate = new Date(log.time).toISOString().split('T')[0];
            const matchesDate = logDate === selectedDate;
            return matchesSearch && matchesDate;
        }

        const matchesFilter = filterEmotion.value === filterAll.value || log.emotion === filterEmotion.value;
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
        filteredLogs.reduce((acc, log) => {
            acc[log.emotion] = (acc[log.emotion] || 0) + 1;
            return acc;
        }, {})
    ).map(([emotion, count]) => ({
        emotion,
        count,
        color: emotionMap[emotion]?.color || '#9ca3af',
    }));

    const maxCount = Math.max(...trendData.map(d => d.count), 1);

    if (showMonthly) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', pb: 4, mx: -2 }}>
                <MonthlyTrend onBack={() => setShowMonthly(false)} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', pb: 4, mx: -2 }}>
            <Box sx={{ px: 2, py: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: '1.5rem', display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {
                            hasActiveFilters ?
                                <ClearIcon sx={{ color: 'text.secondary' }} onClick={clearFilters} /> :
                                <FilterListIcon sx={{ color: 'text.secondary' }} />
                        }
                        <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', gap: 1, p: 1, borderRadius: '2rem', bgcolor: 'action.hover' }}>

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
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalmSelect
                            options={[
                                filterAll,
                                ...Object.keys(emotionMap).map(emotion => ({ value: emotion, label: emotion })),
                            ]}
                            value={filterEmotion.value}
                            onChange={setFilterEmotion}
                            size="small"
                            disabled={!!selectedDate}
                            sx={{
                                flex: 1,
                                fontSize: '0.875rem',
                                opacity: selectedDate ? 0.5 : 1,
                            }}
                        />

                        <CalmSelect
                            options={[
                                filterAll,
                                filterToday,
                                filterLast7Days,
                                filterLastMonth,
                            ]}
                            value={timeInterval.value}
                            onChange={setTimeInterval}
                            size="small"
                            disabled={!!selectedDate}
                            sx={{
                                opacity: selectedDate ? 0.5 : 1,
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={() => setShowCalendar(!showCalendar)}
                            sx={{
                                bgcolor: showCalendar ? 'primary.main' : 'transparent',
                                color: showCalendar ? 'white' : 'inherit',
                                '&:hover': {
                                    bgcolor: showCalendar ? 'primary.dark' : 'action.hover',
                                }
                            }}
                        >
                            <EventIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Paper>

                {showCalendar && (
                    <CalendarMoodView
                        loading={calendarLoading}
                        moodData={calendarMoodData}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                    />
                )}

                <Paper elevation={2} sx={{ p: 2, borderRadius: '1.5rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        {loading ? (
                            <>
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="60%" height={32} />
                                    <Skeleton variant="text" width="40%" height={20} />
                                </Box>
                                <Skeleton variant="rounded" width={80} height={40} />
                            </>
                        ) : (
                            <>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">Emotional Trends</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedDate ? selectedDate : timeInterval.label}</Typography>
                                </Box>
                                <Button size="small" variant="contained" startIcon={<CalendarMonthIcon />} onClick={() => setShowMonthly(true)} sx={{ ml: 1, borderRadius: '9999px' }}>
                                    Monthly
                                </Button>
                            </>
                        )}
                    </Box>

                    <Box sx={{ mt: 2, height: '12rem', position: 'relative' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', px: 1 }}>
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rectangular"
                                        width={32}
                                        height={`${Math.random() * 60 + 40}%`}
                                        sx={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                                    />
                                ))}
                            </Box>
                        ) : trendData.length > 0 ? (
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', borderTop: 1, borderColor: 'divider', pt: 1, px: 1 }}>
                        {trendData.map(d => (
                            <Box key={d.emotion} sx={{ display: 'flex', width: '2rem', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Box sx={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', bgcolor: d.color }} />
                                <Typography sx={{ mt: 0.5, fontSize: '0.75rem', fontWeight: '500', color: 'text.secondary' }}>{d.emotion}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>

                {loading ? (
                    <>
                        {[1, 2].map((item) => (
                            <Box key={item}>
                                <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
                                <Paper elevation={2} sx={{ borderRadius: '1.5rem', p: 2 }}>
                                    {[1, 2, 3].map((i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: i < 3 ? 2 : 0 }}>
                                            <Skeleton variant="circular" width={48} height={48} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton variant="text" width="40%" height={24} />
                                                <Skeleton variant="text" width="80%" height={20} />
                                            </Box>
                                            <Skeleton variant="circular" width={24} height={24} />
                                        </Box>
                                    ))}
                                </Paper>
                            </Box>
                        ))}
                    </>
                ) : (
                    Object.entries(groupedLogs).reverse().map(([date, logs]) => (
                        <LogInfo
                            key={date}
                            date={date}
                            logs={logs}
                            expandedLog={expandedLog}
                            toggleExpand={toggleExpand}
                            setDeleteDialog={setDeleteDialog}
                            onDiscussLog={handleDiscussLog}
                        />
                    ))
                )}

                {!loading && viewLogs.length === 0 && (
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

                {!loading && viewLogs.length > 0 && filteredLogs.length === 0 && (
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