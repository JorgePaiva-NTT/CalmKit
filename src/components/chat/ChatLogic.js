import { useState } from 'react';
import { sendMessageToServer } from './ChatService';

export const useChatLogic = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text) => {
    const newMessage = { text, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageToServer(text);
      const botMessage = { text: response.text, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { text: 'Sorry, something went wrong.', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSendMessage };
};
