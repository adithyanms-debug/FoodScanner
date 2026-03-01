import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AllergyBadge = ({ allergen, safe = true }: { allergen: string; safe?: boolean }) => {
    return (
        <div className={cn(
            "inline-flex items-center px-4 py-2 rounded-full font-medium text-sm shadow-clay-button",
            safe ? "text-success" : "text-danger"
        )}>
            {safe ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
            {allergen}
        </div>
    );
};
