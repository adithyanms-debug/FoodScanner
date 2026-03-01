import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const LoadingClay = ({ className, skeleton = true }: { className?: string; skeleton?: boolean }) => {
    return (
        <div className={cn("clay-card overflow-hidden relative border border-gray-100", className)}>
            {skeleton && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            )}
        </div>
    );
};
