// Lokasi file: src/features/Projects/ProjectManager.jsx
// Deskripsi: Penambahan field 'Ditugaskan kepada' pada form dan tampilan.

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { PlusCircle, MoreVertical, Trash2, Pencil, Copy, Eye, Archive, ArchiveRestore, FilePlus, Folder, ChevronDown, Search, CheckSquare, XSquare, Upload, User as UserIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Checkbox } from '../../components/ui/checkbox';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';
import { useProjects } from '../../hooks/useProjects';
import { useTrials } from '../../hooks/useTrials';
import { defaultInputs } from '../../data/sniData';
import { SkeletonList } from '../../components/ui/SkeletonCard.jsx';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { useNotifier } from '../../hooks/useNotifier';
import * as api from '../../api/electronAPI';

const ProjectForm = ({ project, onSave, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isEditing = !!project?.id;
    const { notify } = useNotifier();

    const [formData, setFormData] = useState({});
    const [requestLetterFile, setRequestLetterFile] = useState({ path: '', name: '' });
    const [openSections, setOpenSections] = useState(['basic-info']);

    const toggleSection = (sectionId) => {
        setOpenSections(prev => 
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
        );
    };

    useEffect(() => {
        if (isOpen) {
            const initialData = {
                projectName: project?.projectName || '',
                clientName: project?.clientName || '',
                clientAddress: project?.clientAddress || '',
                clientContactPerson: project?.clientContactPerson || '',
                clientContactNumber: project?.clientContactNumber || '',
                requestNumber: project?.requestNumber || '',
                requestDate: project?.requestDate || '',
                testingRequests: project?.testingRequests || '',
                projectNotes: project?.projectNotes || '',
                assignedTo: project?.assignedTo || '',
            };
            setFormData(initialData);

            if (project?.requestLetterPath) {
                const fileName = project.requestLetterPath.split('-').slice(2).join('-');
                setRequestLetterFile({ path: project.requestLetterPath, name: fileName });
            } else {
                setRequestLetterFile({ path: '', name: '' });
            }
            setOpenSections(['basic-info']);
        }
    }, [isOpen, project]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = async () => {
        const selectedPath = await api.openPdfDialog();
        if (selectedPath) {
            handleChange('tempRequestLetterPath', selectedPath);
            setRequestLetterFile({ path: selectedPath, name: selectedPath.split(/[\\/]/).pop() });
        }
    };

    const handleSave = async () => {
        if (!formData.projectName.trim()) {
            notify.error("Nama Proyek harus diisi.");
            return;
        }
        let finalData = { ...formData };
        if (formData.tempRequestLetterPath && formData.tempRequestLetterPath !== project?.requestLetterPath) {
            try {
                const savedPath = await api.saveRequestLetter(formData.tempRequestLetterPath);
                finalData.requestLetterPath = savedPath;
            } catch (error) {
                notify.error("Gagal mengunggah file surat permohonan.");
                return;
            }
        }
        delete finalData.tempRequestLetterPath;
        const success = await onSave({ ...project, ...finalData });
        if (success) setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>{isEditing ? 'Edit Proyek' : 'Tambah Proyek Baru'}</DialogTitle></DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1">
                    <div className="space-y-2 pr-4 py-4">
                        <Collapsible open={openSections.includes('basic-info')} onOpenChange={() => toggleSection('basic-info')}>
                            <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
                                <h4 className="font-semibold">Informasi Dasar Proyek</h4>
                                <ChevronDown className={cn("h-5 w-5 transition-transform", openSections.includes('basic-info') && "rotate-180")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 px-2 space-y-4">
                                <div><Label>Nama Proyek</Label><Input value={formData.projectName || ''} onChange={(e) => handleChange('projectName', e.target.value)} /></div>
                                <div><Label>Nama Klien</Label><Input value={formData.clientName || ''} onChange={(e) => handleChange('clientName', e.target.value)} /></div>
                                <div><Label>Ditugaskan kepada (PIC)</Label><Input value={formData.assignedTo || ''} onChange={(e) => handleChange('assignedTo', e.target.value)} placeholder="Nama penanggung jawab..." /></div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={openSections.includes('contact-details')} onOpenChange={() => toggleSection('contact-details')}>
                            <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
                                <h4 className="font-semibold">Detail Kontak Klien</h4>
                                <ChevronDown className={cn("h-5 w-5 transition-transform", openSections.includes('contact-details') && "rotate-180")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 px-2 space-y-4">
                                <div><Label>Alamat Klien</Label><Textarea value={formData.clientAddress || ''} onChange={(e) => handleChange('clientAddress', e.target.value)} /></div>
                                <div><Label>Kontak Person Klien</Label><Input value={formData.clientContactPerson || ''} onChange={(e) => handleChange('clientContactPerson', e.target.value)} /></div>
                                <div><Label>Nomor Kontak Klien</Label><Input value={formData.clientContactNumber || ''} onChange={(e) => handleChange('clientContactNumber', e.target.value)} /></div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={openSections.includes('request-details')} onOpenChange={() => toggleSection('request-details')}>
                            <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
                                <h4 className="font-semibold">Detail Permohonan</h4>
                                <ChevronDown className={cn("h-5 w-5 transition-transform", openSections.includes('request-details') && "rotate-180")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 px-2 space-y-4">
                                <div><Label>Nomor Surat Permohonan</Label><Input value={formData.requestNumber || ''} onChange={(e) => handleChange('requestNumber', e.target.value)} /></div>
                                <div><Label>Tanggal Surat Permohonan</Label><Input type="date" value={formData.requestDate || ''} onChange={(e) => handleChange('requestDate', e.target.value)} /></div>
                                <div><Label>Detail Permintaan Pengujian</Label><Textarea value={formData.testingRequests || ''} onChange={(e) => handleChange('testingRequests', e.target.value)} placeholder="Contoh: Uji kuat tekan umur 7, 14, dan 28 hari..." /></div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={openSections.includes('attachments')} onOpenChange={() => toggleSection('attachments')}>
                            <CollapsibleTrigger className="flex justify-between items-center w-full p-2 bg-muted/50 rounded-md">
                                <h4 className="font-semibold">Lampiran & Catatan</h4>
                                <ChevronDown className={cn("h-5 w-5 transition-transform", openSections.includes('attachments') && "rotate-180")} />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4 px-2 space-y-4">
                                <div>
                                    <Label>Lampiran Surat Permohonan</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Button variant="outline" onClick={handleFileSelect}><Upload className="mr-2 h-4 w-4" /> Pilih File</Button>
                                        {requestLetterFile.name && (
                                            <>
                                                <span className="text-sm text-muted-foreground truncate">{requestLetterFile.name}</span>
                                                <Button variant="ghost" size="sm" onClick={() => api.openPath(requestLetterFile.path)}>Lihat</Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div><Label>Catatan Proyek</Label><Textarea value={formData.projectNotes || ''} onChange={(e) => handleChange('projectNotes', e.target.value)} placeholder="Catatan internal mengenai proyek..." /></div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleSave}>{isEditing ? 'Simpan Perubahan' : 'Simpan Proyek'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

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
                                onSelectTrial={onTrialSelect}
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
