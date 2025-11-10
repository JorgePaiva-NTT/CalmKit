import { Post } from "../../utils/http";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const sendMessageToServer = async (message, history, token) => {
  try {
    const response = await Post(`${API_URL}/chat`, { message, history }, token);
    return response;
  } catch (error) {
    console.error("Error sending message to AI backend:", error);
    throw error;
  }
};
