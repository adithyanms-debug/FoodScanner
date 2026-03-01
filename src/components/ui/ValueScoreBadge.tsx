import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const ValueScoreBadge = ({ score }: { score: number }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        let current = 0;
        const interval = setInterval(() => {
            current += 2;
            if (current >= score) {
                setDisplayScore(score);
                clearInterval(interval);
            } else {
                setDisplayScore(current);
            }
        }, 20);
        return () => clearInterval(interval);
    }, [score]);

    const getColor = (s: number) => {
        if (s >= 80) return '#4CAF50';
        if (s >= 60) return '#FF9800';
        if (s >= 40) return '#FBC02D';
        return '#E53935';
    };

    const color = getColor(score);
    const circumference = 28 * 2 * Math.PI;

    return (
        <div className="relative w-20 h-20 flex items-center justify-center bg-background rounded-full shadow-clay-card font-poppins font-bold text-2xl">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200" />
                <motion.circle
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${(score / 100) * circumference} ${circumference}` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    cx="40" cy="40" r="28"
                    stroke={color}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
            <span style={{ color }}>{Math.round(displayScore)}</span>
        </div>
    );
};
