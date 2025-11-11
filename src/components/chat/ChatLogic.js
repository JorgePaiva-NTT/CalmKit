import { useState } from "react";
import { sendMessageToServer } from "./ChatService";

export const useChatLogic = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text, token) => {
    // The history sent to the API should be in the { role, parts } format.
    const historyForAPI = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const newMessage = { text, sender: "user" }; // For UI display
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsLoading(true);

    console.log("Sending message to server:", text, historyForAPI, token);
    try {
      const response = await sendMessageToServer(text, historyForAPI, token);
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
