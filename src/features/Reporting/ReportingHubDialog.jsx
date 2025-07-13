// Lokasi file: src/features/Reporting/ReportingHubDialog.js
// Deskripsi: Mengganti prompt() dengan dialog kustom yang konsisten.

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle,
    DialogTrigger, DialogDescription, DialogClose
} from '../../components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from '../../components/ui/dropdown-menu';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { FileDown, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import ReportBuilderV2 from './ReportBuilderV2';
import { generatePdfFromLayout } from '../../utils/pdfGenerator';
import { useReportLayouts } from '../../hooks/useReportLayouts';

// BARU: Komponen dialog kustom untuk "Simpan Sebagai"
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


export default function ReportingHubDialog({
    trigger,
    context,
    project,
    trial,
    apiReady,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { settings } = useSettings(apiReady);
    const { notify } = useNotifier();
    
    const [builderData, setBuilderData] = useState(null);
    const layoutRef = useRef([]);

    const { layouts, addLayout, updateLayout, deleteLayout } = useReportLayouts(apiReady);
    const [activeTemplate, setActiveTemplate] = useState(null);
    
    const [isSaveAsDialogOpen, setIsSaveAsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchDataForReport = async () => {
            if (isOpen && project?.id) {
                setIsProcessing(true);
                try {
                    const data = await api.getFullReportData(project.id);
                    if (context === 'trial' && trial) {
                        setBuilderData({ ...data, trials: data.trials.filter(t => t.id === trial.id) });
                    } else {
                        setBuilderData(data);
                    }
                } catch (error) {
                    notify.error("Gagal memuat data laporan lengkap.");
                } finally {
                    setIsProcessing(false);
                }
            }
        };
        fetchDataForReport();
    }, [isOpen, project, trial, context, apiReady, notify]);

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

    const handleUpdateCurrent = () => {
        if (activeTemplate) {
            updateLayout({ ...activeTemplate, layout_object_json: JSON.stringify(layoutRef.current) });
        }
    };
    
    const handleDeleteCurrent = () => {
        if (activeTemplate && window.confirm(`Anda yakin ingin menghapus template "${activeTemplate.name}"?`)) {
            deleteLayout(activeTemplate.id);
            setActiveTemplate(null);
        }
    };

    const handleGenerateReport = async () => {
        if (!builderData) { notify.error("Pilih proyek/trial untuk membuat laporan."); return; }
        if (layoutRef.current.length === 0) { notify.error("Layout laporan kosong."); return; }
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
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <DialogTitle className="text-2xl">
                                    Report Builder
                                    {activeTemplate && <span className="text-base font-normal text-muted-foreground ml-2">- {activeTemplate.name}</span>}
                                </DialogTitle>
                                <DialogDescription>
                                    Rancang laporan visual untuk: <span className="font-semibold">{project?.projectName || "Tidak ada proyek dipilih"}</span>
                                </DialogDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5"/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Aksi Template</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
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
                                    <DropdownMenuItem onSelect={handleDeleteCurrent} disabled={!activeTemplate} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus Template Ini
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </DialogHeader>
                    
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

                    <DialogFooter className="flex-shrink-0 pt-4 border-t">
                        <DialogClose asChild><Button variant="secondary">Tutup</Button></DialogClose>
                        <Button onClick={handleGenerateReport} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                            Buat PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SaveAsDialog
                open={isSaveAsDialogOpen}
                onOpenChange={setIsSaveAsDialogOpen}
                onConfirm={handleConfirmSaveAs}
                activeTemplateName={activeTemplate?.name}
            />
        </>
    );
}
