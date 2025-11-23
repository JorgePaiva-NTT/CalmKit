import { useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Divider,
    IconButton,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { LineChart } from "@mui/x-charts/LineChart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import SentimentSadIcon from "@mui/icons-material/SentimentDissatisfied";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { useAuthState } from "../../context/AuthContext";
import { Get } from "../../utils/http";
import { hasKey, ensureKeyFromSession } from "../../utils/crypto";
import { interpolateRdYlGn } from "d3-scale-chromatic";

// Color system aligned with the design
const COLORS = {
    happy: "#4ade80",
    calm: "#38bdf8",
    neutral: "#a8a29e",
    sad: "#60a5fa",
    anxious: "#facc15",
    angry: "#f87171",
};

const EMOTIONS = [
    { key: "happy", label: "Happy", Icon: SentimentVerySatisfiedIcon, color: COLORS.happy },
    { key: "calm", label: "Calm", Icon: SelfImprovementIcon, color: COLORS.calm },
    { key: "neutral", label: "Neutral", Icon: SentimentNeutralIcon, color: COLORS.neutral },
    { key: "sad", label: "Sad", Icon: SentimentSadIcon, color: COLORS.sad },
    { key: "anxious", label: "Anxious", Icon: MoodBadIcon, color: COLORS.anxious },
    { key: "angry", label: "Angry", Icon: SentimentVeryDissatisfiedIcon, color: COLORS.angry },
];

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    return new Date(y, m + 1, 0).getDate();
}

