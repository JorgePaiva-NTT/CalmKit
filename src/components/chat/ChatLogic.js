import { useState } from "react";
import { sendMessageToServer } from "./ChatService";

export const useChatLogic = (selectedLog) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text, token) => {
    const historyForAPI = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const newMessage = { text, sender: "user" }; // For UI display
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    const logContext = selectedLog && messages.length === 0 ? selectedLog : null;

    console.log("Sending message to server:", text, historyForAPI, logContext, token);
    try {
      const response = await sendMessageToServer(text, historyForAPI, token, logContext);
      if (response && response.text) {
        const botMessage = { text: response.text, sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        text: "Sorry, something went wrong.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, handleSendMessage };
};
