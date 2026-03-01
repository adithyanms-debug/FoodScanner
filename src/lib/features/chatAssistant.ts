import { getModel } from '../geminiClient';
import { ScanResult, ChatMessage } from '../../types';

export const chatWithAssistant = async (
    messages: ChatMessage[],
    contextProduct?: ScanResult | null
): Promise<string> => {
    const model = getModel(0.7);

    let systemPrompt = `You are a helpful nutrition chat assistant.`;
    if (contextProduct) {
        systemPrompt += ` The user is viewing product "${contextProduct.productName}" by ${contextProduct.brand}. 
    Nutrition: ${JSON.stringify(contextProduct.nutrition)}.
    Ingredients: ${contextProduct.ingredients.join(', ')}.
    Answer questions based on this context briefly.`;
    }

    const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Understood." }] },
            ...history
        ]
    });

    const latestMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(latestMessage.content);
    return result.response.text();
};
