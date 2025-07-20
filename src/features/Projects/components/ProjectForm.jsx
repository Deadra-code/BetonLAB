// Lokasi file: src/features/Projects/components/ProjectForm.jsx
// Deskripsi: Dirombak total menjadi komponen Wizard multi-langkah untuk pembuatan proyek
// yang lebih cepat dan terpandu, mengimplementasikan Rancangan Efisiensi #1.

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { useNotifier } from '../../../hooks/useNotifier';
import { useProjects } from '../../../hooks/useProjects'; // Impor untuk mengambil proyek yang ada
import { Stepper } from '../../../components/ui/Stepper';

// Komponen Wizard Utama
export const ProjectForm = ({ project, onSave, children, apiReady }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const { notify } = useNotifier();
    const isEditing = !!project?.id;

    // Hook untuk memuat proyek yang ada, untuk fitur "Gunakan data dari"
    const { projects } = useProjects(apiReady);

    const STEPS = ["Tipe & Klien", "Detail Permohonan", "Catatan & PIC"];

    // Inisialisasi form saat dialog dibuka
    useEffect(() => {
        if (isOpen) {
            const initialData = {
                projectType: 'jmd',
                projectName: project?.projectName || '',
                clientName: project?.clientName || '',
                clientAddress: project?.clientAddress || '',
                clientContactPerson: project?.clientContactPerson || '',
                clientContactNumber: project?.clientContactNumber || '',
                requestNumber: project?.requestNumber || '',
                requestDate: project?.requestDate || new Date().toISOString().split('T')[0],
                testingRequests: project?.testingRequests || '',
                projectNotes: project?.projectNotes || '',
                assignedTo: project?.assignedTo || '',
            };
            setFormData(initialData);
            setStep(1); // Selalu mulai dari langkah 1
        }
    }, [isOpen, project]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    // Fungsi untuk mengisi data dari proyek yang sudah ada
    const handleUsePreviousProject = (projectId) => {
        const selectedProject = projects.find(p => p.id === parseInt(projectId));
        if (selectedProject) {
            setFormData(prev => ({
                ...prev,
                clientName: selectedProject.clientName,
                clientAddress: selectedProject.clientAddress,
                clientContactPerson: selectedProject.clientContactPerson,
                clientContactNumber: selectedProject.clientContactNumber,
            }));
            notify.success("Data klien berhasil dimuat.");
        }
    };

    const handleSave = async () => {
        if (!formData.projectName.trim()) {
            notify.error("Nama Proyek harus diisi.");
            setStep(1); // Arahkan pengguna ke langkah yang error
            return;
        }
        setIsSaving(true);
        const success = await onSave({ ...project, ...formData });
        if (success) {
            setIsOpen(false);
        }
        setIsSaving(false);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    // Validasi per langkah untuk mengaktifkan tombol "Berikutnya"
    const isStepValid = () => {
        if (step === 1) return formData.projectName?.trim() && formData.clientName?.trim();
        if (step === 2) return formData.requestNumber?.trim() && formData.requestDate;
        return true; // Langkah terakhir selalu valid
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Edit Proyek: ${project.projectName}` : 'Wizard Pembuatan Proyek Baru'}</DialogTitle>
                    <div className="pt-4">
                        <Stepper steps={STEPS} currentStep={step} />
                    </div>
                </DialogHeader>
                
                <div className="py-4 min-h-[350px]">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in-down">
                            <h3 className="font-semibold">Langkah 1: Tipe Proyek & Informasi Klien</h3>
                            <div><Label>Tipe Proyek</Label><Select value={formData.projectType} onValueChange={v => handleChange('projectType', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="jmd">JMD Beton</SelectItem><SelectItem value="material_testing">Uji Material Saja</SelectItem><SelectItem value="qc">Quality Control</SelectItem></SelectContent></Select></div>
                            <div><Label>Nama Proyek</Label><Input value={formData.projectName} onChange={e => handleChange('projectName', e.target.value)} placeholder="Contoh: JMD Gedung ABC Tower"/></div>
                            <hr className="my-4"/>
                            <div>
                                <Label>Gunakan Data Klien dari Proyek Lain (Opsional)</Label>
                                <Select onValueChange={handleUsePreviousProject}>
                                    <SelectTrigger><SelectValue placeholder="Pilih proyek yang ada..."/></SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.projectName} - {p.clientName}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Nama Klien</Label><Input value={formData.clientName} onChange={e => handleChange('clientName', e.target.value)}/></div>
                        </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-4 animate-fade-in-down">
                            <h3 className="font-semibold">Langkah 2: Detail Permohonan dari Klien</h3>
                            <div><Label>Nomor Surat Permohonan</Label><Input value={formData.requestNumber} onChange={e => handleChange('requestNumber', e.target.value)} /></div>
                            <div><Label>Tanggal Surat Permohonan</Label><Input type="date" value={formData.requestDate} onChange={e => handleChange('requestDate', e.target.value)} /></div>
                            <div><Label>Detail Permintaan Pengujian</Label><Textarea value={formData.testingRequests} onChange={e => handleChange('testingRequests', e.target.value)} placeholder="Contoh: Uji kuat tekan umur 7, 14, dan 28 hari..." /></div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in-down">
                            <h3 className="font-semibold">Langkah 3: Catatan Internal & Penanggung Jawab</h3>
                            <div><Label>Ditugaskan kepada (PIC)</Label><Input value={formData.assignedTo} onChange={e => handleChange('assignedTo', e.target.value)} placeholder="Nama penanggung jawab..." /></div>
                            <div><Label>Catatan Proyek (Internal)</Label><Textarea value={formData.projectNotes} onChange={e => handleChange('projectNotes', e.target.value)} placeholder="Catatan internal mengenai proyek..." /></div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between w-full">
                    <div>
                        {step > 1 && <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4"/> Kembali</Button>}
                    </div>
                    <div className="flex gap-2">
                        {step < STEPS.length && <Button onClick={nextStep} disabled={!isStepValid()}>Berikutnya <ArrowRight className="ml-2 h-4 w-4"/></Button>}
                        {step === STEPS.length && <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />} {isEditing ? 'Simpan Perubahan' : 'Simpan Proyek'}</Button>}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
