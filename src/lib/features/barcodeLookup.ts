import { getModel, parseGeminiJSON } from '../geminiClient';
import { ScanResult } from '../../types';

export const lookupBarcode = async (barcode: string): Promise<Partial<ScanResult>> => {
  const model = getModel(0.1);

  const prompt = `
    You are a global food product barcode database. I will give you a barcode number, and you must identify the EXACT product it belongs to.

    BARCODE: ${barcode}

    IMPORTANT RULES:
    - The barcode "${barcode}" corresponds to ONE specific product. Identify it precisely.
    - Barcodes starting with 890 are Indian products (EAN-13 format).
    - Barcodes starting with 00-09 are US/Canada products (UPC-A format).
    - Barcodes starting with 50 are UK products.
    - Barcodes starting with 49 are Japanese products.
    - DO NOT guess a random product. If you truly cannot identify the barcode, set confidenceScore to 0 and productName to "Unknown Product".
    
    Here are some well-known barcodes for reference:
    - 8901030793950 = Maggi 2-Minute Masala Noodles by Nestle
    - 8901491101349 = Parle-G Gold Biscuits by Parle
    - 8901725133566 = Amul Butter by Amul
    - 8902519002331 = Haldiram's Aloo Bhujia by Haldiram's
    - 8901262150309 = Britannia Good Day Cookies by Britannia
    - 0049000006346 = Coca-Cola Classic by The Coca-Cola Company
    - 0028400064057 = Doritos Nacho Cheese by Frito-Lay
    - 0044000032159 = Oreo Chocolate Sandwich Cookies by Nabisco
    - 5000159459228 = Cadbury Dairy Milk by Cadbury

    Return ONLY a raw JSON object with this exact structure (no markdown):
    {
      "productName": "string (exact product name)",
      "brand": "string (manufacturer/brand name)",
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      },
      "ingredients": ["string (list each key ingredient)"],
      "allergens": ["string (list allergens like Wheat, Milk, Soy, etc.)"],
      "healthScore": number (0-100, higher is healthier),
      "processingLevel": "Unprocessed" | "Processed" | "Ultra-Processed" | "Unknown",
      "greenFlags": ["string (positive nutritional aspects)"],
      "redFlags": ["string (negative nutritional aspects)"],
      "confidenceScore": number (0-100)
    }
  `;

  const result = await model.generateContent(prompt);
  return parseGeminiJSON<Partial<ScanResult>>(result.response.text());
};
