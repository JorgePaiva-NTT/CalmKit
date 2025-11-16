import React, { useMemo, useRef, useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    Typography,
    Box,
    Stack,
    Button,
} from "@mui/material";

const BRAND = {
    teal: "#4A9093",
    error: "#E57373",
    gray: "#333333",
};

export default function PasscodeDialog({
    open,
    onSubmit,
    onCancel,
    cancelDisabled = false,
    loading = false,
    error: externalError = "",
    title = "Enter Your Code",
    message = "Please enter your 4-digit code to unlock your logs.",
}) {
    const [digits, setDigits] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        if (open) {
            setDigits(["", "", "", ""]);
            setError("");
            setTimeout(() => refs[0].current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        setError(externalError || "");
    }, [externalError]);

    const code = useMemo(() => digits.join(""), [digits]);

    const focusIndex = (i) => refs[i]?.current?.focus();

    const handleChange = (i, val) => {
        // keep only digits
        const v = (val || "").replace(/\D/g, "");
        setDigits((prev) => {
            const next = [...prev];
            if (v.length <= 1) {
                next[i] = v;
                if (v && i < 3) focusIndex(i + 1);
            } else {
                // Handle fast typing on mobile or paste into a single box
                const chars = v.slice(0, 4).split("");
                for (let k = 0; k < 4; k++) next[i + k] = chars[k] || prev[i + k] || "";
                const lastIdx = Math.min(i + v.length - 1, 3);
                focusIndex(lastIdx);
            }
            return next;
        });
        setError("");
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            e.preventDefault();
            setDigits((prev) => {
                const next = [...prev];
                next[i - 1] = "";
                return next;
            });
            focusIndex(i - 1);
        }
        if (e.key === "ArrowLeft" && i > 0) {
            e.preventDefault();
            focusIndex(i - 1);
        }
        if (e.key === "ArrowRight" && i < 3) {
            e.preventDefault();
            focusIndex(i + 1);
        }
    };

    const handlePaste = (e) => {
        const txt = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
        if (!txt) return;
        e.preventDefault();
        const chars = txt.slice(0, 4).split("");
        setDigits((_) => {
            const next = ["", "", "", ""];
            for (let k = 0; k < 4; k++) next[k] = chars[k] || "";
            return next;
        });
        focusIndex(Math.min(chars.length - 1, 3));
    };

    const submit = () => {
        if (code.length !== 4) {
            setError("Please enter all 4 digits.");
            return;
        }
        onSubmit?.(code);
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: (t) => ({
                    borderRadius: 3,
                    bgcolor: t.palette.mode === "dark" ? t.palette.background.default : "#F8F9FA",
                    boxShadow: 24,
                }),
            }}
            slotProps={{
                backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.6)" } },
            }}
        >
            <DialogContent sx={{ p: { xs: 3, sm: 4 }, width: 360, maxWidth: "90vw" }}>
                <Stack alignItems="center" spacing={2}>
                    <Typography
                        variant="h5"
                        sx={(t) => ({
                            fontWeight: 800,
                            color: t.palette.mode === "dark" ? t.palette.common.white : BRAND.gray,
                            textAlign: "center",
                        })}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={(t) => ({
                            color: t.palette.mode === "dark" ? t.palette.text.secondary : BRAND.gray,
                            opacity: t.palette.mode === "dark" ? 1 : 0.9,
                            textAlign: "center",
                        })}
                    >
                        {message}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, py: 1.5 }} onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <Box
                                key={i}
                                component="input"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="tel"
                                value={d}
                                ref={refs[i]}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                aria-label={`Digit ${i + 1}`}
                                maxLength={1}
                                sx={(t) => ({
                                    width: 48,
                                    height: 56,
                                    textAlign: "center",
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: t.palette.mode === "dark" ? t.palette.common.white : BRAND.gray,
                                    bgcolor: "transparent",
                                    outline: "none",
                                    border: "0",
                                    borderBottom: "2px solid",
                                    borderColor:
                                        t.palette.mode === "dark"
                                            ? t.palette.grey[700]
                                            : t.palette.grey[300],
                                    "&:focus": {
                                        borderColor: BRAND.teal,
                                    },
                                    // remove number spinner on some browsers
                                    MozAppearance: "textfield",
                                    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                        WebkitAppearance: "none",
                                        margin: 0,
                                    },
                                })}
                            />
                        ))}
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{ height: 24, color: BRAND.error, textAlign: "center", pt: 0.5 }}
                    >
                        {error || " "}
                    </Typography>

                    <Stack spacing={1.5} sx={{ width: "100%", pt: 1 }}>
                        <Button
                            fullWidth
                            disabled={loading}
                            onClick={submit}
                            sx={{
                                height: 48,
                                color: "#fff",
                                fontWeight: 800,
                                textTransform: "none",
                                bgcolor: BRAND.teal,
                                "&:hover": { bgcolor: BRAND.teal, opacity: 0.9 },
                                borderRadius: 2,
                            }}
                        >
                            {loading ? "Unlocking..." : "Unlock"}
                        </Button>
                        <Button
                            disabled={cancelDisabled || loading}
                            fullWidth
                            variant="text"
                            onClick={onCancel}
                            sx={(t) => ({
                                height: 48,
                                fontWeight: 800,
                                textTransform: "none",
                                color: t.palette.mode === "dark" ? t.palette.text.secondary : BRAND.gray,
                                borderRadius: 2,
                                "&:hover": {
                                    bgcolor:
                                        t.palette.mode === "dark" ? "rgba(100,116,139,0.5)" : "rgba(226,232,240,0.5)",
                                },
                            })}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}