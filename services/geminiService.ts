import { GoogleGenAI, Type } from "@google/genai";
import { TimeData, AdviceResponse } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    // We allow the app to run without API key for visualization, but advice won't work.
    // In a real app, we might throw or show a specific error UI.
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductivityAdvice = async (data: TimeData): Promise<AdviceResponse> => {
  const client = getClient();
  if (!client) {
    return {
      analysis: "API Key missing. Please configure your environment.",
      tips: ["Configure API Key"],
      score: 0
    };
  }

  const prompt = `
    Act as a world-class productivity expert and behavioral psychologist. 
    Analyze the following daily time expenditure for a user who has ${data.totalAvailable} waking hours:
    - Social Media usage: ${data.socialMedia} hours
    - Procrastination/Idleness: ${data.procrastination} hours
    - Fear/Hesitation/Overthinking: ${data.fear} hours
    
    The remaining time is what they actually spend on their Goals.
    
    Provide a harsh but fair analysis of their "Time Leaks". 
    Give a productivity score from 0 to 100 based on efficiency.
    Provide 3 specific, actionable, high-impact tips to stop these leaks immediately.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            score: { type: Type.INTEGER },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["analysis", "score", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text) as AdviceResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      analysis: "Failed to generate advice. Please try again.",
      tips: ["Check internet connection", "Verify API usage limits"],
      score: 0
    };
  }
};