function formatMonth(date) {
    return date.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export default function MonthlyTrend({ onBack }) {
    const theme = useTheme();
    const { token } = useAuthState();
    const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ dailyScores: [], monthAverage: null });
    const chartContainerRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        async function run() {
            setLoading(true);
            setError(null);
            setEmotionCounts({ happy: 0, calm: 0, neutral: 0, sad: 0, anxious: 0, angry: 0 });
            try {
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth() + 1;
                const url = `${import.meta.env.VITE_API_URL}/logs/mood-trends/${year}/${month}`;
                const res = await Get(url, token);
                if (!mounted) return;

                const mergedScores = [...(res?.dailyScores || [])];
                const uniqueScores = Array.from(
                    new Map(mergedScores.map(item => [item.day, item])).values()
                );

                setData({
                    dailyScores: uniqueScores.sort((a, b) => a.day - b.day),
                    monthAverage: res?.monthAverage
                });
            } catch (e) {
                if (!mounted) return;
                setError("Failed to load monthly trends");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (token) run();
    }, [monthDate, token]);

    const chartData = useMemo(() => {
        const dim = daysInMonth(monthDate);
        const xData = Array.from({ length: dim }, (_, i) => i + 1);
        const yData = new Array(dim).fill(null);

        (data?.dailyScores || []).forEach((d) => {
            if (!d || typeof d.day !== "number") return;
            const idx = d.day - 1;
            if (idx >= 0 && idx < dim) {
                yData[idx] = typeof d.moodScore === "number" ? d.moodScore : null;
            }
        });

        return { xData, yData, hasData: yData.some((v) => v != null) };
    }, [data, monthDate]);

    const [emotionCounts, setEmotionCounts] = useState({ happy: 0, calm: 0, neutral: 0, sad: 0, anxious: 0, angry: 0 });

    useEffect(() => {
        if (loading) {
            return;
        }

        let isMounted = true;

        const currentYear = monthDate.getFullYear();
        const currentMonth = monthDate.getMonth();

        const totals = { happy: 0, calm: 0, neutral: 0, sad: 0, anxious: 0, angry: 0 };
        const normalize = (name) => {
            const k = (name || "").toLowerCase();
            return k;
        };

        for (const d of data?.dailyScores || []) {
            const arr = Array.isArray(d?.emotions) ? d.emotions : [];
            if (arr.length === 0) continue;
            for (const item of arr) {
                const key = item?.emotion;
                if (key) {
                    totals[normalize(key)] += 1;
                }
            }
        }

        setEmotionCounts(totals);

        return () => {
            isMounted = false;
        };
    }, [data, monthDate, token, loading]);

    const goPrev = () => setMonthDate((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
    const goNext = () => setMonthDate((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)));

    return (
        <Box sx={{ px: 2, pb: 2 }}>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
                <Box sx={{ width: 40, display: "flex", alignItems: "center" }}>
                    {onBack && (
                        <IconButton aria-label="Back" size="small" onClick={onBack}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Reflection</Typography>
                <Box sx={{ width: 40 }} />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, pb: 1 }}>
                <IconButton aria-label="Previous month" onClick={goPrev}>
                    <ChevronLeftIcon />
                </IconButton>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{formatMonth(monthDate)}</Typography>
                </Stack>
                <IconButton aria-label="Next month" onClick={goNext}>
                    <ChevronRightIcon />
                </IconButton>
            </Stack>

            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: (t) => (t.palette.mode === "dark" ? "#1C2532" : undefined) }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={1}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>Intensity</Typography>
                            <Typography variant="body2" color="text.secondary">Day of Month</Typography>
                        </Box>

                        <Box ref={chartContainerRef} sx={{ position: "relative", width: "100%", height: 220 }}>
                            {loading ? (
                                <Skeleton variant="rounded" height={220} />
                            ) : chartData.hasData ? (
                                <LineChart
                                    grid={{ horizontal: true }}
                                    xAxis={[{
                                        data: chartData.xData,
                                        scaleType: "linear",
                                        valueFormatter: (v) => `Day ${v}`,
                                    }]}
                                    yAxis={[{
                                        min: 1,
                                        max: 10,
                                        tickNumber: 2,
                                        colorMap: {
                                            type: "continuous",
                                            min: 1,
                                            max: 10,
                                            color: (t) => interpolateRdYlGn(t),
                                        }
                                    }]}
                                    series={[{
                                        data: chartData.yData,
                                        connectNulls: true,
                                        area: true,
                                        showMark: true,
                                        valueFormatter: (v) => v != null ?
                                            `Score: ${v.toFixed(1)}` :
                                            "No data",
                                    }]}
                                    height={225}
                                    sx={{
                                        "& .MuiChartsSurface-root": {
                                            zoom: 1.125,
                                            right: "5%",
                                            width: "110%"
                                        },
                                        "& .MuiChartsAxis-line": {
                                            visibility: "hidden",
                                        },
                                        "& .MuiChartsAxis-tick": {
                                            visibility: "hidden",
                                        },
                                        "& .MuiLineElement-root": {
                                            strokeWidth: 3,
                                        },
                                        "& .MuiAreaElement-root": {
                                            fillOpacity: 0.2,
                                        },
                                        "& .MuiChartsAxis-label": {
                                            fontFamily: 'Manrope, sans-serif !important',
                                            fontWeight: "700 !important",
                                            fontSize: '1rem !important',
                                        },
                                        "& .MuiChartsAxis-tickLabel": {
                                            fontFamily: 'Manrope, sans-serif important',
                                            fontWeight: "700 !important",
                                            fontSize: '0.95rem important',
                                        },
                                    }}
                                />
                            ) : (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                    <Typography variant="body2" color="text.secondary">No data to display</Typography>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ mt: 2 }}>
                <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1.5}>
                    {EMOTIONS.map(({ key, label, Icon, color }) => (
                        <Card key={key} variant="outlined" sx={{ flex: "1 1 calc(50% - 8px)", minWidth: 140, borderRadius: 2, bgcolor: (t) => (t.palette.mode === "dark" ? "#1C2532" : undefined) }}>
                            <CardContent sx={{ py: 1.5, px: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon sx={{ color, fontSize: 24 }} />
                                </Box>
                                {loading ? (
                                    <Box sx={{ flex: 1 }}>
                                        <Skeleton width={32} />
                                        <Skeleton width={60} />
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="body1" fontWeight={700}>{emotionCounts[key] || 0}</Typography>
                                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>

            {/* Insight card */}
            <Box sx={{ mt: 2 }}>
                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: (t) => (t.palette.mode === "dark" ? "#1C2532" : undefined) }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Insight for the month</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {loading
                                ? "\u00A0"
                                : data?.monthAverage
                                    ? `Your average mood this month is ${Number(data.monthAverage).toFixed(1)}.`
                                    : "No insight available yet."}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {!loading && !error && !chartData.hasData && (
                <Card variant="outlined" sx={{ mt: 2, borderStyle: "dashed", bgcolor: "transparent" }}>
                    <CardContent sx={{ textAlign: "center" }}>
                        <Typography variant="h6" color="text.secondary">No data for this month</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Start logging your emotions to see your trends and gain new insights.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="error">{error}</Typography>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />
        </Box>
    );
}

