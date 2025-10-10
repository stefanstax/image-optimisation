
import { GoogleGenAI, Type } from "@google/genai";
import type { ImageText } from '../types';

// FIX: Per coding guidelines, assume API_KEY is set in the environment and initialize client directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateImageText(base64Image: string, mimeType: string, language: string): Promise<ImageText> {
  try {
    const model = 'gemini-2.5-flash';
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `Analyze the image and generate two distinct pieces of text in ${language}: 1. A descriptive alt text for accessibility. 2. A short, simple, and engaging title as a plain sentence. The title should be different from the alt text.`,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    altText: {
                        type: Type.STRING,
                        description: "A concise and descriptive alt text for accessibility. It should not include phrases like 'image of' or 'picture of'.",
                    },
                    title: {
                        type: Type.STRING,
                        description: "A short, engaging title for the image as a plain sentence (e.g., 'A busy day in London'). This should be different from the alt text and not contain underscores or dashes.",
                    },
                },
                required: ["altText", "title"],
            },
        },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as ImageText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate image text from Gemini API.");
  }
}
