import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, InputBase, Box, Typography
} from '@mui/material';

/**
 * Reusable passcode dialog component
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onConfirm - Callback when passcode is confirmed, receives (code)
 * @param {function} onCancel - Callback when user cancels (optional)
 * @param {string} title - Dialog title (default: "Enter Passcode")
 * @param {string} description - Dialog description
 * @param {boolean} disableCancel - Hide cancel button (default: false)
 */
export default function PasscodeDialog({
    open,
    onConfirm,
    onCancel,
    title = "Enter Passcode",
    description = "Enter your 4-digit code to unlock your history.",
    disableCancel = false
}) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        const code = value.trim();
        if (code.length !== 4) {
            setError('Please enter a valid 4-digit code');
            return;
        }
        onConfirm(code);
        // Reset state after confirm
        setValue('');
        setError('');
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        // Reset state
        setValue('');
        setError('');
    };

    const handleChange = (e) => {
        const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
        setValue(newValue);
        setError('');
    };

    return (
        <Dialog open={open} disableEscapeKeyDown={disableCancel}>
            <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 1 }}>
                    {description}
                </DialogContentText>
                <InputBase
                    autoFocus
                    fullWidth
                    placeholder="••••"
                    inputMode="numeric"
                    pattern="\\d{4}"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && value.length === 4) {
                            handleConfirm();
                        }
                    }}
                    sx={{
                        border: 1,
                        borderColor: error ? 'error.main' : 'divider',
                        px: 2,
                        py: 1.25,
                        borderRadius: 2,
                        fontSize: '1.25rem',
                        letterSpacing: '0.4em'
                    }}
                />
                {error && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                {!disableCancel && (
                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                )}
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={value.length !== 4}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
