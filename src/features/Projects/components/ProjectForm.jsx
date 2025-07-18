// Lokasi file: src/features/Projects/components/ProjectForm.jsx
// Deskripsi: Komponen form untuk menambah dan mengedit proyek, kini dalam filenya sendiri.

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { ChevronDown, Upload } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Textarea } from '../../../components/ui/textarea';
import { cn } from '../../../lib/utils';
import { useNotifier } from '../../../hooks/useNotifier';
import * as api from '../../../api/electronAPI';

export const ProjectForm = ({ project, onSave, children }) => {
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
