import React from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChatLogic } from './ChatLogic';
import { CircularProgress, Box } from '@mui/material';

const Chat = () => {
  const { messages, isLoading, handleSendMessage } = useChatLogic();

  return (
    <div>
      <h1>Chat</h1>
      <ChatHistory messages={messages} />
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;
