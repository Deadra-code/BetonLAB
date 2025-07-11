import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Stepper component to guide users through a multi-step process.
 * @param {object} props - The component props.
 * @param {Array<string>} props.steps - An array of step labels.
 * @param {number} props.currentStep - The index of the current active step (1-based).
 * @param {string} [props.className] - Additional class names.
 */
export const Stepper = ({ steps, currentStep, className }) => {
    return (
        <div className={cn("flex items-center justify-between w-full", className)}>
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center text-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                                    isCompleted ? "bg-primary text-primary-foreground" :
                                    isActive ? "bg-primary/20 border-2 border-primary text-primary" :
                                    "bg-muted text-muted-foreground border"
                                )}
                            >
                                {isCompleted ? '✓' : stepNumber}
                            </div>
                            <p className={cn(
                                "mt-2 text-xs font-medium",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                                {label}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-4 transition-colors duration-300",
                                isCompleted ? "bg-primary" : "bg-border"
                            )}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
