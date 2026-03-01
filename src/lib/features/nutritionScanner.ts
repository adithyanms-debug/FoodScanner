import { getModel, parseGeminiJSON } from '../geminiClient';
import { ScanResult } from '../../types';

export const scanNutritionLabel = async (base64Image: string): Promise<Partial<ScanResult>> => {
    const model = getModel(0.1);

    const prompt = `
    Analyze this food nutrition label. Extract all the nutrition data, ingredients, and allergens.
    Return ONLY a raw JSON object with this exact structure:
    {
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      },
      "ingredients": ["string"],
      "allergens": ["string"],
      "confidenceScore": number
    }
    No markdown formatting, just the raw JSON. The confidenceScore should be 0-100 indicating your confidence in extraction.
  `;

    const imagePart = {
        inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType: "image/jpeg"
        }
    };

    const result = await model.generateContent([prompt, imagePart]);
    return parseGeminiJSON<Partial<ScanResult>>(result.response.text());
};
