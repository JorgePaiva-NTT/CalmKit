import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import { useChatLogic } from './ChatLogic';
import { Box, Paper, keyframes, Avatar, Typography, Chip } from '@mui/material';
import { useAuthState } from '../../context/AuthContext';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

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
      src="../../assets/female_therapist.png"
      alt="AI Coach"
    />
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

const emotionColors = {
  'Angry': '#ef4444',
  'Anxious': '#a855f7',
  'Sad': '#3b82f6',
  'Neutral': '#6b7280',
  'Calm': '#22c55e',
  'Happy': '#eab308',
};

const Chat = ({ selectedLog }) => {
  const { token } = useAuthState();
  const { messages, isLoading, handleSendMessage } = useChatLogic(selectedLog);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pt: 2, px: 0 }}>
        {selectedLog && (
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '1rem',
              bgcolor: 'action.hover',
              borderLeft: `4px solid ${emotionColors[selectedLog.emotion] || '#9ca3af'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatBubbleOutlineIcon sx={{ color: 'primary.main', fontSize: '1.25rem' }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Discussing this log entry
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                label={selectedLog.emotion}
                size="small"
                sx={{
                  bgcolor: emotionColors[selectedLog.emotion] || '#9ca3af',
                  color: 'white',
                  fontWeight: '600',
                }}
              />
              <Chip
                label={`Intensity: ${selectedLog.intensity}/10`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={new Date(selectedLog.time).toLocaleDateString()}
                size="small"
                variant="outlined"
              />
            </Box>
            {selectedLog.trigger && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                <strong>Trigger:</strong> {selectedLog.trigger}
              </Typography>
            )}
          </Paper>
        )}
        <ChatHistory messages={messages} />
        {isLoading && <ThinkingAnimation />}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <ChatInput onSendMessage={t => handleSendMessage(t, token)} disabled={isLoading} showPrompts={messages.length === 0 && !selectedLog} />
      </Box>
    </Box>
  );
};

export default Chat;
