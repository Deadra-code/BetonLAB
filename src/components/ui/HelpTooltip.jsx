// Lokasi file: src/components/ui/HelpTooltip.jsx
// Deskripsi: Komponen reusable untuk menampilkan bantuan kontekstual.

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { HelpCircle } from 'lucide-react';

const HelpTooltip = ({ content }) => {
    if (!content) return null;
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button" className="ml-2 focus:outline-none">
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p>{content}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default HelpTooltip;
