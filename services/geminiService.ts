
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateCourseOutline(topic: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional course outline for the topic: "${topic}". Provide a title, description, and list of modules.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              modules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    lessons: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            required: ["title", "description", "modules"]
          }
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }

  async getLearningAssistant(message: string, context?: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { text: `You are an expert learning assistant for an LMS. Context: ${context || 'General learning'}` },
          { text: message }
        ],
        config: {
          temperature: 0.7,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Assistant Error:", error);
      return "I'm sorry, I'm having trouble connecting to my brain right now.";
    }
  }
}

export const geminiService = new GeminiService();
