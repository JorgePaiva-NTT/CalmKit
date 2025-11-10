import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const ChatMessage = ({ message }) => {
  const { text, sender } = message;
  const isUser = sender === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 1,
          backgroundColor: isUser ? 'primary.main' : 'grey.300',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          maxWidth: '80%',
        }}
      >
        <Typography variant="body1">{text}</Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;
