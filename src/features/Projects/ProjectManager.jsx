// Lokasi file: src/features/Projects/ProjectManager.js
// Deskripsi: Perbaikan untuk ReferenceError: onSelectTrial is not defined.

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { PlusCircle, MoreVertical, Trash2, Pencil, Copy, Eye, Archive, ArchiveRestore, FilePlus, Folder, ChevronDown, Search, CheckSquare, XSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { cn } from '../../lib/utils';
import { useProjects } from '../../hooks/useProjects';
import { useTrials } from '../../hooks/useTrials';
import { defaultInputs } from '../../data/sniData';
import { SkeletonList } from '../../components/ui/SkeletonCard.jsx';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { useNotifier } from '../../hooks/useNotifier';

// Komponen Form untuk Edit/Tambah Proyek (Tidak ada perubahan)
const ProjectForm = ({ project, onSave, children }) => {
    const [projectName, setProjectName] = useState('');
    const [clientName, setClientName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const isEditing = !!project?.id;

    useEffect(() => {
        if (isOpen) {
            setProjectName(project?.projectName || '');
            setClientName(project?.clientName || '');
        }
    }, [isOpen, project]);

    const handleSave = async () => {
        if (!projectName.trim()) { alert("Nama Proyek harus diisi."); return; }
        const success = await onSave({ ...project, projectName, clientName });
        if (success) setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>{isEditing ? 'Edit Proyek' : 'Tambah Proyek Baru'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="projectName">Nama Proyek</Label>
                    <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    <Label htmlFor="clientName">Nama Klien</Label>
                    <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleSave}>{isEditing ? 'Simpan Perubahan' : 'Simpan Proyek'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Komponen untuk satu baris Trial (Logika diperbarui)
const TrialItem = ({ trial, onSelect, onDelete, onDuplicate, isCompareMode, isSelectedForCompare, onCompareSelect }) => {
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

// Komponen untuk satu baris Proyek dengan logika mode perbandingan
const ProjectItem = ({ project, onSelectTrial, onCompareTrials, onNavigateToReportBuilder, onUpdateProject, onDeleteProject, onDuplicateProject, onSetProjectStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
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
                            <p className="text-xs text-muted-foreground">{project.clientName || 'Tanpa Klien'}</p>
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

// Komponen utama ProjectManager
export default function ProjectManager({ apiReady, onTrialSelect, onCompareTrials, onNavigateToReportBuilder }) {
    const { projects, addProject, updateProject, deleteProject, loading, showArchived, setShowArchived, setProjectStatus, duplicateProject } = useProjects(apiReady);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = useMemo(() => {
        if (!searchQuery) return projects;
        return projects.filter(p =>
            p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    return (
        <div className="flex h-full bg-muted/30">
            <aside className="w-[450px] border-r p-4 bg-card flex flex-col flex-shrink-0">
                <div className="flex-shrink-0">
                    <h2 className="text-xl font-bold mb-4 px-2">Manajemen Proyek</h2>
                    <div className="px-2 mb-4 space-y-3">
                        <ProjectForm project={{ projectName: '', clientName: '' }} onSave={addProject}>
                            <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Proyek Baru</Button>
                        </ProjectForm>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari proyek atau klien..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                            <Label htmlFor="show-archived">Tampilkan Proyek yang Diarsipkan</Label>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-grow min-h-0">
                    {loading ? (
                        <SkeletonList count={5} />
                    ) : filteredProjects.length > 0 ? (
                        filteredProjects.map(proj => (
                            <ProjectItem
                                key={proj.id}
                                project={proj}
                                onSelectTrial={onTrialSelect} // <-- PERBAIKAN DI SINI
                                onCompareTrials={onCompareTrials}
                                onNavigateToReportBuilder={onNavigateToReportBuilder}
                                onUpdateProject={updateProject}
                                onDeleteProject={deleteProject}
                                onDuplicateProject={duplicateProject}
                                onSetProjectStatus={setProjectStatus}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Tidak ada proyek ditemukan.</p>
                        </div>
                    )}
                </ScrollArea>
            </aside>

            <main className="flex-grow bg-background flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Folder size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Selamat Datang di Manajemen Proyek</h3>
                    <p>Buka sebuah proyek dan pilih trial dari daftar di samping untuk memulai.</p>
                </div>
            </main>
        </div>
    );
}
