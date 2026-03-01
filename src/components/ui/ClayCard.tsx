import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface ClayCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    animate?: boolean;
}

export const ClayCard = ({ children, className, onClick, animate = false }: ClayCardProps) => {
    const CardContent = (
        <div
            onClick={onClick}
            className={cn(
                'clay-card',
                onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 select-none',
                className
            )}
        >
            {children}
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                {CardContent}
            </motion.div>
        );
    }

    return CardContent;
};
