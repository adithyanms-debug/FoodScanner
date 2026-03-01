import { getModel, parseGeminiJSON } from '../geminiClient';
import { ScanResult } from '../../types';

export const analyzeProductPhoto = async (base64Image: string): Promise<Partial<ScanResult>> => {
    const model = getModel(0.3);

    const prompt = `
    Analyze this food product photo. Identify the product, estimate health score, and flags.
    Return ONLY a raw JSON object with this exact structure:
    {
      "productName": "string",
      "brand": "string",
      "healthScore": number,
      "processingLevel": "Unprocessed" | "Processed" | "Ultra-Processed" | "Unknown",
      "greenFlags": ["string"],
      "redFlags": ["string"],
      "confidenceScore": number
    }
    No markdown formatting, just the raw JSON.
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
