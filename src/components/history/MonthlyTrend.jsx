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
import { gradientDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

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

// Map mood [1..10] -> y pixel in [0..h]
function yFor(score, h) {
    const clamped = Math.max(1, Math.min(10, score));
    const t = (10 - clamped) / 9; // 10 (top) -> 0, 1 (bottom) -> 1
    return t * h;
}

// Build an SVG path string connecting defined points and creating gaps for undefined
function buildPath(points) {
    let d = "";
    let started = false;
    for (const p of points) {
        if (p == null) {
            started = false;
            continue;
        }
        const cmd = started ? "L" : "M";
        d += `${cmd}${p.x},${p.y}`;
        started = true;
    }
    return d;
}

// Build a simple area fill path that follows the line and closes to the bottom
function buildAreaPath(points, h) {
    const firstIdx = points.findIndex((p) => p);
    const lastIdx = points.length - 1 - [...points].reverse().findIndex((p) => p);
    if (firstIdx < 0 || lastIdx < 0 || firstIdx > lastIdx) return "";
    const slice = points.slice(firstIdx, lastIdx + 1).filter(Boolean);
    if (!slice.length) return "";
    let d = `M${slice[0].x},${h} L${slice[0].x},${slice[0].y}`;
    for (let i = 1; i < slice.length; i++) d += ` L${slice[i].x},${slice[i].y}`;
    d += ` L${slice[slice.length - 1].x},${h} Z`;
    return d;
}

export default function MonthlyTrend({ onBack }) {
    const theme = useTheme();
    const { token } = useAuthState();
    const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ dailyScores: [], monthAverage: null });
    const chartRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(480);

    // Observe container width for responsive SVG sizing
    useEffect(() => {
        const el = chartRef.current;
        if (!el) return;
        const obs = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                if (w > 0) setChartWidth(w);
            }
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        let mounted = true;
        async function run() {
            setLoading(true);
            setError(null);
            try {
                const year = monthDate.getFullYear();
                const month = monthDate.getMonth() + 1; // 1-based
                const url = `${import.meta.env.VITE_API_URL}/logs/mood-trends/${year}/${month}`;
                const res = await Get(url, token);
                if (!mounted) return;
                setData(res || { dailyScores: [], monthAverage: null });
            } catch (e) {
                if (!mounted) return;
                setError("Failed to load monthly trends");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (token) run();
    }, [monthDate, token]);

    const { points, areaPath, xTicks, yGrid, hasData, hoverPoints } = useMemo(() => {
        const h = 148;
        const paddingX = 4; // inner padding for nicer caps
        const dim = daysInMonth(monthDate);
        const w = Math.max(320, chartWidth);

        const scoresByDay = new Array(dim).fill(null);
        (data?.dailyScores || []).forEach((d) => {
            if (!d) return;
            const idx = Math.max(1, Math.min(dim, d.day)) - 1;
            scoresByDay[idx] = typeof d.moodScore === "number" ? d.moodScore : null;
        });

        const step = dim > 1 ? (w - paddingX * 2) / (dim - 1) : 0;
        const pts = scoresByDay.map((v, i) =>
            v == null
                ? null
                : {
                    x: Math.round(paddingX + i * step),
                    y: Math.round(yFor(v, h)),
                    v,
                    day: i + 1,
                    color: v >= 7 ? COLORS.happy : v >= 4 ? COLORS.anxious : COLORS.angry,
                }
        );

        const area = buildAreaPath(pts, h);
        const path = buildPath(pts);
        const xt = [1, 5, 10, 15, 20, 25, 30].filter((d) => d <= dim).map((d) => ({
            x: paddingX + (d - 1) * step,
            label: String(d)
        }));
        const yg = [0, 0.5, 1].map((t) => ({ y: Math.round(t * h) })); // 10 / 5 / 1

        return {
            points: path,
            areaPath: area,
            xTicks: xt,
            yGrid: yg,
            hasData: pts.some((p) => p != null),
            hoverPoints: pts.filter(Boolean),
        };
    }, [data, monthDate, chartWidth]);

    const monthlyEmotionCounts = useMemo(() => {
        const totals = { happy: 0, calm: 0, neutral: 0, sad: 0, anxious: 0, angry: 0 };
        const normalize = (name) => {
            const k = (name || "").toLowerCase();
            if (k === "anger") return "angry";
            if (k === "anxiety") return "anxious";
            if (k === "joy" || k === "content") return "happy";
            if (k === "ok" || k === "meh") return "neutral";
            return k; // expected: happy, calm, neutral, sad, anxious, angry
        };
        for (const d of data?.dailyScores || []) {
            const arr = Array.isArray(d?.emotions) ? d.emotions : [];
            for (const item of arr) {
                const key = normalize(item?.emotion);
                if (key && Object.prototype.hasOwnProperty.call(totals, key)) {
                    totals[key] += 1;
                }
            }
        }
        return totals;
    }, [data]);

    const goPrev = () => setMonthDate((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
    const goNext = () => setMonthDate((d) => startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)));

    return (
        <Box sx={{ px: 2, pb: 2 }}>
            {/* Header */}
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

            {/* Month selector */}
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

            {/* Chart Card */}
            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: (t) => (t.palette.mode === "dark" ? "#1C2532" : undefined) }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={1}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>Intensity</Typography>
                            <Typography variant="body2" color="text.secondary">Day of Month</Typography>
                        </Box>

                        {/* Chart body */}
                        <Box ref={chartRef} sx={{ position: "relative", width: "100%", minHeight: 180, pt: 1 }}>
                            {loading ? (
                                <Skeleton variant="rounded" height={180} />
                            ) : (
                                <Box sx={{ position: "relative", width: "100%", height: 180 }}>
                                    {/* Y labels */}
                                    <Box sx={{ position: "absolute", left: -15, top: 0, bottom: 20, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                                        <Typography variant="caption" sx={{ color: COLORS.happy, fontWeight: 600 }}>10</Typography>
                                        <Typography variant="caption" sx={{ color: COLORS.anxious, fontWeight: 600 }}>5</Typography>
                                        <Typography variant="caption" sx={{ color: COLORS.angry, fontWeight: 600 }}>1</Typography>
                                    </Box>

                                    {/* Grid lines */}
                                    <Box sx={{ position: "absolute", inset: 8, pointerEvents: "none" }}>
                                        {yGrid.map((g, i) => (
                                            <Box key={i} sx={{ position: "absolute", left: 0, right: 0, top: g.y, borderTop: (theme) => `1px dashed ${theme.palette.mode === "dark" ? "rgba(148,163,184,0.35)" : "#e2e8f0"}` }} />
                                        ))}
                                    </Box>

                                    {/* SVG Chart */}
                                    <svg width="100%" height="180" viewBox={`-3 0 ${Math.max(320, chartWidth)} 180`} preserveAspectRatio="none">
                                        <defs>
                                            {/* Vertical gradient: top green -> middle yellow -> bottom red */}
                                            <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.happy} />
                                                <stop offset="50%" stopColor={COLORS.anxious} />
                                                <stop offset="100%" stopColor={COLORS.angry} />
                                            </linearGradient>
                                            {/* Area gradient with soft fade */}
                                            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={COLORS.happy} stopOpacity="0.25" />
                                                <stop offset="50%" stopColor={COLORS.anxious} stopOpacity="0.12" />
                                                <stop offset="100%" stopColor={COLORS.angry} stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Area fill under line */}
                                        {hasData && (
                                            <path d={areaPath} fill="url(#area-gradient)" />
                                        )}
                                        {/* Line path */}
                                        {hasData && (
                                            <path d={points} stroke="url(#line-gradient)" strokeWidth={3} strokeLinecap="round" fill="none" />
                                        )}

                                        {/* Interactive points */}
                                        {console.log("Rendering hover points:", hoverPoints)}
                                        {hoverPoints.map((p) => (
                                            <g key={p.day} transform={`translate(${p.x}, ${p.y})`}>
                                                <circle r="7" fill={p.color} stroke={theme.palette.mode === "dark" ? "#1C2532" : "#f6f7f8"} strokeWidth="3">
                                                    <title>{p.v.toFixed(1)}</title>
                                                </circle>
                                            </g>
                                        ))}
                                    </svg>

                                    {/* X ticks */}
                                    <Stack direction="row" justifyContent="space-between" sx={{ position: "absolute", left: 0, right: 0, bottom: 0, px: 1 }}>
                                        {xTicks.map((t, i) => (
                                            <Typography key={i} variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>{t.label}</Typography>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Emotion counters */}
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
                                        <Typography variant="body1" fontWeight={700}>{monthlyEmotionCounts[key] || 0}</Typography>
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

            {/* No data hint */}
            {!loading && !error && !hasData && (
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

