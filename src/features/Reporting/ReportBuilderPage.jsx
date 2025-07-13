// Lokasi file: src/features/Reporting/ReportBuilderPage.jsx
// Deskripsi: Perbaikan pada cara mengambil state dari Zustand/Zundo untuk mencegah error dan memastikan UI reaktif.

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { FileDown, Loader2, MoreVertical, Trash2, FilePlus, Eye, Tv, Undo2, Redo2 } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import ReportBuilderV2 from './ReportBuilderV2';
import { useReportLayouts } from '../../hooks/useReportLayouts';
import ReportPreviewModal from './components/ReportPreviewModal';
import { useProjects } from '../../hooks/useProjects';
import { useReportBuilderStore } from '../../hooks/useReportBuilderStore';

// Dialog "Simpan Sebagai" (tidak berubah)
const SaveAsDialog = ({ open, onOpenChange, onConfirm, activeTemplateName }) => {
    const [name, setName] = useState('');
    useEffect(() => {
        if (open) setName(`Salinan dari ${activeTemplateName || 'Template Kustom'}`);
    }, [open, activeTemplateName]);
    const handleConfirmClick = () => { if (name.trim()) onConfirm(name.trim()); };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Simpan Sebagai Template Baru</DialogTitle><DialogDescription>Masukkan nama yang deskriptif untuk template laporan baru Anda.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="template-name" className="text-right">Nama</Label><Input id="template-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" autoFocus /></div></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button><Button onClick={handleConfirmClick} disabled={!name.trim()}>Simpan</Button></DialogFooter></DialogContent>
        </Dialog>
    );
};

export default function ReportBuilderPage({ context, apiReady }) {
    const { settings } = useSettings(apiReady);
    const { notify } = useNotifier();
    const { layouts, addLayout, updateLayout, deleteLayout } = useReportLayouts(apiReady);
    const { projects } = useProjects(apiReady);

    // --- PERBAIKAN: Mengambil state dan actions dari store dengan benar ---
    
    // 1. Mengambil state yang dibutuhkan oleh UI dari store.
    // Ini akan membuat komponen re-render saat state ini berubah.
    const { layout, pageSettings, temporal } = useReportBuilderStore();
    
    // 2. Mengambil state undo/redo dengan aman, memberikan nilai default jika 'temporal' belum ada.
    const pastStates = temporal?.pastStates || [];
    const futureStates = temporal?.futureStates || [];

    // 3. Mengambil actions. Actions tidak berubah, jadi bisa diambil dari getState() secara statis.
    const { undo, redo } = useReportBuilderStore.temporal.getState();
    // ----------------------------------------------------------------

    const [previewData, setPreviewData] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        const fetchPreviewData = async () => {
            if (selectedProject?.id) {
                setIsLoadingData(true);
                try {
                    const data = await api.getFullReportData(selectedProject.id);
                    setPreviewData(data);
                } catch (error) {
                    notify.error("Gagal memuat data pratinjau proyek.");
                    setPreviewData(null);
                } finally {
                    setIsLoadingData(false);
                }
            } else {
                setPreviewData(null);
            }
        };
        fetchPreviewData();
    }, [selectedProject, apiReady, notify]);
    
    const handleLayoutChange = () => { /* Fungsi ini tidak lagi diperlukan karena state dikelola oleh Zustand */ };
    const handleSaveAsNew = () => setIsSaveAsDialogOpen(true);
    const handleConfirmSaveAs = (name) => { addLayout({ name, layout_object_json: JSON.stringify({ layout, pageSettings }) }); setIsSaveAsDialogOpen(false); };
    const handleUpdateCurrent = async () => { if (activeTemplate) { await updateLayout({ ...activeTemplate, layout_object_json: JSON.stringify({ layout, pageSettings }) }); } };
    const handleDeleteCurrent = () => { if (activeTemplate) { deleteLayout(activeTemplate.id); setActiveTemplate(null); } };
    const handleNewTemplate = () => setActiveTemplate(null);
    const handlePreviewReport = () => { if (layout.flat().length === 0) { notify.error("Layout laporan kosong."); return; } setIsPreviewOpen(true); };
    
    return (
        <>
            <div className="h-full flex flex-col">
                <header className="flex-shrink-0 p-4 border-b bg-card flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Report Builder</h1>
                        <p className="text-sm text-muted-foreground">
                            {activeTemplate ? `Mengedit: ${activeTemplate.name}` : 'Template Baru'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 border p-2 rounded-lg">
                         <Tv className="h-5 w-5 text-muted-foreground" />
                         <Label className="text-sm font-semibold">Data Pratinjau:</Label>
                         <Select onValueChange={(id) => setSelectedProject(projects.find(p => p.id === parseInt(id)))} value={selectedProject?.id || ''}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Pilih Proyek..." /></SelectTrigger>
                            <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>)}</SelectContent>
                         </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={undo} disabled={pastStates.length === 0}>
                            <Undo2 className="h-4 w-4" />
                        </Button>
                         <Button variant="outline" size="icon" onClick={redo} disabled={futureStates.length === 0}>
                            <Redo2 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline"><MoreVertical className="h-4 w-4 mr-2"/>Opsi</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={handleNewTemplate}><FilePlus className="mr-2 h-4 w-4" /> Template Baru</DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Muat Template</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>{layouts.map(l => <DropdownMenuItem key={l.id} onSelect={() => setActiveTemplate(l)}>{l.name}</DropdownMenuItem>)}</DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={handleUpdateCurrent} disabled={!activeTemplate}>Simpan Perubahan</DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleSaveAsNew}>Simpan Sebagai Baru...</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog><AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!activeTemplate} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Anda Yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini akan menghapus template "{activeTemplate?.name}" secara permanen.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCurrent}>Hapus</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handlePreviewReport}><Eye className="mr-2 h-4 w-4" /> Pratinjau & PDF</Button>
                    </div>
                </header>
                
                <div className="flex-grow min-h-0">
                    {isLoadingData && !previewData ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-4">Memuat data pratinjau...</p></div>
                    ) : (
                        <ReportBuilderV2
                            key={activeTemplate ? activeTemplate.id : 'new'}
                            reportData={previewData}
                            settings={settings}
                            onLayoutChange={handleLayoutChange}
                            initialLayout={activeTemplate ? JSON.parse(activeTemplate.layout_object_json || '{}') : undefined}
                            apiReady={apiReady}
                        />
                    )}
                </div>
            </div>
            
            {isPreviewOpen && <ReportPreviewModal isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} reportData={previewData} settings={settings} layout={layout} pageSettings={pageSettings} apiReady={apiReady} />}
            <SaveAsDialog open={isSaveAsDialogOpen} onOpenChange={setIsSaveAsDialogOpen} onConfirm={handleConfirmSaveAs} activeTemplateName={activeTemplate?.name} />
        </>
    );
}
