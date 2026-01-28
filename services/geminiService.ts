
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, BrandIdentity } from "../types";

export class GeminiService {
  /**
   * Generates a logo concept using brand identity
   */
  async generateLogo(description: string, industry: string, style: string, brand?: BrandIdentity | null): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const brandContext = brand ? `Brand Name: ${brand.name}. Colors: ${brand.colors}. Industry: ${brand.industry}.` : '';
      const prompt = `Create a professional logo for: ${description}. ${brandContext} Style: ${style}. 
      High-end vector mark, centered, clean background, minimal details, premium brand identity. Ensure colors align with ${brand?.colors || 'the provided description'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
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
   * Generates a structured blueprint from provided text or context
   */
  async generateBlueprintFromData(source: string, designStyle: string, brand?: BrandIdentity | null) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const brandContext = brand ? `The company is ${brand.name} in the ${brand.industry} space.` : '';
      
      const prompt = `Act as a senior information designer. ${brandContext} Analyze this data: "${source}".
      Design a professional Infographic Blueprint in the "${designStyle}" style.
      
      If the style is "Process Flow", organize nodes vertically: 
      - Top section: INPUT (id: input_1, input_2...)
      - Middle section: THE ENGINE (id: engine_core)
      - Bottom section: OUTPUT (id: output_1, output_2...)
      
      Otherwise, use a standard layout.
      
      Return a JSON object with:
      nodes: array of { id, title, color (HEX), x (0-1000), y (0-1000), points (array of sub-details), icon (Material Symbols name) }.
      Ensure nodes are logically connected.
      X/Y should be strictly:
      - INPUTS: Y=150, X spaced out.
      - ENGINE: Y=450, X=500.
      - OUTPUTS: Y=750, X spaced out.`;

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
                    icon: { type: Type.STRING },
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
      
      const text = response.text;
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("Blueprint generation failed", error);
      return null;
    }
  }

  /**
   * Generates a high-quality visual asset for flyers/ads
   */
  async generateVisualAsset(
    prompt: string, 
    aspectRatio: AspectRatio = "16:9", 
    style: string = "Modern", 
    brand?: BrandIdentity | null,
    referenceImage?: { data: string, mimeType: string }
  ): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const brandInfo = brand ? `For ${brand.name} (${brand.industry}). Brand colors: ${brand.colors}.` : '';
      
      const parts: any[] = [
        { text: `High-quality commercial advertising background for: ${prompt}. ${brandInfo} Style: ${style}. Clean composition, copy space for text, premium studio lighting. No text in image.` }
      ];

      if (referenceImage) {
        parts.push({
          inlineData: {
            data: referenceImage.data,
            mimeType: referenceImage.mimeType
          }
        });
        parts[0].text = `Commercial visual inspired by the style of the attached image. Subject: ${prompt}. ${brandInfo} Aesthetic: ${style}. Professional look for ${aspectRatio} format.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
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
      return response.text?.trim() || text;
    } catch (error) {
      return text;
    }
  }
}

export const gemini = new GeminiService();
