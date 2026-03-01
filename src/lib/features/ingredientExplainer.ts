import { getModel, parseGeminiJSON } from '../geminiClient';
import { IngredientExplanation } from '../../types';

export const explainIngredients = async (ingredients: string[]): Promise<IngredientExplanation[]> => {
    const model = getModel(0.1);

    const prompt = `
    Explain the following food ingredients in plain English and assess their safety.
    Ingredients list: ${ingredients.join(', ')}
    
    Return ONLY a JSON array with an object for EACH ingredient following this exact structure:
    [
      {
        "name": "ingredient name",
        "explanation": "1 short sentence explaining what it is and its purpose",
        "safetyLevel": "none" | "low" | "medium" | "high"
      }
    ]
    No markdown formatting, just the raw JSON array. Make sure the JSON is valid.
  `;

    const result = await model.generateContent(prompt);
    return parseGeminiJSON<IngredientExplanation[]>(result.response.text());
};
