import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const ChatHistory = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Only scroll to bottom if the last message is from the user.
    if (lastMessage && lastMessage.sender === 'user') {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div>
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatHistory;
