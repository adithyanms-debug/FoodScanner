import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Info, Check, AlertTriangle, XCircle, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useGemini } from '../hooks/useGemini';
import { ScanResult, IngredientExplanation, AlternativeProduct } from '../types';
import { cn } from '../lib/utils';
import { ClayCard } from '../components/ui/ClayCard';
import { ClayButton } from '../components/ui/ClayButton';
import { ValueScoreBadge } from '../components/ui/ValueScoreBadge';
import { AllergyBadge } from '../components/ui/AllergyBadge';
import { ToggleChart } from '../components/ui/ToggleChart';
import { ChatDrawer } from '../components/ui/ChatDrawer';
import { ChatButton } from '../components/ui/ChatButton';

export const ProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { history, profile } = useStore();
    const { explainIngredients, getAlternatives } = useGemini();

    const [product, setProduct] = useState<ScanResult | null>(null);
    const [explanations, setExplanations] = useState<IngredientExplanation[] | null>(null);
    const [alternatives, setAlternatives] = useState<AlternativeProduct[] | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const found = history.find(s => s.id === id);
        if (found) setProduct(found);
        else navigate('/'); // Fallback if not found
    }, [id, history, navigate]);

    const handleExplain = async () => {
        if (!product || product.ingredients.length === 0) return;
        try {
            const result = await explainIngredients.mutateAsync(product.ingredients);
            setExplanations(result);
        } catch (e) {
            // Error handled by hook
        }
    };

    const handleAlternatives = async () => {
        if (!product) return;
        try {
            const result = await getAlternatives.mutateAsync({ productName: product.productName, profile });
            setAlternatives(result);
        } catch (e) {
            // Error handled by hook
        }
    };

    if (!product) return <div className="min-h-screen bg-background" />; // Loading state

    // Cross-reference user allergies with product allergens
    const activeAllergens = product.allergens.filter(a => profile.allergies.includes(a));
    const isAllergySafe = activeAllergens.length === 0;

    return (
        <div className="min-h-screen pb-24 bg-background relative selection:bg-accent/20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100/50">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <span className="font-poppins font-semibold text-lg max-w-[200px] truncate">{product.productName}</span>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {/* Main Hero Card */}
                <motion.div layoutId={`product-${product.id}`}>
                    <ClayCard className="flex items-start gap-4">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.productName} className="w-24 h-24 object-cover rounded-2xl shadow-clay-card flex-shrink-0 bg-white" />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-2xl shadow-clay-inner flex items-center justify-center flex-shrink-0">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h1 className="font-poppins font-bold text-xl leading-tight text-gray-900 mb-1 line-clamp-2">{product.productName}</h1>
                            <p className="text-sm font-medium text-gray-500 mb-3">{product.brand}</p>

                            <div className="flex gap-2 flex-wrap text-xs">
                                <span className={cn(
                                    "px-2 py-1 rounded-full font-semibold border-2 bg-background shadow-clay-button",
                                    product.processingLevel === 'Unprocessed' ? 'border-success text-success' :
                                        product.processingLevel === 'Ultra-Processed' ? 'border-danger text-danger' :
                                            'border-warning text-warning'
                                )}>
                                    {product.processingLevel}
                                </span>
                                <span className="px-2 py-1 rounded-[8px] bg-background shadow-clay-button text-gray-500">{product.type}</span>
                            </div>
                        </div>

                        <div className="flex-shrink-0 items-center justify-center ml-2">
                            <ValueScoreBadge score={product.healthScore} />
                            <p className="text-[10px] text-center mt-2 font-medium text-gray-500">Health Score</p>
                        </div>
                    </ClayCard>
                </motion.div>

                {/* Allergy Alert */}
                <ClayCard animate className={cn(
                    "transition-colors duration-300",
                    !isAllergySafe ? "bg-danger/5" : "bg-success/5"
                )}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-full", isAllergySafe ? "bg-success/20 text-success" : "bg-danger/20 text-danger")}>
                            {isAllergySafe ? <Check size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <h3 className="font-poppins font-semibold text-lg">{isAllergySafe ? "Safe to Eat" : "Allergy Warning!"}</h3>
                    </div>

                    {isAllergySafe ? (
                        <p className="text-sm text-gray-600 font-medium">No matching allergens found based on your profile preferences.</p>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-800 font-medium mb-3">Contains ingredients matching your active allergies:</p>
                            <div className="flex flex-wrap gap-2">
                                {activeAllergens.map(a => <AllergyBadge key={a} allergen={a} safe={false} />)}
                            </div>
                        </div>
                    )}
                </ClayCard>

                {/* Nutrition Charts */}
                <div className="min-h-[300px]">
                    <ToggleChart nutrition={product.nutrition} />
                </div>

                {/* Ingredients & Flags */}
                <ClayCard className="space-y-4">
                    <h3 className="font-poppins font-semibold text-lg flex items-center gap-2">
                        Ingredients <Info size={18} className="text-gray-400" />
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-4">
                        {product.ingredients.join(', ')}
                    </p>

                    {!explanations && (
                        <ClayButton
                            onClick={handleExplain}
                            isLoading={explainIngredients.isPending}
                            className="w-full text-accent mt-2 border-2 border-accent/20 bg-accent/5 hover:bg-accent/10"
                        >
                            Analyze Ingredients List
                        </ClayButton>
                    )}

                    <AnimatePresence>
                        {explanations && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-3 pt-2"
                            >
                                {explanations.map((exp, i) => (
                                    <div key={i} className="p-3 bg-white rounded-[16px] shadow-clay-inner border border-gray-100 flex items-start gap-3">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full mt-1.5 flex-shrink-0",
                                            exp.safetyLevel === 'none' ? 'bg-success' :
                                                exp.safetyLevel === 'low' ? 'bg-success/60' :
                                                    exp.safetyLevel === 'medium' ? 'bg-warning' : 'bg-danger'
                                        )} />
                                        <div>
                                            <h4 className="font-semibold text-sm mb-0.5">{exp.name}</h4>
                                            <p className="text-xs text-gray-600 font-medium">{exp.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </ClayCard>

                {/* Good & Bad Flags */}
                {((product.greenFlags && product.greenFlags.length > 0) || (product.redFlags && product.redFlags.length > 0)) && (
                    <div className="grid grid-cols-2 gap-4">
                        {product.greenFlags && product.greenFlags.length > 0 && (
                            <div className="clay-card bg-success/5 p-4 space-y-2">
                                <h4 className="font-semibold text-success text-sm flex items-center gap-1.5 mb-3"><Check size={16} /> Good Flags</h4>
                                {product.greenFlags.map((flag, i) => (
                                    <div key={i} className="text-xs font-medium text-gray-700 bg-white/60 p-2 rounded-lg">{flag}</div>
                                ))}
                            </div>
                        )}
                        {product.redFlags && product.redFlags.length > 0 && (
                            <div className="clay-card bg-danger/5 p-4 space-y-2">
                                <h4 className="font-semibold text-danger text-sm flex items-center gap-1.5 mb-3"><XCircle size={16} /> Bad Flags</h4>
                                {product.redFlags.map((flag, i) => (
                                    <div key={i} className="text-xs font-medium text-gray-700 bg-white/60 p-2 rounded-lg">{flag}</div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="pb-8">
                    <h3 className="font-poppins font-semibold text-lg mb-4 text-gray-800">Healthier Options</h3>
                    {!alternatives && (
                        <ClayButton
                            onClick={handleAlternatives}
                            isLoading={getAlternatives.isPending}
                            className="w-full bg-accent text-white shadow-lg"
                        >
                            Find Better Alternatives
                        </ClayButton>
                    )}

                    <AnimatePresence>
                        {alternatives && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {alternatives.map((alt, i) => (
                                    <ClayCard key={i} className="flex flex-col gap-3 p-5 bg-white border border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-poppins font-bold text-base text-gray-900 mb-0.5">{alt.name}</h4>
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{alt.brand}</span>
                                            </div>
                                            <div className={cn(
                                                "px-2.5 py-1 rounded-[10px] text-xs font-black text-white shadow-sm flex-shrink-0",
                                                alt.score >= 80 ? "bg-success" : alt.score >= 60 ? "bg-warning" : "bg-danger"
                                            )}>
                                                {alt.score}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-700 bg-gray-200/40 p-3 rounded-xl border border-gray-200/50 leading-relaxed">
                                            {alt.reason}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {alt.allergySafe ? (
                                                <span className="text-[10px] font-bold text-success flex items-center gap-1 px-2 py-0.5 bg-success/10 rounded-full">
                                                    <Check size={12} strokeWidth={3} /> Allergy Safe
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-danger flex items-center gap-1 px-2 py-0.5 bg-danger/10 rounded-full">
                                                    <AlertTriangle size={12} strokeWidth={3} /> Check Allergens
                                                </span>
                                            )}
                                        </div>
                                    </ClayCard>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ChatButton onClick={() => setIsChatOpen(true)} />
            <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} contextProduct={product} />
        </div>
    );
};
