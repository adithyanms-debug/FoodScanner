import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
    active?: boolean;
}

export const ClayButton = ({ children, className, isLoading, active, disabled, ...props }: ClayButtonProps) => {
    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                'clay-button flex flex-row items-center justify-center px-6 py-3',
                active && 'shadow-clay-button-active',
                (disabled || isLoading) && 'opacity-60 cursor-not-allowed active:scale-100',
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {children}
        </button>
    );
};
