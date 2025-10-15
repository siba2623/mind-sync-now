import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Missing Gemini API key in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
});

export const generateInsight = async (userData: any) => {
  const prompt = `Based on the following user data, provide a compassionate, personalized mental health insight and one suggested activity. 
  User data: ${JSON.stringify(userData)}
  Keep the response under 150 words. Focus on patterns and gentle suggestions.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating insight:', error);
    return "I'm here to support you. Remember to take a moment for yourself today.";
  }
};