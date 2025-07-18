// Lokasi file: src/features/Projects/components/ProjectItem.jsx
// Deskripsi: Komponen collapsible untuk menampilkan satu proyek dan daftar trial mix-nya.

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { MoreVertical, Trash2, Pencil, Copy, Eye, Archive, ArchiveRestore, FilePlus, Folder, ChevronDown, CheckSquare, XSquare, User as UserIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../../components/ui/dropdown-menu';
import { cn } from '../../../lib/utils';
import { useTrials } from '../../../hooks/useTrials';
import { defaultInputs } from '../../../data/sniData';
import { SecureDeleteDialog } from '../../../components/ui/SecureDeleteDialog';
import { useNotifier } from '../../../hooks/useNotifier';
import { TrialItem } from './TrialItem';
import { ProjectForm } from './ProjectForm';

export const ProjectItem = ({ project, onSelectTrial, onCompareTrials, onNavigateToReportBuilder, onUpdateProject, onDeleteProject, onDuplicateProject, onSetProjectStatus, initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState(new Set());
    const { trials, addTrial, deleteTrial } = useTrials(project.id);
    const { notify } = useNotifier();

    const handleAddTrial = () => {
        const trialName = `Trial Mix #${trials.length + 1}`;
        addTrial({ trial_name: trialName, design_input: defaultInputs });
    };

    const handleDuplicateTrial = (trial) => {
        const newTrial = { ...trial, trial_name: `${trial.trial_name} (Salinan)` };
        delete newTrial.id;
        addTrial(newTrial);
    };

    const handleCompareSelect = (trialId) => {
        setSelectedForComparison(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trialId)) newSet.delete(trialId);
            else newSet.add(trialId);
            return newSet;
        });
    };

    const handleStartCompare = () => {
        if (selectedForComparison.size < 2) {
            notify.error("Pilih setidaknya dua trial untuk dibandingkan.");
            return;
        }
        const trialsToCompare = trials.filter(t => selectedForComparison.has(t.id));
        onCompareTrials(trialsToCompare);
    };
    
    useEffect(() => {
        if (!isOpen) {
            setIsCompareMode(false);
            setSelectedForComparison(new Set());
        }
    }, [isOpen]);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b">
            <div className="flex items-center p-2 group hover:bg-accent/50 rounded-md">
                <CollapsibleTrigger asChild>
                    <button className="flex items-center flex-grow text-left p-2">
                        <Folder size={18} className="mr-3 text-primary flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold">{project.projectName}</p>
                            <div className="flex items-center text-xs text-muted-foreground space-x-3">
                                <span>{project.clientName || 'Tanpa Klien'}</span>
                                {project.assignedTo && (
                                    <span className="flex items-center border-l pl-3">
                                        <UserIcon size={12} className="mr-1.5" />
                                        {project.assignedTo}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </button>
                </CollapsibleTrigger>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={16} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <ProjectForm project={project} onSave={onUpdateProject}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Pencil size={14} className="mr-2" /> Edit Proyek</DropdownMenuItem>
                            </ProjectForm>
                            <DropdownMenuItem onSelect={() => onDuplicateProject(project.id)}><Copy size={14} className="mr-2" /> Duplikat Proyek</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onSetProjectStatus(project.id, project.status === 'active' ? 'archived' : 'active')}>
                                {project.status === 'active' ? <Archive size={14} className="mr-2" /> : <ArchiveRestore size={14} className="mr-2" />}
                                {project.status === 'active' ? 'Arsipkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <SecureDeleteDialog
                                trigger={<div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"><Trash2 size={14} className="mr-2" />Hapus Proyek</div>}
                                title="Hapus Proyek?"
                                description={`Aksi ini akan menghapus proyek "${project.projectName}" dan semua trial mix di dalamnya secara permanen.`}
                                confirmationText="HAPUS"
                                onConfirm={() => onDeleteProject(project.id)}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <CollapsibleContent>
                <div className="py-2 pl-4 pr-2 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2 border-b">
                        <Button size="sm" className="flex-1" onClick={handleAddTrial}><FilePlus size={14} className="mr-2"/> Trial Baru</Button>
                        {isCompareMode ? (
                            <>
                                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setIsCompareMode(false)}><XSquare size={14} className="mr-2"/> Batal</Button>
                                <Button size="sm" variant="default" className="flex-1" onClick={handleStartCompare} disabled={selectedForComparison.size < 2}>
                                    <Eye size={14} className="mr-2"/> Bandingkan ({selectedForComparison.size})
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsCompareMode(true)}>
                                <CheckSquare size={14} className="mr-2"/> Pilih untuk Bandingkan
                            </Button>
                        )}
                    </div>
                    {trials.length === 0 ? (
                        <p className="text-xs text-center text-muted-foreground py-4">Proyek ini belum memiliki trial mix.</p>
                    ) : (
                        trials.map(trial => (
                            <TrialItem
                                key={trial.id}
                                trial={trial}
                                onSelect={onSelectTrial}
                                onDelete={deleteTrial}
                                onDuplicate={handleDuplicateTrial}
                                isCompareMode={isCompareMode}
                                onCompareSelect={handleCompareSelect}
                                isSelectedForCompare={selectedForComparison.has(trial.id)}
                            />
                        ))
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
