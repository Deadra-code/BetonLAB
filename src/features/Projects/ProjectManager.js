// Lokasi file: src/features/Projects/ProjectManager.js

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { PlusCircle, ChevronRight, FolderSearch, FilePlus, X, Trash2, Pencil, Copy, Columns, FileSignature, Eye, Archive, ArchiveRestore } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { useProjects } from '../../hooks/useProjects';
import { useTrials } from '../../hooks/useTrials';
import { defaultInputs } from '../../data/sniData';
import { SkeletonList } from '../../components/ui/SkeletonCard.jsx';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { Checkbox } from '../../components/ui/checkbox';
import { useNotifier } from '../../hooks/useNotifier';
import { Switch } from '../../components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Badge } from '../../components/ui/badge';

const EditProjectForm = ({ project, onSave, children }) => {
    const [projectName, setProjectName] = useState(project.projectName);
    const [clientName, setClientName] = useState(project.clientName);
    const [isOpen, setIsOpen] = useState(false);
    const isEditing = !!project?.id;

    const handleSave = async () => {
        if (!projectName) { alert("Nama Proyek harus diisi."); return; }
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
                    <Button onClick={handleSave}>Simpan Perubahan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function ProjectManager({ apiReady, onTrialSelect, onCompareTrials, onNavigateToReportBuilder, initialProject, pendingNavigation, onPendingNavigationConsumed }) {
    const { projects, addProject, updateProject, deleteProject, loading: projectsLoading, showArchived, setShowArchived, setProjectStatus } = useProjects(apiReady);
    const [selectedProject, setSelectedProject] = useState(null);
    const { trials, addTrial, deleteTrial, loading: trialsLoading } = useTrials(selectedProject?.id);
    const [isTrialPanelOpen, setIsTrialPanelOpen] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState(new Set());
    const { notify } = useNotifier();
    const [comparisonMode, setComparisonMode] = useState(false);

    useEffect(() => {
        if (initialProject) {
            setSelectedProject(initialProject);
            setIsTrialPanelOpen(true);
        }
    }, [initialProject]);

    useEffect(() => {
        if (pendingNavigation && projects.length > 0) {
            const projectToSelect = projects.find(p => p.id === pendingNavigation.projectId);
            if (projectToSelect) {
                // Pilih proyek terlebih dahulu
                handleSelectProject(projectToSelect);

                // Sedikit delay untuk memastikan data trial sudah ter-fetch
                setTimeout(() => {
                    const trialToSelect = trials.find(t => t.id === pendingNavigation.trialId);
                    if (trialToSelect) {
                        onTrialSelect({ ...trialToSelect, projectName: projectToSelect.projectName });
                    }
                    onPendingNavigationConsumed();
                }, 200);
            }
        }
    }, [pendingNavigation, projects, trials, onTrialSelect, onPendingNavigationConsumed]);

    const handleSelectProject = (project) => {
        if (selectedProject?.id === project.id) {
            setIsTrialPanelOpen(prev => !prev);
        } else {
            setSelectedProject(project);
            setIsTrialPanelOpen(true);
            setSelectedForComparison(new Set());
            setComparisonMode(false);
        }
    };
    
    const handleDeleteProject = (id) => {
        deleteProject(id);
        if (selectedProject?.id === id) {
            setSelectedProject(null);
            setIsTrialPanelOpen(false);
        }
    };

    const handleSelectTrial = (trial) => {
        if (onTrialSelect) {
            onTrialSelect({ ...trial, projectName: selectedProject.projectName });
        }
        setIsTrialPanelOpen(false);
    };

    const handleAddTrial = () => {
        const trialName = `Trial Mix #${trials.length + 1}`;
        addTrial({ trial_name: trialName, design_input: defaultInputs });
    };

    const handleDuplicateTrial = (trial) => {
        const newTrial = { ...trial, trial_name: `${trial.trial_name} (Salinan)` };
        delete newTrial.id;
        addTrial(newTrial);
    };
    
    const handleComparisonSelect = (trialId) => {
        setSelectedForComparison(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trialId)) { newSet.delete(trialId); } 
            else { newSet.add(trialId); }
            return newSet;
        });
    };

    const handleCompareClick = () => {
        if (selectedForComparison.size < 2) {
            notify.error("Pilih setidaknya dua trial untuk dibandingkan.");
            return;
        }
        const trialsToCompare = trials.filter(t => selectedForComparison.has(t.id));
        onCompareTrials(trialsToCompare);
    };

    return (
        <div className="flex h-full bg-muted/30">
            <aside className="w-80 border-r p-4 overflow-y-auto bg-card flex flex-col flex-shrink-0">
                <h2 className="text-xl font-bold mb-4 px-2">Daftar Proyek</h2>
                <div className="px-2 mb-4 space-y-2">
                    <EditProjectForm project={{projectName: '', clientName: ''}} onSave={addProject}>
                        <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Proyek Baru</Button>
                    </EditProjectForm>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                        <Label htmlFor="show-archived">Tampilkan Arsip</Label>
                    </div>
                </div>
                <div className="flex-grow space-y-2">
                    {projectsLoading ? ( <SkeletonList count={5} /> ) : (
                        projects.map(proj => (
                            <Card key={proj.id} onClick={() => handleSelectProject(proj)}
                                className={cn("cursor-pointer transition-all duration-200 group animate-fade-in-down", "hover:border-primary/80 hover:shadow-lg hover:-translate-y-1", selectedProject?.id === proj.id ? 'border-primary bg-primary/5' : '', proj.status === 'archived' && 'bg-gray-100 dark:bg-gray-800/50 opacity-70')}>
                                <CardContent className="p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{proj.projectName}</p>
                                        <p className="text-xs text-muted-foreground">{proj.clientName || 'Tanpa Klien'}</p>
                                        {proj.status === 'archived' && <Badge variant="secondary" className="mt-1">Diarsipkan</Badge>}
                                    </div>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setProjectStatus(proj.id, proj.status === 'active' ? 'archived' : 'active'); }}>{proj.status === 'active' ? <Archive size={14}/> : <ArchiveRestore size={14}/>}</Button></TooltipTrigger><TooltipContent><p>{proj.status === 'active' ? 'Arsipkan' : 'Aktifkan Kembali'}</p></TooltipContent></Tooltip></TooltipProvider>
                                        <EditProjectForm project={proj} onSave={updateProject}><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}><Pencil size={14}/></Button></EditProjectForm>
                                        <SecureDeleteDialog trigger={ <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 size={14} /></Button> } title="Anda yakin ingin menghapus proyek ini?" description={`Aksi ini akan menghapus proyek "${proj.projectName}" dan semua trial mix di dalamnya secara permanen.`} confirmationText="HAPUS" onConfirm={() => handleDeleteProject(proj.id)} />
                                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${selectedProject?.id === proj.id && isTrialPanelOpen ? 'rotate-90' : ''}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </aside>
            <div className="flex-grow flex relative overflow-hidden">
                {isTrialPanelOpen && <div className="absolute inset-0 bg-black/30 z-10 md:hidden" onClick={() => setIsTrialPanelOpen(false)} />}
                <aside className={cn("absolute top-0 left-0 h-full w-80 bg-muted border-r p-4 flex flex-col space-y-4 transition-transform duration-300 ease-in-out z-20 md:relative md:translate-x-0", isTrialPanelOpen ? "translate-x-0" : "-translate-x-full")}>
                    {selectedProject ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold px-2">{selectedProject.projectName}</h2>
                                <Button variant="ghost" size="icon" onClick={() => setIsTrialPanelOpen(false)} className="md:hidden"><X className="h-5 w-5" /></Button>
                            </div>
                            <div className="space-y-2">
                                <Button className="w-full" onClick={handleAddTrial}><FilePlus className="mr-2 h-4 w-4" /> Trial Baru</Button>
                                <TooltipProvider>
                                    <div className={cn("p-2 rounded-lg transition-colors", comparisonMode ? "bg-primary/10" : "bg-transparent")}>
                                        <div className="flex items-center justify-between mb-2"><Label htmlFor="comparison-mode" className="font-semibold">Mode Perbandingan</Label><Switch id="comparison-mode" checked={comparisonMode} onCheckedChange={setComparisonMode} /></div>
                                        {comparisonMode && ( <Button className="w-full" onClick={handleCompareClick} disabled={selectedForComparison.size < 2}><Eye className="mr-2 h-4 w-4" /> Bandingkan ({selectedForComparison.size})</Button> )}
                                    </div>
                                </TooltipProvider>
                                <Button className="w-full" variant="secondary" onClick={() => onNavigateToReportBuilder({ project: selectedProject })}>
                                    <FileSignature className="mr-2 h-4 w-4" /> Laporan Proyek
                                </Button>
                            </div>
                            <div className="flex-grow space-y-2 overflow-y-auto">
                                {trialsLoading ? ( <SkeletonList count={4} /> ) : (
                                    trials.map(trial => (
                                        <div key={trial.id} className={cn(`group p-3 rounded-md text-sm font-medium transition-colors flex justify-between items-center hover:bg-background`, selectedForComparison.has(trial.id) && "bg-blue-100 dark:bg-blue-900/50")}>
                                            <div className="flex items-center flex-grow">
                                                {comparisonMode && <Checkbox id={`cb-${trial.id}`} className="mr-3" onCheckedChange={() => handleComparisonSelect(trial.id)} checked={selectedForComparison.has(trial.id)} />}
                                                <label htmlFor={`cb-${trial.id}`} className="cursor-pointer flex-grow" onClick={(e) => { if(!comparisonMode) { e.preventDefault(); handleSelectTrial(trial); } }}>{trial.trial_name}</label>
                                            </div>
                                            <div className="flex items-center opacity-0 group-hover:opacity-100">
                                                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDuplicateTrial(trial)}><Copy size={14} /></Button></TooltipTrigger><TooltipContent><p>Duplikat Trial</p></TooltipContent></Tooltip>
                                                <SecureDeleteDialog trigger={<Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive"><Trash2 size={14} /></Button>} title="Hapus Trial Mix?" description={`Aksi ini akan menghapus "${trial.trial_name}" secara permanen.`} confirmationText="HAPUS" onConfirm={() => deleteTrial(trial.id)} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full w-full text-center">
                            <FolderSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold">Pilih Proyek</h3>
                            <p className="text-muted-foreground text-sm">Pilih proyek dari daftar untuk melihat trial mix yang tersedia.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
