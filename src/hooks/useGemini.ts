import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { scanNutritionLabel } from '../lib/features/nutritionScanner';
import { analyzeProductPhoto } from '../lib/features/photoAnalyzer';
import { findHealthierAlternatives } from '../lib/features/alternativesFinder';
import { explainIngredients } from '../lib/features/ingredientExplainer';
import { chatWithAssistant } from '../lib/features/chatAssistant';
import { lookupBarcode } from '../lib/features/barcodeLookup';
import { useState } from 'react';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries) throw error;
            await delay(Math.pow(2, i) * 1000); // 1s, 2s, 4s... backoff
        }
    }
    throw new Error("Failed after retries");
};

export const useGemini = () => {
    const [isRateLimited, setIsRateLimited] = useState(false);

    const startRateLimit = () => {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 2000);
    };

    const handleAction = async <T>(action: () => Promise<T>, errorMessage: string): Promise<T> => {
        if (isRateLimited) {
            toast.error('Please wait a moment before trying again');
            throw new Error('Rate limited');
        }
        startRateLimit();
        try {
            return await withRetry(action);
        } catch (error) {
            console.error(error);
            toast.error(errorMessage);
            throw error;
        }
    };

    const scanLabelMutation = useMutation({
        mutationFn: (base64: string) => handleAction(() => scanNutritionLabel(base64), 'Failed to scan nutrition label')
    });

    const analyzePhotoMutation = useMutation({
        mutationFn: (base64: string) => handleAction(() => analyzeProductPhoto(base64), 'Failed to analyze product photo')
    });

    const getAlternativesMutation = useMutation({
        mutationFn: ({ productName, profile }: { productName: string, profile: any }) =>
            handleAction(() => findHealthierAlternatives(productName, profile), 'Failed to find alternatives')
    });

    const explainIngredientsMutation = useMutation({
        mutationFn: (ingredients: string[]) =>
            handleAction(() => explainIngredients(ingredients), 'Failed to explain ingredients')
    });

    const chatMutation = useMutation({
        mutationFn: ({ messages, product }: { messages: any[], product: any }) =>
            handleAction(() => chatWithAssistant(messages, product), 'Failed to send message')
    });

    const lookupBarcodeMutation = useMutation({
        mutationFn: (barcode: string) =>
            handleAction(() => lookupBarcode(barcode), 'Failed to look up barcode')
    });

    return {
        isRateLimited,
        scanLabel: scanLabelMutation,
        analyzePhoto: analyzePhotoMutation,
        getAlternatives: getAlternativesMutation,
        explainIngredients: explainIngredientsMutation,
        chatAssistant: chatMutation,
        lookupBarcode: lookupBarcodeMutation,
    };
};
