import React, { useState } from 'react';
import { Box, TextField, IconButton, Chip, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ onSendMessage, disabled, showPrompts }) => {
  const [inputValue, setInputValue] = useState('');

  const prompts = [
    "I'm feeling anxious, what can I do?",
    "Suggest a quick mindfulness exercise.",
    "I had a stressful day.",
    "Help me reframe a negative thought.",
  ];

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
      p: 2,
    }}>
      {showPrompts && (
        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
          {prompts.map((prompt) => (
            <Chip
              key={prompt}
              label={prompt}
              onClick={() => onSendMessage(prompt)}
              variant="outlined"
              sx={{
                m: 0, // override default margin if any
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            />
          ))}
        </Stack>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>

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
    </Box>
  );
};

export default ChatInput;
