import { Post } from "../../src/utils/http";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const makeAIRequest = async (message, history, token) => {
  try {
    const res = await Post(`${API_URL}/chat`, { message, history }, token);
    return { data: res };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};
