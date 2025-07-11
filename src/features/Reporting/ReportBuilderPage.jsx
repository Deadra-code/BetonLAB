// Lokasi file: src/features/Reporting/ReportBuilderPage.jsx
// Deskripsi: Memperbaiki alur kerja simpan dan menambah tombol reset.

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
    DialogDescription
} from '../../components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { FileDown, Loader2, MoreVertical, Trash2, FilePlus } from 'lucide-react'; // BARU: Import FilePlus
import { useSettings } from '../../hooks/useSettings';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import ReportBuilderV2 from './ReportBuilderV2';
import { generatePdfFromLayout } from '../../utils/pdfGenerator';
import { useReportLayouts } from '../../hooks/useReportLayouts';

// Komponen dialog kustom untuk "Simpan Sebagai" (tidak berubah)
const SaveAsDialog = ({ open, onOpenChange, onConfirm, activeTemplateName }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (open) {
            setName(`Salinan dari ${activeTemplateName || 'Template Kustom'}`);
        }
    }, [open, activeTemplateName]);

    const handleConfirmClick = () => {
        if (name.trim()) {
            onConfirm(name.trim());
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Simpan Sebagai Template Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan nama yang deskriptif untuk template laporan baru Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="template-name" className="text-right">
                            Nama
                        </Label>
                        <Input
                            id="template-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                    <Button onClick={handleConfirmClick} disabled={!name.trim()}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ReportBuilderPage({ context, apiReady }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { settings } = useSettings(apiReady);
    const { notify } = useNotifier();
    
    const [builderData, setBuilderData] = useState(null);
    const layoutRef = useRef([]);

    const { layouts, addLayout, updateLayout, deleteLayout, refresh: refreshLayouts } = useReportLayouts(apiReady); // BARU: Ambil fungsi refresh
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchDataForReport = async () => {
            if (context?.project?.id) {
                setIsProcessing(true);
                try {
                    const data = await api.getFullReportData(context.project.id);
                    if (context.trial) {
                        setBuilderData({ ...data, trials: data.trials.filter(t => t.id === context.trial.id) });
                    } else {
                        setBuilderData(data);
                    }
                } catch (error) {
                    notify.error("Gagal memuat data laporan lengkap.");
                } finally {
                    setIsProcessing(false);
                }
            } else {
                setBuilderData(null);
            }
        };
        fetchDataForReport();
    }, [context, apiReady, notify]);

    const handleLayoutChange = (newLayout) => {
        layoutRef.current = newLayout;
    };

    const handleSaveAsNew = () => {
        setIsSaveAsDialogOpen(true);
    };

    const handleConfirmSaveAs = (name) => {
        addLayout({ name, layout_object_json: JSON.stringify(layoutRef.current) });
        setIsSaveAsDialogOpen(false);
    };

    // PERBAIKAN: Logika Simpan Perubahan
    const handleUpdateCurrent = async () => {
        if (activeTemplate) {
            const updatedData = { ...activeTemplate, layout_object_json: JSON.stringify(layoutRef.current) };
            const success = await updateLayout(updatedData);
            if (success) {
                // Setelah berhasil menyimpan, muat ulang daftar dan setel ulang template aktif
                // untuk memastikan kita memiliki data terbaru.
                const updatedLayouts = await refreshLayouts();
                const reloadedTemplate = updatedLayouts.find(l => l.id === activeTemplate.id);
                if (reloadedTemplate) {
                    setActiveTemplate(reloadedTemplate);
                }
            }
        }
    };
    
    const handleDeleteCurrent = () => {
        if (activeTemplate) {
            deleteLayout(activeTemplate.id);
            setActiveTemplate(null);
        }
    };
    
    // BARU: Fungsi untuk mereset kanvas
    const handleNewTemplate = () => {
        setActiveTemplate(null);
    };

    const handleGenerateReport = async () => {
        if (!builderData) { notify.error("Pilih sebuah proyek atau trial terlebih dahulu untuk membuat laporan."); return; }
        if (layoutRef.current.length === 0 || layoutRef.current.every(page => page.length === 0)) { 
            notify.error("Layout laporan kosong. Seret komponen ke kanvas terlebih dahulu."); 
            return; 
        }
        setIsProcessing(true);
        try {
            await generatePdfFromLayout({ layout: layoutRef.current, reportData: builderData, settings });
            notify.success("Laporan PDF berhasil dibuat.");
        } catch (error) {
            notify.error(`Gagal membuat PDF: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="h-full flex flex-col">
                <header className="flex-shrink-0 p-4 border-b bg-card flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Report Builder
                            {activeTemplate && <span className="text-base font-normal text-muted-foreground ml-2">- {activeTemplate.name}</span>}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Laporan untuk: <span className="font-semibold">{builderData?.projectName || "Tidak ada proyek dipilih"}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline"><MoreVertical className="h-4 w-4 mr-2"/>Opsi Template</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi Template</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* BARU: Tombol Template Baru / Reset */}
                                <DropdownMenuItem onSelect={handleNewTemplate}>
                                    <FilePlus className="mr-2 h-4 w-4" />
                                    Template Baru / Reset
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Muat Template</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {layouts.map(layout => (
                                            <DropdownMenuItem key={layout.id} onSelect={() => setActiveTemplate(layout)}>
                                                {layout.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuItem onSelect={handleUpdateCurrent} disabled={!activeTemplate}>
                                    Simpan Perubahan
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleSaveAsNew}>
                                    Simpan Sebagai Baru...
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"
                                             aria-disabled={!activeTemplate}
                                             onClick={(e) => { if (!activeTemplate) e.preventDefault(); }}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus Template Ini
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Aksi ini akan menghapus template "{activeTemplate?.name}" secara permanen. Aksi ini tidak dapat dibatalkan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteCurrent}>Hapus</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleGenerateReport} disabled={isProcessing || !builderData}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                            Buat PDF
                        </Button>
                    </div>
                </header>
                
                <div className="flex-grow min-h-0">
                    {isProcessing && !builderData ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-4">Memuat data...</p></div>
                    ) : (
                        <ReportBuilderV2
                            key={activeTemplate ? activeTemplate.id : 'new'}
                            reportData={builderData}
                            settings={settings}
                            onLayoutChange={handleLayoutChange}
                            initialLayout={activeTemplate ? JSON.parse(activeTemplate.layout_object_json || '[]') : []}
                        />
                    )}
                </div>
            </div>
            <SaveAsDialog
                open={isSaveAsDialogOpen}
                onOpenChange={setIsSaveAsDialogOpen}
                onConfirm={handleConfirmSaveAs}
                activeTemplateName={activeTemplate?.name}
            />
        </>
    );
}
