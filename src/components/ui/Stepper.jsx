import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Stepper component to guide users through a multi-step process.
 * Now interactive, allowing clicks to navigate between steps.
 * @param {object} props - The component props.
 * @param {Array<string>} props.steps - An array of step labels.
 * @param {number} props.currentStep - The index of the current active step (1-based).
 * @param {function} [props.onStepClick] - Handler for when a step is clicked.
 * @param {Array<number>} [props.disabledSteps] - Array of step numbers (1-based) that should be disabled.
 * @param {string} [props.className] - Additional class names.
 */
export const Stepper = ({ steps, currentStep, onStepClick, disabledSteps = [], className }) => {
    return (
        <div className={cn("flex items-center justify-between w-full", className)}>
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;
                const isDisabled = disabledSteps.includes(stepNumber);

                return (
                    <React.Fragment key={index}>
                        <button
                            onClick={() => onStepClick && !isDisabled && onStepClick(stepNumber)}
                            disabled={isDisabled}
                            className={cn(
                                "flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-2",
                                isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                            )}
                        >
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
                        </button>
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
