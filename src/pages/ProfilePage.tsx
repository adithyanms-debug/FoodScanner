import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AlertTriangle, Settings2, Sliders } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { ClayButton } from '../components/ui/ClayButton';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

const COMMON_ALLERGIES = [
    'Gluten', 'Dairy', 'Nuts', 'Soy',
    'Eggs', 'Shellfish', 'Fish', 'Wheat'
];

const DIET_TYPES = ['Balanced', 'Low Carb', 'High Protein', 'Vegan'] as const;

export const ProfilePage = () => {
    const { profile, updateProfile } = useStore();
    const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

    // Sync state if global changes
    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const toggleAllergy = (allergy: string) => {
        const isEditing = localProfile.allergies.includes(allergy);
        const newAllergies = isEditing
            ? localProfile.allergies.filter(a => a !== allergy)
            : [...localProfile.allergies, allergy];

        // Update both local and global store instantly for snappy UI
        setLocalProfile({ ...localProfile, allergies: newAllergies });
        updateProfile({ allergies: newAllergies });
    };

    const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setLocalProfile({ ...localProfile, calorieTarget: val });
    };

    const handleCalorieCommit = () => {
        updateProfile({ calorieTarget: localProfile.calorieTarget });
    };

    const handleDietChange = (diet: UserProfile['dietType']) => {
        setLocalProfile({ ...localProfile, dietType: diet });
        updateProfile({ dietType: diet });
    };

    return (
        <div className="min-h-screen pb-28 pt-8 px-6 bg-background space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent shadow-clay-inner">
                    <Settings2 size={24} />
                </div>
                <h1 className="font-poppins font-bold text-2xl text-gray-900">Preferences</h1>
            </div>

            {/* Allergies Section */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <AlertTriangle size={18} />
                    <h2 className="font-poppins font-semibold text-lg">Allergies & Intolerances</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {COMMON_ALLERGIES.map(allergy => {
                        const isActive = localProfile.allergies.includes(allergy);
                        return (
                            <ClayButton
                                key={allergy}
                                onClick={() => toggleAllergy(allergy)}
                                active={isActive}
                                className={cn(
                                    "py-4 !rounded-[20px] justify-start px-5 font-semibold transition-all duration-300",
                                    isActive ? "text-danger bg-danger/5 shadow-clay-button-active" : "text-gray-600 bg-background shadow-clay-button"
                                )}
                            >
                                <div className={cn(
                                    "w-3 h-3 rounded-full mr-3 shadow-inner transition-colors",
                                    isActive ? "bg-danger" : "bg-gray-200"
                                )} />
                                {allergy}
                            </ClayButton>
                        );
                    })}
                </div>
            </section>

            {/* Diet Profile Section */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Sliders size={18} />
                    <h2 className="font-poppins font-semibold text-lg">Nutrition Goals</h2>
                </div>
                <ClayCard className="space-y-6">
                    {/* Calorie Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-medium text-sm text-gray-600">Daily Target</span>
                            <span className="font-poppins font-bold text-accent text-xl">{localProfile.calorieTarget} <span className="text-xs font-medium text-gray-500">kcal</span></span>
                        </div>

                        <input
                            type="range"
                            min="1200"
                            max="4000"
                            step="50"
                            value={localProfile.calorieTarget}
                            onChange={handleCalorieChange}
                            onMouseUp={handleCalorieCommit}
                            onTouchEnd={handleCalorieCommit}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb accent-accent shadow-clay-inner outline-none"
                        />
                    </div>

                    <hr className="border-gray-200" />

                    {/* Diet Segments */}
                    <div>
                        <span className="font-medium text-sm text-gray-600 block mb-4">Diet Type</span>
                        <div className="flex flex-col gap-3">
                            {DIET_TYPES.map(diet => {
                                const isActive = localProfile.dietType === diet;
                                return (
                                    <button
                                        key={diet}
                                        onClick={() => handleDietChange(diet)}
                                        className={cn(
                                            "w-full text-left px-5 py-4 rounded-clay-button transition-all duration-300 font-semibold text-sm",
                                            isActive
                                                ? "bg-accent text-white shadow-[inset_4px_4px_10px_rgba(0,0,0,0.2)]"
                                                : "bg-background text-gray-600 shadow-clay-button hover:bg-gray-50"
                                        )}
                                    >
                                        {diet}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </ClayCard>
            </section>
        </div>
    );
};
