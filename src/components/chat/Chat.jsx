import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChatLogic } from './ChatLogic';
import { CircularProgress, Box, Paper, keyframes, Avatar } from '@mui/material';
import { useAuthState } from '../../context/AuthContext';
import PsychologyIcon from '@mui/icons-material/Psychology';

const dotPulse = keyframes`
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
`;

const ThinkingAnimation = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      mb: 1,
      gap: 1,
    }}
  >
    <Avatar
      sx={{
        width: 36,
        height: 36,
        bgcolor: 'primary.main',
        flexShrink: 0,
      }}
      src="/ai-avatar.png" // Placeholder for future image
      alt="AI Coach"
    >
      <PsychologyIcon sx={{ fontSize: 20 }} />
    </Avatar>
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: 'background.paper',
        display: 'flex',
        gap: 0.75,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'text.secondary',
            animation: `${dotPulse} 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </Paper>
  </Box>
);

const Chat = () => {
  const { token } = useAuthState();
  const { messages, isLoading, handleSendMessage } = useChatLogic();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pt: 2, px: 2 }}>
        <ChatHistory messages={messages} />
        {isLoading && <ThinkingAnimation />}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <ChatInput onSendMessage={t => handleSendMessage(t, token)} disabled={isLoading} showPrompts={messages.length === 0} />
      </Box>
    </Box>
  );
};

export default Chat;
