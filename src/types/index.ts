export interface UserProfile {
    allergies: string[];
    calorieTarget: number;
    dietType: 'Balanced' | 'Low Carb' | 'High Protein' | 'Vegan';
}

export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
}

export interface ScanResult {
    id: string; // usually barcode or random uuid
    barcode?: string;
    timestamp: string; // ISO date
    type: 'barcode' | 'label' | 'product';
    productName: string;
    brand: string;
    nutrition: NutritionInfo;
    ingredients: string[];
    allergens: string[];
    healthScore: number;
    processingLevel: 'Unprocessed' | 'Processed' | 'Ultra-Processed' | 'Unknown';
    greenFlags: string[];
    redFlags: string[];
    confidenceScore: number;
    imageUrl?: string;
}

export interface IngredientExplanation {
    name: string;
    explanation: string;
    safetyLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface AlternativeProduct {
    name: string;
    brand: string;
    score: number;
    reason: string;
    allergySafe: boolean;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}
