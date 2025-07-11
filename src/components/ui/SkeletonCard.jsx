import React from 'react';
import { cn } from '../../lib/utils';

/**
 * A skeleton placeholder component to indicate loading state.
 * It mimics the layout of a Card component.
 */
const SkeletonCard = ({ className }) => {
    return (
        <div className={cn("p-3 rounded-lg border bg-card shadow-sm animate-pulse", className)}>
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-5 w-5 bg-muted rounded-full"></div>
            </div>
        </div>
    );
};

export const SkeletonList = ({ count = 3 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default SkeletonCard;
