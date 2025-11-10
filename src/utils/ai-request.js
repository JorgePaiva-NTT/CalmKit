import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chat = model.startChat();

export const makeAIRequest = async (message) => {
  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    return { data: { text } };
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    throw error;
  }
};
