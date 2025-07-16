// Lokasi file: src/features/SampleManagement/SampleReceptionPage.jsx
// Deskripsi: Halaman baru untuk Penyelia/Admin mencatat penerimaan sampel.

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { useProjects } from '../../hooks/useProjects';
import { useTrials } from '../../hooks/useTrials';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import { useAuthStore } from '../../hooks/useAuth';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

export default function SampleReceptionPage({ apiReady }) {
    const { user } = useAuthStore();
    const { projects } = useProjects(apiReady);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const { trials } = useTrials(selectedProjectId);
    const { notify } = useNotifier();

    const [receptionData, setReceptionData] = useState({
        reception_date: new Date().toISOString().split('T')[0],
        submitted_by: '',
        notes: ''
    });
    const [specimens, setSpecimens] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddSpecimen = () => {
        if (!selectedProjectId || trials.length === 0) {
            notify.error("Pilih proyek dan pastikan proyek memiliki trial mix terlebih dahulu.");
            return;
        }
        setSpecimens([...specimens, {
            key: Date.now(), // Kunci unik untuk rendering list
            trial_id: trials[0].id,
            specimen_id: '',
            casting_date: new Date().toISOString().split('T')[0],
            age_days: 7,
            specimen_shape: 'Silinder',
        }]);
    };

    const handleSpecimenChange = (index, field, value) => {
        const updatedSpecimens = [...specimens];
        updatedSpecimens[index][field] = value;
        setSpecimens(updatedSpecimens);
    };
    
    const handleRemoveSpecimen = (index) => {
        const updatedSpecimens = [...specimens];
        updatedSpecimens.splice(index, 1);
        setSpecimens(updatedSpecimens);
    };

    const handleSubmit = async () => {
        if (!selectedProjectId || specimens.length === 0) {
            notify.error("Proyek dan minimal satu benda uji harus diisi.");
            return;
        }
        setIsLoading(true);
        try {
            await api.createSampleReception({
                receptionData: {
                    ...receptionData,
                    project_id: selectedProjectId,
                    received_by_user_id: user.id
                },
                specimens: specimens.map(spec => ({
                    ...spec,
                    lab_id: `${projects.find(p => p.id === selectedProjectId)?.projectName?.substring(0,4).toUpperCase() || 'PROJ'}-${spec.specimen_id}`
                }))
            });
            notify.success("Batch sampel berhasil diterima dan dicatat.");
            // Reset form
            setSelectedProjectId('');
            setSpecimens([]);
            setReceptionData({ reception_date: new Date().toISOString().split('T')[0], submitted_by: '', notes: '' });
        } catch (error) {
            notify.error(`Gagal menyimpan: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 h-full">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Penerimaan Sampel</h1>
                <p className="text-muted-foreground">Catat sampel atau benda uji yang diterima dari klien.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Informasi Penerimaan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Proyek Terkait</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger><SelectValue placeholder="Pilih Proyek..." /></SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tanggal Penerimaan</Label>
                            <Input type="date" value={receptionData.reception_date} onChange={e => setReceptionData({...receptionData, reception_date: e.target.value})} />
                        </div>
                        <div>
                            <Label>Diserahkan Oleh (dari Klien)</Label>
                            <Input value={receptionData.submitted_by} onChange={e => setReceptionData({...receptionData, submitted_by: e.target.value})} placeholder="Nama pengantar..."/>
                        </div>
                         <div>
                            <Label>Catatan Penerimaan</Label>
                            <Textarea value={receptionData.notes} onChange={e => setReceptionData({...receptionData, notes: e.target.value})} placeholder="Kondisi sampel, dll..."/>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Daftar Benda Uji Diterima</CardTitle>
                                <Button onClick={handleAddSpecimen} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Tambah Benda Uji</Button>
                            </div>
                            <CardDescription>Masukkan detail untuk setiap benda uji yang diterima dalam batch ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {specimens.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada benda uji ditambahkan.</p>}
                            {specimens.map((spec, index) => (
                                <div key={spec.key} className="grid grid-cols-6 gap-3 p-3 border rounded-lg items-end">
                                    <div className="col-span-2"><Label>Trial Mix</Label><Select value={spec.trial_id} onValueChange={val => handleSpecimenChange(index, 'trial_id', val)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{trials.map(t => <SelectItem key={t.id} value={t.id}>{t.trial_name}</SelectItem>)}</SelectContent></Select></div>
                                    <div><Label>ID Sampel</Label><Input value={spec.specimen_id} onChange={e => handleSpecimenChange(index, 'specimen_id', e.target.value)} placeholder="e.g., A1"/></div>
                                    <div><Label>Tgl. Cor</Label><Input type="date" value={spec.casting_date} onChange={e => handleSpecimenChange(index, 'casting_date', e.target.value)}/></div>
                                    <div><Label>Umur (hari)</Label><Input type="number" value={spec.age_days} onChange={e => handleSpecimenChange(index, 'age_days', e.target.value)}/></div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSpecimen(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSubmit} disabled={isLoading || specimens.length === 0}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Batch Penerimaan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
