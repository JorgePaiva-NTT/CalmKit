import React from 'react';
import { Box, Paper, Typography, Avatar } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import PsychologyIcon from '@mui/icons-material/Psychology';

const ChatMessage = ({ message }) => {
  const { text, sender } = message;
  const isUser = sender === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        mb: 1,
        gap: 1,
      }}
    >
      {!isUser && (
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
      )}
      <Paper
        elevation={3}
        sx={{
          p: 1,
          backgroundColor: isUser ? 'primary.main' : 'background.paper',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          maxWidth: '80%',
          overflowX: 'auto', // For wide tables or code blocks
        }}
      >
        {isUser ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={materialDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </Paper>
    </Box>
  );
};

export default ChatMessage;
