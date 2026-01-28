
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AspectRatio, BrandIdentity } from "../types";

export class GeminiService {
  /**
   * Generates a complete logo system with 4 variations
   */
  async generateLogoSystem(description: string, industry: string, style: string, brand?: BrandIdentity | null): Promise<string[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const brandContext = brand ? `Brand Name: ${brand.name}. Colors: ${brand.colors}. Industry: ${brand.industry}.` : '';
      
      const prompts = [
        `Primary Logo: ${description}. ${brandContext} Style: ${style}. Professional vector mark, high-end centered composition.`,
        `Minimal Glyph: Simplified icon-only version of the ${description} logo. High contrast, bold geometric shapes.`,
        `Monochrome: Black and white version of the ${description} logo. Professional stencil/stamp look.`,
        `Alternative Composition: Modern layout variation of the ${description} logo. Dynamic spacing, premium aesthetic.`
      ];

      const results: string[] = [];

      // We call them in parallel for speed
      const promises = prompts.map(async (p) => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `${p} High-end brand identity, clean background, no realistic photos, pure vector-style graphic.` }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
        return null;
      });

      const images = await Promise.all(promises);
      return images.filter((img): img is string => img !== null);
    } catch (error) {
      console.error("Logo system generation failed", error);
      throw error;
    }
  }

  async generateLogo(description: string, industry: string, style: string, brand?: BrandIdentity | null): Promise<string | undefined> {
    const systems = await this.generateLogoSystem(description, industry, style, brand);
    return systems[0];
  }

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
      if (!text) return null;
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
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
