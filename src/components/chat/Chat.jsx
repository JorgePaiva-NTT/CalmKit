import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChatLogic } from './ChatLogic';
import { CircularProgress, Box } from '@mui/material';
import { useAuthState } from '../../context/AuthContext';

const Chat = () => {
  const { token } = useAuthState();
  const { messages, isLoading, handleSendMessage } = useChatLogic();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pt: 2, px: 2 }}>
        <ChatHistory messages={messages} />
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <ChatInput onSendMessage={t => handleSendMessage(t, token)} disabled={isLoading} />
      </Box>
    </Box>
  );
};

export default Chat;
