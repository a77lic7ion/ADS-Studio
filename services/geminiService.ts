
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio } from "../types";

export class GeminiService {
  /**
   * Generates a logo concept
   */
  async generateLogo(description: string, industry: string, style: string): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Enhanced prompt for better "Mark Engine" results
      const prompt = `Create a professional, high-resolution logo for a company. 
      Business: ${description}. 
      Industry: ${industry}. 
      Style: ${style}. 
      Ensure a clean, isolated subject on a solid neutral background. Modern vector aesthetic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      if (response.candidates) {
        for (const candidate of response.candidates) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      }
      return undefined;
    } catch (error) {
      console.error("Logo generation failed", error);
      throw error;
    }
  }

  /**
   * Generates a structured blueprint for workflows/processes
   */
  async generateBlueprint(topic: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a structured blueprint for "${topic}" similar to a mind map. 
        Return a JSON object with nodes. Each node has: id, title, color (hex), x (0-1000), y (0-1000), and points (array of strings). 
        Include a central 'Core' node at 500,500. Add 5-8 surrounding steps.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    color: { type: Type.STRING },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    points: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error("Blueprint generation failed", error);
      return null;
    }
  }

  async generateVisualAsset(prompt: string, aspectRatio: AspectRatio = "16:9"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `High-end professional photography/graphic for marketing. Theme: ${prompt}. Cinematic lighting, premium aesthetic.` }] },
        config: { imageConfig: { aspectRatio } }
      });

      if (response.candidates) {
        for (const candidate of response.candidates) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
      }
      return undefined;
    } catch (error) {
      console.error("Asset generation failed", error);
      throw error;
    }
  }

  async refineText(text: string, context: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a senior copywriter. Improve this ${context} text: "${text}". Make it punchy and professional. Return ONLY the refined text.`
      });
      return response.text?.trim() || text;
    } catch (error) {
      return text;
    }
  }
}

export const gemini = new GeminiService();
