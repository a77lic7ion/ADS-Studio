
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio } from "../types";

export class GeminiService {
  /**
   * Generates a logo concept
   */
  async generateLogo(description: string, industry: string, style: string): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Create a professional logo for: ${description}. Industry: ${industry}. Style: ${style}. 
      High-end vector mark, centered, clean background, minimal details, premium brand identity.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      // Iterating through parts to find the image part as per nano banana series guidelines
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
   * Generates a structured blueprint from provided text or context
   */
  async generateBlueprintFromData(source: string, designStyle: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a senior product architect. Analyze the following data/context: "${source}".
      Design a comprehensive Blueprint Mind Map in the "${designStyle}" style.
      The style is inspired by organic development workflows with curved connections.
      Return a JSON object with:
      nodes: array of { id, title, color (HEX), x (0-1000), y (0-1000), points (array of sub-details) }.
      Ensure nodes are well-spaced and logically connected to a central "Core" node.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
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
      
      // Safely access .text property and parse JSON
      const text = response.text;
      return text ? JSON.parse(text) : null;
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
        contents: { parts: [{ text: `Commercial marketing visual for: ${prompt}. High-quality photography, clean space for text, premium advertising lighting.` }] },
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
        contents: `Refine this ${context} copy for maximum impact: "${text}". Keep it concise and bold.`
      });
      // Correct property access for response.text
      return response.text?.trim() || text;
    } catch (error) {
      return text;
    }
  }
}

export const gemini = new GeminiService();
