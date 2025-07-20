// Lokasi file: src/features/SampleManagement/SampleReceptionPage.jsx
// Deskripsi: Halaman penerimaan sampel kini dilengkapi dengan "Generator Benda Uji Massal"
// untuk mempercepat input data berulang, mengimplementasikan Rancangan Efisiensi #2.

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { useProjects } from '../../hooks/useProjects';
import { useTrials } from '../../hooks/useTrials';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import { useAuthStore } from '../../hooks/useAuth';
import { PlusCircle, Trash2, Loader2, Sparkles } from 'lucide-react';

// --- KOMPONEN BARU: Dialog untuk Generator Benda Uji ---
const SpecimenGeneratorDialog = ({ onGenerate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [countPerAge, setCountPerAge] = useState('3');
    const [ages, setAges] = useState('7, 14, 28');
    const { notify } = useNotifier();

    const handleGenerate = () => {
        const ageArray = ages.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a) && a > 0);
        const count = parseInt(countPerAge);

        if (ageArray.length === 0 || isNaN(count) || count <= 0) {
            notify.error("Input tidak valid. Pastikan jumlah dan umur diisi dengan benar.");
            return;
        }

        onGenerate(count, ageArray);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm"><Sparkles className="mr-2 h-4 w-4" /> Generate Set</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generator Benda Uji Massal</DialogTitle>
                    <CardDescription>Buat beberapa benda uji dengan pola umur yang sama secara otomatis.</CardDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div><Label>Jumlah Benda Uji per Umur</Label><Input type="number" value={countPerAge} onChange={e => setCountPerAge(e.target.value)} /></div>
                    <div><Label>Umur Pengujian (hari, pisahkan dengan koma)</Label><Input value={ages} onChange={e => setAges(e.target.value)} placeholder="Contoh: 7, 14, 28"/></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleGenerate}>Generate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function SampleReceptionPage({ apiReady }) {
    const { user } = useAuthStore();
    const location = useLocation();
    const { projects } = useProjects(apiReady);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const { trials } = useTrials(selectedProjectId);
    const { notify } = useNotifier();
    
    // State baru untuk menampung trialId yang dipilih dari navigasi
    const [selectedTrialId, setSelectedTrialId] = useState(null);

    const [receptionData, setReceptionData] = useState({
        reception_date: new Date().toISOString().split('T')[0],
        submitted_by: '',
        notes: ''
    });
    const [specimens, setSpecimens] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const { state } = location;
        if (state && state.projectId) {
            setSelectedProjectId(state.projectId.toString());
            if (state.trialId) {
                setSelectedTrialId(state.trialId);
            }
        }
    }, [location]);

    // Effect untuk auto-add specimen ketika datang dari JMD
    useEffect(() => {
        // Pastikan kita punya trialId, daftar trial sudah ter-load, dan belum ada spesimen
        if (selectedTrialId && trials.length > 0 && specimens.length === 0) {
            // Cek apakah trial yang dimaksud ada di dalam daftar
            const trialExists = trials.some(t => t.id === selectedTrialId);
            if (trialExists) {
                handleAddSpecimen(selectedTrialId);
                // Reset selectedTrialId agar tidak memicu lagi jika komponen re-render
                setSelectedTrialId(null); 
            }
        }
    }, [selectedTrialId, trials, specimens.length]);

    const handleAddSpecimen = (trialId = null) => {
        const targetTrialId = trialId || (trials.length > 0 ? trials[0].id : null);
        if (!selectedProjectId || !targetTrialId) {
            notify.error("Pilih proyek dan pastikan proyek memiliki trial mix terlebih dahulu.");
            return;
        }
        setSpecimens([...specimens, {
            key: Date.now(),
            trial_id: targetTrialId,
            specimen_id: '',
            casting_date: new Date().toISOString().split('T')[0],
            age_days: 7,
            specimen_shape: 'Silinder',
        }]);
    };

    // --- FUNGSI BARU: Menerima hasil dari generator ---
    const handleGenerateSpecimens = (count, ages) => {
        if (!selectedProjectId || trials.length === 0) {
            notify.error("Pilih proyek dan trial mix terlebih dahulu.");
            return;
        }
        const newSpecimens = [];
        const prefixMap = { 7: 'A', 14: 'B', 28: 'C', 3: 'X', 56: 'D' };
        
        ages.forEach(age => {
            for (let i = 1; i <= count; i++) {
                const prefix = prefixMap[age] || 'Z';
                newSpecimens.push({
                    key: Date.now() + age + i,
                    trial_id: trials[0].id,
                    specimen_id: `${prefix}${i}`,
                    casting_date: new Date().toISOString().split('T')[0],
                    age_days: age,
                    specimen_shape: 'Silinder',
                });
            }
        });
        setSpecimens(prev => [...prev, ...newSpecimens]);
        notify.success(`${newSpecimens.length} benda uji berhasil digenerate.`);
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
                    project_id: parseInt(selectedProjectId),
                    received_by_user_id: user.id
                },
                specimens: specimens.map(spec => ({
                    ...spec,
                    lab_id: `${projects.find(p => p.id === parseInt(selectedProjectId))?.projectName?.substring(0,4).toUpperCase() || 'PROJ'}-${spec.specimen_id}`
                }))
            });
            notify.success("Batch sampel berhasil diterima dan dicatat.");
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
                    <CardHeader><CardTitle>Informasi Penerimaan</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div><Label>Proyek Terkait</Label><Select value={selectedProjectId} onValueChange={(val) => setSelectedProjectId(val)}><SelectTrigger><SelectValue placeholder="Pilih Proyek..." /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.projectName}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Tanggal Penerimaan</Label><Input type="date" value={receptionData.reception_date} onChange={e => setReceptionData({...receptionData, reception_date: e.target.value})} /></div>
                        <div><Label>Diserahkan Oleh (dari Klien)</Label><Input value={receptionData.submitted_by} onChange={e => setReceptionData({...receptionData, submitted_by: e.target.value})} placeholder="Nama pengantar..."/></div>
                        <div><Label>Catatan Penerimaan</Label><Textarea value={receptionData.notes} onChange={e => setReceptionData({...receptionData, notes: e.target.value})} placeholder="Kondisi sampel, dll..."/></div>
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Daftar Benda Uji Diterima</CardTitle>
                                <div className="flex gap-2">
                                    {/* Tombol Generator Baru */}
                                    <SpecimenGeneratorDialog onGenerate={handleGenerateSpecimens} />
                                    <Button onClick={handleAddSpecimen} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Tambah Manual</Button>
                                </div>
                            </div>
                            <CardDescription>Masukkan detail untuk setiap benda uji yang diterima dalam batch ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {specimens.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada benda uji ditambahkan.</p>}
                            {specimens.map((spec, index) => (
                                <div key={spec.key} className="grid grid-cols-6 gap-3 p-3 border rounded-lg items-end">
                                    <div className="col-span-2"><Label>Trial Mix</Label><Select value={spec.trial_id.toString()} onValueChange={val => handleSpecimenChange(index, 'trial_id', parseInt(val))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{trials.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.trial_name}</SelectItem>)}</SelectContent></Select></div>
                                    <div><Label>ID Sampel</Label><Input value={spec.specimen_id} onChange={e => handleSpecimenChange(index, 'specimen_id', e.target.value)} placeholder="e.g., A1"/></div>
                                    <div><Label>Tgl. Cor</Label><Input type="date" value={spec.casting_date} onChange={e => handleSpecimenChange(index, 'casting_date', e.target.value)}/></div>
                                    <div><Label>Umur (hari)</Label><Input type="number" value={spec.age_days} onChange={e => handleSpecimenChange(index, 'age_days', parseInt(e.target.value))}/></div>
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
