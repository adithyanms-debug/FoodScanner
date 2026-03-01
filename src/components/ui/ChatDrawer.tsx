import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot } from 'lucide-react';

import { useGemini } from '../../hooks/useGemini';
import { ScanResult, ChatMessage } from '../../types';
import { cn } from '../../lib/utils';

import { ClayButton } from './ClayButton';

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    contextProduct?: ScanResult | null;
}

const SUGGESTIONS = [
    "Is this keto friendly?",
    "What is the main allergen?",
    "Is the sugar content high?",
    "Any artificial colors?"
];

export const ChatDrawer = ({ isOpen, onClose, contextProduct }: ChatDrawerProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: "Hi! I'm your nutrition assistant. Ask me anything about this product or diet in general." }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { chatAssistant } = useGemini();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Reset chat if context changes significantly
    useEffect(() => {
        if (contextProduct) {
            setMessages([
                { id: Date.now().toString(), role: 'assistant', content: `I see you're looking at ${contextProduct.productName}. What would you like to know about it?` }
            ]);
        }
    }, [contextProduct?.id]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: text.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const response = await chatAssistant.mutateAsync({
                messages: [...messages, userMessage],
                product: contextProduct
            });

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I had trouble connecting. Please try again."
            }]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 h-[85vh] bg-background rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 flex flex-col"
                    >
                        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-poppins font-semibold text-lg">Nutrition AI</h3>
                                    {contextProduct && <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">Context: {contextProduct.productName}</p>}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[80%] p-4 rounded-2xl relative",
                                        msg.role === 'user'
                                            ? "bg-accent text-white rounded-br-sm shadow-[4px_4px_10px_rgba(108,99,255,0.2)]"
                                            : "bg-white text-gray-800 rounded-bl-sm shadow-clay-card"
                                    )}>
                                        <p className="text-sm font-inter leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {chatAssistant.isPending && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-clay-card flex gap-1 items-center h-12">
                                        <motion.div className="w-2 h-2 rounded-full bg-gray-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                                        <motion.div className="w-2 h-2 rounded-full bg-gray-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                        <motion.div className="w-2 h-2 rounded-full bg-gray-400" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-background/80 backdrop-blur-md">
                            {messages.length < 3 && !chatAssistant.isPending && (
                                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                                    {SUGGESTIONS.map((sug) => (
                                        <button
                                            key={sug}
                                            onClick={() => handleSend(sug)}
                                            className="whitespace-nowrap px-4 py-2 bg-white rounded-full text-xs font-medium text-accent border border-accent/20 shadow-sm"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                                    placeholder="Ask about nutrition..."
                                    className="flex-1 clay-input"
                                    disabled={chatAssistant.isPending}
                                />
                                <ClayButton
                                    onClick={() => handleSend(input)}
                                    disabled={!input.trim() || chatAssistant.isPending}
                                    className="px-4 !rounded-[12px] bg-accent text-white"
                                >
                                    <Send size={20} />
                                </ClayButton>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
