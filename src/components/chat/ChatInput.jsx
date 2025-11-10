import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    // Send message on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault(); // Prevents adding a new line
      handleSendClick();
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      p: 1,
      backgroundColor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider'
    }}>
      <TextField
        fullWidth
        multiline
        maxRows={5}
        variant="outlined"
        placeholder="Message CalmKit..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
          },
        }}
      />
      <IconButton color="primary" onClick={handleSendClick} disabled={disabled || !inputValue.trim()} sx={{ ml: 1 }}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInput;
