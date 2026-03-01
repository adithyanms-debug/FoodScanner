import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, ScanResult } from '../types';

interface AppState {
    profile: UserProfile;
    history: ScanResult[];
    updateProfile: (profile: Partial<UserProfile>) => void;
    addScanToHistory: (scan: ScanResult) => void;
    removeScan: (id: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            profile: {
                allergies: [],
                calorieTarget: 2000,
                dietType: 'Balanced'
            },
            history: [],
            updateProfile: (updates) => set((state) => ({
                profile: { ...state.profile, ...updates }
            })),
            addScanToHistory: (scan) => set((state) => ({
                history: [scan, ...state.history].slice(0, 50)
            })),
            removeScan: (id) => set((state) => ({
                history: state.history.filter(s => s.id !== id)
            }))
        }),
        { name: 'smartscan-storage' }
    )
);
