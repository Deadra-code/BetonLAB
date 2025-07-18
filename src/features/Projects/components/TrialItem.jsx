// Lokasi file: src/features/Projects/components/TrialItem.jsx
// Deskripsi: Komponen untuk menampilkan satu item trial mix, kini dalam filenya sendiri.

import React from 'react';
import { Button } from '../../../components/ui/button';
import { MoreVertical, Trash2, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../components/ui/dropdown-menu';
import { Checkbox } from '../../../components/ui/checkbox';
import { cn } from '../../../lib/utils';
import { SecureDeleteDialog } from '../../../components/ui/SecureDeleteDialog';

export const TrialItem = ({ trial, onSelect, onDelete, onDuplicate, isCompareMode, isSelectedForCompare, onCompareSelect }) => {
    const handleClick = () => {
        if (isCompareMode) {
            onCompareSelect(trial.id);
        } else {
            onSelect(trial);
        }
    };
    
    return (
        <div className={cn("flex items-center justify-between pl-8 pr-2 py-1 rounded-md hover:bg-accent/50 group", isSelectedForCompare && "bg-blue-100 dark:bg-blue-900/50")}>
            <div className="flex items-center flex-grow cursor-pointer" onClick={handleClick}>
                {isCompareMode && <Checkbox checked={isSelectedForCompare} onCheckedChange={() => onCompareSelect(trial.id)} className="mr-3" />}
                <span className="text-sm">{trial.trial_name}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical size={14} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onDuplicate(trial)}><Copy size={14} className="mr-2" /> Duplikat</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <SecureDeleteDialog
                            trigger={<div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"><Trash2 size={14} className="mr-2" />Hapus</div>}
                            title="Hapus Trial Mix?"
                            description={`Aksi ini akan menghapus "${trial.trial_name}" secara permanen.`}
                            confirmationText="HAPUS"
                            onConfirm={() => onDelete(trial.id)}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
