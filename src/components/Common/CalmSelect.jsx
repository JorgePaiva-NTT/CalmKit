import { Select, MenuItem } from "@mui/material";

const CalmSelect = ({ options, value, onChange, size = 'small', disabled = false, sx = {} }) => {
    const handleChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = options.find(opt => opt.value === selectedValue);
        if (selectedOption && onChange) {
            onChange(selectedOption);
        }
    };

    return (
        <Select
            value={value}
            onChange={handleChange}
            size={size}
            disabled={disabled}
            sx={{
                flex: 1,
                fontSize: '0.875rem',
                borderRadius: '1.25rem',
                backgroundColor: 'action.hover',
                '&:hover': { backgroundColor: 'action.hover' },
                ...sx,
            }}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    );
};

export default CalmSelect;