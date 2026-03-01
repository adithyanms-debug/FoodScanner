import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const ChatButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-24 right-6 w-14 h-14 bg-accent rounded-full shadow-clay-card flex items-center justify-center text-white z-40 transition-colors hover:bg-accent/90 focus:outline-none"
        >
            <MessageCircle size={28} />
        </motion.button>
    );
};
