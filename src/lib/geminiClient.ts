import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY is not set in environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

export const getModel = (temperature: number = 0.1) => {
    return genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature,
        }
    });
};

export const stripMarkdown = (text: string) => {
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return cleanText.trim();
};

export const parseGeminiJSON = <T>(text: string): T => {
    try {
        return JSON.parse(stripMarkdown(text)) as T;
    } catch (error) {
        console.error('Failed to parse Gemini output:', text, error);
        throw new Error('Invalid JSON format received from AI');
    }
};
