import { getModel, parseGeminiJSON } from '../geminiClient';
import { AlternativeProduct, UserProfile } from '../../types';

export const findHealthierAlternatives = async (
    productName: string,
    userProfile: UserProfile
): Promise<AlternativeProduct[]> => {
    const model = getModel(0.7);

    const prompt = `
    Provide 4 healthier or safer food alternatives to "${productName}".
    Consider the user's profile:
    - Target calories: ${userProfile.calorieTarget}
    - Diet type: ${userProfile.dietType}
    - Allergies to avoid strictly: ${userProfile.allergies.join(', ')}

    Return ONLY a JSON array with exactly 4 objects following this structure:
    [
      {
        "name": "string",
        "brand": "string",
        "score": number,
        "reason": "short explanation of why it's better",
        "allergySafe": boolean
      }
    ]
    No markdown formatting, just the raw JSON array.
  `;

    const result = await model.generateContent(prompt);
    return parseGeminiJSON<AlternativeProduct[]>(result.response.text());
};
