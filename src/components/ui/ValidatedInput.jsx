// Lokasi file: src/components/ui/ValidatedInput.jsx

import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Info, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'; // BARU: Menambahkan RefreshCw
import { cn } from '../../lib/utils';
import { Button } from './button'; // BARU

/**
 * An enhanced Input component with validation, help tooltips, and data mismatch warnings.
 * @param {object} props - The component props.
 * @param {string} props.id - The id for the input and label.
 * @param {string} props.label - The text for the label.
 * @param {string} [props.unit] - An optional unit to display next to the input.
 * @param {string} [props.helpText] - Help text for the tooltip.
 * @param {boolean} [props.isValid] - Whether the current input value is valid.
 * @param {string} [props.errorText] - Error message to show when invalid.
 * @param {string} [props.warningText] - BARU: Warning message for data mismatch.
 * @param {function} [props.onSync] - BARU: Function to call to sync data.
 */
const ValidatedInput = ({ id, label, unit, helpText, isValid, errorText, warningText, onSync, ...props }) => {
    const hasValidation = isValid !== undefined;
    const hasWarning = !!warningText;

    return (
        <TooltipProvider>
            <div className="w-full">
                <div className="flex items-center gap-1 mb-1.5">
                    <Label htmlFor={id}>{label}</Label>
                    {helpText && (
                        <HelpTooltip content={helpText} />
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                        <Input
                            id={id}
                            className={cn(
                                'w-full',
                                hasValidation && (isValid 
                                    ? 'border-green-500 focus-visible:ring-green-500' 
                                    : 'border-red-500 focus-visible:ring-red-500'),
                                hasWarning && 'border-yellow-500 focus-visible:ring-yellow-500',
                                'pr-10'
                            )}
                            {...props}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {hasValidation && !hasWarning && (
                                isValid ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" tabIndex={-1} className="focus:outline-none">
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{errorText}</p></TooltipContent>
                                    </Tooltip>
                                )
                            )}
                            {/* BARU: Logika untuk menampilkan ikon peringatan */}
                            {hasWarning && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSync}>
                                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">{warningText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                    {unit && <span className="text-sm text-muted-foreground flex-shrink-0">{unit}</span>}
                </div>
            </div>
        </TooltipProvider>
    );
};

export default ValidatedInput;
