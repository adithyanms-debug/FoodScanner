import { NavLink } from 'react-router-dom';
import { ScanLine, History, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const BottomNav = () => {
    const tabs = [
        { icon: ScanLine, label: 'Scan', path: '/' },
        { icon: History, label: 'History', path: '/history' },
        { icon: User, label: 'Profile', path: '/profile' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-background/90 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-6 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.path}
                    to={tab.path}
                    className={({ isActive }) => cn(
                        "relative flex flex-col items-center justify-center w-16 h-16 transition-colors duration-200",
                        isActive ? "text-accent" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-accent/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <tab.icon className={cn("w-6 h-6 mb-1 z-10", isActive && "fill-accent/20")} />
                            <span className="text-[10px] font-semibold z-10">{tab.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
};
