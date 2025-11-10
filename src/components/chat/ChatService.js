import { makeAIRequest } from '../../utils/ai-request';

export const sendMessageToServer = async (message) => {
  try {
    const response = await makeAIRequest(message);
    return response.data;
  } catch (error) {
    console.error('Error sending message to AI backend:', error);
    throw error;
  }
};
