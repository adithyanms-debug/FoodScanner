import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Search, Trash2, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ClayCard } from '../components/ui/ClayCard';
import { ValueScoreBadge } from '../components/ui/ValueScoreBadge';

export const HistoryPage = () => {
    const { history, removeScan } = useStore();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Good' | 'Fair' | 'Poor'>('All');

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(search.toLowerCase()) ||
            item.brand.toLowerCase().includes(search.toLowerCase());

        let matchesFilter = true;
        if (filter === 'Good') matchesFilter = item.healthScore >= 70;
        else if (filter === 'Fair') matchesFilter = item.healthScore >= 40 && item.healthScore < 70;
        else if (filter === 'Poor') matchesFilter = item.healthScore < 40;

        return matchesSearch && matchesFilter;
    });

    // Group by date
    const groupedHistory = filteredHistory.reduce((acc, curr) => {
        const date = new Date(curr.timestamp).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {} as Record<string, typeof history>);

    return (
        <div className="min-h-screen pb-28 pt-8 px-6 bg-background space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-clay-inner">
                    <HistoryIcon size={24} />
                </div>
                <h1 className="font-poppins font-bold text-2xl text-gray-900">Scan History</h1>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search past scans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full clay-input pl-12 bg-white/50"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(['All', 'Good', 'Fair', 'Poor'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-clay-button ${filter === f
                                ? 'bg-accent text-white shadow-clay-button-active'
                                : 'bg-background text-gray-600'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {Object.keys(groupedHistory).length === 0 ? (
                <div className="text-center py-12 px-6">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No scan history found matching your criteria.</p>
                </div>
            ) : (
                <AnimatePresence>
                    {Object.entries(groupedHistory).map(([date, items]) => (
                        <motion.div
                            key={date}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <h3 className="font-poppins font-semibold text-sm text-gray-400 pl-2">{date}</h3>
                            {items.map(item => (
                                <ClayCard
                                    key={item.id}
                                    className="p-4 flex gap-4 items-center relative overflow-hidden group"
                                    onClick={() => navigate(`/product/${item.id}`)}
                                >
                                    {/* Swipe to delete overlay simulation */}
                                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-danger flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-300">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeScan(item.id); }}
                                            className="p-4 text-white hover:scale-110 transition-transform"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>

                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded-xl shadow-clay-inner bg-white shrink-0" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl shadow-clay-inner flex items-center justify-center shrink-0">
                                            <Search className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0 pr-8 group-hover:pr-24 transition-all duration-300">
                                        <h4 className="font-bold text-gray-900 truncate">{item.productName}</h4>
                                        <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-[6px] text-[10px] font-bold ${item.healthScore >= 70 ? 'bg-success/10 text-success' :
                                                item.healthScore >= 40 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                                            }`}>
                                            Score: {item.healthScore}
                                        </span>
                                    </div>
                                </ClayCard>
                            ))}
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
    );
};
