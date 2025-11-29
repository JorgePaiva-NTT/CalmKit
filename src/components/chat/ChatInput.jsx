import React, { useState } from 'react';
import { Box } from '@mui/material';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputActionMenu,
  PromptInputActionAddAttachments,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
} from './PromptInput';
import { Suggestions, Suggestion } from './Suggestions';

const ChatInput = ({ onSendMessage, disabled, showPrompts }) => {
  const [inputKey, setInputKey] = useState(0); // Force re-render to clear input on submit

  const prompts = [
    "I'm feeling anxious, what can I do?",
    "Suggest a quick mindfulness exercise.",
    "I had a stressful day.",
    "Help me reframe a negative thought.",
  ];

  const handleSubmit = ({ text, files }) => {
    if (text.trim() || files?.length > 0) {
      onSendMessage(text);
      setInputKey(prev => prev + 1);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {showPrompts && (
        <Box sx={{ mb: 1, pb: 2 }}>
          <Suggestions>
            {prompts.map((prompt) => (
              <Suggestion
                key={prompt}
                suggestion={prompt}
                onClick={() => onSendMessage(prompt)}
              />
            ))}
          </Suggestions>
        </Box>
      )}

      <PromptInput
        key={inputKey}
        onSubmit={handleSubmit}
        disabled={disabled}
        maxFiles={5}
        accept="image/*,application/pdf"
      >
        <PromptInputAttachments>
          {(file) => <PromptInputAttachment data={file} />}
        </PromptInputAttachments>

        <PromptInputBody>
          <PromptInputTextarea
            placeholder="Message CalmKit..."
            disabled={disabled}
          />
        </PromptInputBody>

        <PromptInputToolbar>

          <PromptInputSubmit disabled={disabled} />
        </PromptInputToolbar>
      </PromptInput>
    </Box>
  );
};

export default ChatInput;
