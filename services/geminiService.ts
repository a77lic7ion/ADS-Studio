import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, BrandIdentity } from "../types";

export class GeminiService {
  /**
   * Generates a complete logo system with 4 variations.
   * Processes sequentially to avoid hitting rate limits.
   */
  async generateLogoSystem(description: string, industry: string, style: string, brand?: BrandIdentity | null): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const brandContext = brand ? `Brand Name: ${brand.name}. Colors: ${brand.colors}. Industry: ${brand.industry}.` : '';
    
    const prompts = [
      `Main Mark: ${description}. ${brandContext} Style: ${style}. Professional vector logo, high-end centered composition.`,
      `Glyph Pack: A simplified, minimalist geometric icon or symbol extracted from the ${description} brand concept. Single bold shape.`,
      `Monochrome: A strictly black-and-white (stencil style) version of the ${description} logo. High contrast, clean outlines.`,
      `Export Asset (Alternative): A modern, dynamic secondary composition of the ${description} mark. Perhaps offset or containing a unique brand detail.`
    ];

    const results: string[] = [];

    for (const p of prompts) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `${p} Clean solid background, professional graphic design, no realistic photos, vector aesthetic.` }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              results.push(`data:image/png;base64,${part.inlineData.data}`);
              break; 
            }
          }
        }
        if (results.length < prompts.length) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error: any) {
        console.warn(`Variation generation failed`, error);
        if (error?.message?.includes('429')) {
          if (results.length > 0) return results;
          throw error;
        }
      }
    }
    return results;
  }

  async generateBlueprintFromData(source: string, designStyle: string, brand?: BrandIdentity | null) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const brandContext = brand ? `The company is ${brand.name} in the ${brand.industry} space.` : '';
      
      const prompt = `Act as a senior data designer. ${brandContext} Analyze: "${source}".
      Design a professional Infographic Blueprint in the "${designStyle}" style.
      
      Return a JSON object with:
      nodes: array of { id, title, color (HEX), x (0-1000), y (0-1000), points (array), icon (Material Symbol) }.
      
      Layout constraints for X/Y (0-1000):
      - If 'Process Flow' or 'Corporate Data Visualization': Top/Mid/Bottom tiers.
      - If 'Minimalist Geometric' or 'Abstract Infographic': Centered cluster or circular flow.
      - If 'Hand-Drawn Organic': Slightly jittered/offset positions.`;

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
      
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("Blueprint generation failed", error);
      return null;
    }
  }

  async generateVisualAsset(
    prompt: string, 
    aspectRatio: AspectRatio = "16:9", 
    style: string = "Modern", 
    brand?: BrandIdentity | null,
    referenceImage?: { data: string, mimeType: string }
  ): Promise<string | undefined> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const brandInfo = brand ? `For ${brand.name}. Industry: ${brand.industry}. Primary Colors: ${brand.colors}.` : '';
    
    const parts: any[] = [
      { text: `Advertising background: ${prompt}. ${brandInfo} Style: ${style}. High-end commercial look, clean copy space.` }
    ];

    if (referenceImage) {
      parts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: { imageConfig: { aspectRatio } }
    });

    return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data 
      ? `data:image/png;base64,${response.candidates[0].content.parts.find(p => p.inlineData)!.inlineData!.data}` 
      : undefined;
  }

  async refineText(text: string, context: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this copy: "${text}". Context: ${context}. Make it punchy and bold.`
    });
    return response.text.trim();
  }
}

export const gemini = new GeminiService();