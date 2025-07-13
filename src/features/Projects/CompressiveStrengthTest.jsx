// Lokasi file: src/features/Projects/CompressiveStrengthTest.js
// Deskripsi: Rombak total alur kerja untuk manajemen benda uji yang lebih cerdas dan akurat.
// - Mengotomatiskan perhitungan tanggal & umur uji.
// - Menerapkan validasi input yang ketat.
// - Menampilkan lebih banyak informasi relevan di tabel utama.

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
// PERBAIKAN: Menambahkan DialogFooter ke dalam import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useConcreteTests } from '../../hooks/useConcreteTests';
import { Loader2, Hammer, CheckCircle, AlertCircle, Clock, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { cn } from '../../lib/utils';

// Helper untuk format tanggal
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- PEROMBAKAN TOTAL: SpecimenForm ---
const SpecimenForm = ({ onSave, isEditing = false, initialData = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State default untuk form tambah baru
    const defaultState = {
        specimen_id: '',
        casting_date: new Date().toISOString().split('T')[0],
        planned_age_days: '7', // Umur rencana
        diameter: '150',
        max_load: '',
        specimen_shape: 'Silinder',
        curing_method: 'Perendaman Air',
        // 'testing_date' dan 'status' akan dihitung secara dinamis
    };
    
    const [inputData, setInputData] = useState(defaultState);

    // Efek untuk mengisi form saat mode edit atau mereset saat dialog dibuka
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                setInputData({
                    ...defaultState,
                    ...initialData,
                    planned_age_days: initialData.age_days, // Gunakan umur dari DB sebagai umur rencana
                    ...initialData.input_data,
                });
            } else {
                setInputData(defaultState);
            }
        }
    }, [isOpen, isEditing, initialData]);

    // Kalkulasi dinamis berdasarkan input
    const derivedValues = useMemo(() => {
        const plannedAge = parseInt(inputData.planned_age_days, 10);
        let plannedTestDate = '';
        if (inputData.casting_date && !isNaN(plannedAge)) {
            const date = new Date(inputData.casting_date);
            date.setDate(date.getDate() + plannedAge);
            plannedTestDate = date.toISOString().split('T')[0];
        }

        const diameter = parseFloat(inputData.diameter);
        const maxLoad = parseFloat(inputData.max_load);
        let strength_MPa = null;
        if (diameter > 0 && maxLoad > 0) {
            const area = Math.PI * Math.pow(diameter / 2, 2);
            strength_MPa = (maxLoad * 1000) / area;
        }

        return { plannedTestDate, strength_MPa };
    }, [inputData.casting_date, inputData.planned_age_days, inputData.diameter, inputData.max_load]);
    
    // Validasi input yang ketat
    const validation = useMemo(() => {
        const errors = {};
        if (!inputData.specimen_id.trim()) errors.specimen_id = 'ID Benda Uji harus diisi.';
        if (parseInt(inputData.planned_age_days, 10) <= 0) errors.planned_age_days = 'Umur harus positif.';
        if (parseFloat(inputData.diameter) <= 0) errors.diameter = 'Diameter harus positif.';
        if (inputData.max_load && parseFloat(inputData.max_load) < 0) errors.max_load = 'Beban tidak boleh negatif.';
        return { isValid: Object.keys(errors).length === 0, errors };
    }, [inputData]);

    const handleSave = async () => {
        if (!validation.isValid) return;
        setIsSaving(true);
        
        const hasTestData = !!(inputData.max_load && parseFloat(inputData.max_load) > 0);
        
        const payload = {
            ...initialData, // Sertakan data awal jika edit
            specimen_id: inputData.specimen_id,
            casting_date: inputData.casting_date,
            age_days: parseInt(inputData.planned_age_days, 10), // Simpan umur rencana
            testing_date: hasTestData ? new Date().toISOString().split('T')[0] : derivedValues.plannedTestDate, // Gunakan tanggal aktual jika diuji
            specimen_shape: inputData.specimen_shape,
            curing_method: inputData.curing_method,
            test_type: 'compressive_strength',
            input_data_json: JSON.stringify({
                diameter: inputData.diameter,
                max_load: inputData.max_load || null,
            }),
            result_data_json: JSON.stringify(hasTestData ? { strength_MPa: derivedValues.strength_MPa } : {}),
            status: hasTestData ? 'Telah Diuji' : 'Dalam Perawatan',
        };

        try {
            const success = await onSave(payload);
            if (success) setIsOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil size={14} /></Button>
                ) : (
                    <Button>Tambah Benda Uji</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Benda Uji' : 'Tambah Benda Uji Baru'}</DialogTitle>
                    <DialogDescription>
                        Masukkan detail perencanaan. Hasil pengujian dapat diisi nanti dengan mengedit data ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
                    {/* Kolom Kiri: Perencanaan */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1">Perencanaan</h4>
                        <div>
                            <Label htmlFor="specimen_id">ID Benda Uji</Label>
                            <Input id="specimen_id" placeholder="Contoh: A1, B2" value={inputData.specimen_id} onChange={e => setInputData({...inputData, specimen_id: e.target.value})} />
                            {validation.errors.specimen_id && <p className="text-xs text-destructive mt-1">{validation.errors.specimen_id}</p>}
                        </div>
                        <div>
                            <Label htmlFor="casting_date">Tanggal Pengecoran</Label>
                            <Input id="casting_date" type="date" value={inputData.casting_date} onChange={e => setInputData({...inputData, casting_date: e.target.value})} />
                        </div>
                        <div>
                            <Label htmlFor="planned_age_days">Umur Uji Rencana (hari)</Label>
                            <Input id="planned_age_days" type="number" value={inputData.planned_age_days} onChange={e => setInputData({...inputData, planned_age_days: e.target.value})} />
                            {validation.errors.planned_age_days && <p className="text-xs text-destructive mt-1">{validation.errors.planned_age_days}</p>}
                        </div>
                        <div>
                            <Label>Tanggal Uji Rencana</Label>
                            <Input type="date" value={derivedValues.plannedTestDate} readOnly className="bg-muted/50" />
                        </div>
                    </div>

                    {/* Kolom Kanan: Properti & Hasil */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1">Properti & Hasil</h4>
                        <div>
                            <Label htmlFor="specimen_shape">Bentuk Benda Uji</Label>
                            <Select value={inputData.specimen_shape} onValueChange={val => setInputData({...inputData, specimen_shape: val})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Silinder">Silinder</SelectItem><SelectItem value="Kubus">Kubus</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="diameter">Diameter/Sisi (mm)</Label>
                            <Input id="diameter" type="number" value={inputData.diameter} onChange={e => setInputData({...inputData, diameter: e.target.value})} />
                             {validation.errors.diameter && <p className="text-xs text-destructive mt-1">{validation.errors.diameter}</p>}
                        </div>
                        <div>
                            <Label htmlFor="max_load">Beban Maksimum (kN)</Label>
                            <Input id="max_load" type="number" value={inputData.max_load} onChange={e => setInputData({...inputData, max_load: e.target.value})} placeholder="Isi untuk menghitung kekuatan" />
                            {validation.errors.max_load && <p className="text-xs text-destructive mt-1">{validation.errors.max_load}</p>}
                        </div>
                        <div className="pt-2">
                            <h4 className="font-semibold">Hasil Kuat Tekan</h4>
                            <p className="text-2xl font-bold">{derivedValues.strength_MPa?.toFixed(2) || '-'} MPa</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={!validation.isValid || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Komponen utama
export default function CompressiveStrengthTest({ trial, chartRef }) {
    const { tests, addTest, updateTest, deleteTest } = useConcreteTests(trial?.id);

    const chartData = useMemo(() => {
        const testedSpecimens = tests.filter(t => t.status === 'Telah Diuji');
        if (testedSpecimens.length === 0) return [];
        
        const grouped = testedSpecimens.reduce((acc, test) => {
            const age = test.age_days;
            if (!acc[age]) acc[age] = { age, totalStrength: 0, count: 0 };
            acc[age].totalStrength += test.result_data.strength_MPa || 0;
            acc[age].count++;
            return acc;
        }, {});

        return Object.values(grouped).map(group => ({
            age: group.age,
            strength: group.totalStrength / group.count
        })).sort((a, b) => a.age - b.age);
    }, [tests]);

    const getStatusBadge = (test) => {
        if (test.status === 'Telah Diuji') {
            return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> {test.status}</Badge>;
        }
        const today = new Date().setHours(0, 0, 0, 0);
        const testDate = new Date(test.testing_date).setHours(0, 0, 0, 0);
        if (today >= testDate) {
            return <Badge variant="warning"><AlertCircle className="mr-1 h-3 w-3" /> Siap Uji</Badge>;
        }
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> {test.status}</Badge>;
    };

    return (
        <div>
            <h3 className="font-bold text-lg mb-4">Grafik Perkembangan Kuat Tekan</h3>
            <div ref={chartRef} className="h-72 w-full bg-muted/30 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" type="number" domain={['dataMin', 'dataMax']} label={{ value: 'Umur (hari)', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Kuat Tekan (MPa)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)} MPa`} />
                        <Legend verticalAlign="top" />
                        <Line type="monotone" dataKey="strength" name="Kuat Tekan Rata-rata" stroke="#16a34a" strokeWidth={2} />
                        {trial?.design_result?.fcr && (
                            <ReferenceLine y={trial.design_result.fcr} label={{ value: `Target f'cr: ${trial.design_result.fcr.toFixed(2)} MPa`, position: 'insideTopLeft' }} stroke="#ef4444" strokeDasharray="3 3" />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center mt-6 mb-4">
                <h3 className="font-semibold">Manajemen Benda Uji</h3>
                <SpecimenForm onSave={isEditing => isEditing ? updateTest : addTest} />
            </div>
            {tests.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Hammer className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Benda Uji</h4>
                    <p className="text-muted-foreground text-sm">Klik "Tambah Benda Uji" untuk mencatat data benda uji pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal Cor</TableHead>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Umur (hari)</TableHead>
                            <TableHead className="text-right">Kuat Tekan (MPa)</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell className="font-medium">{test.specimen_id}</TableCell>
                                <TableCell>{getStatusBadge(test)}</TableCell>
                                <TableCell>{formatDate(test.casting_date)}</TableCell>
                                <TableCell>{formatDate(test.testing_date)}</TableCell>
                                <TableCell>{test.age_days}</TableCell>
                                <TableCell className="text-right font-medium">{test.result_data.strength_MPa?.toFixed(2) || '-'}</TableCell>
                                <TableCell className="flex justify-center items-center gap-1">
                                    <SpecimenForm onSave={updateTest} isEditing={true} initialData={test} />
                                    <SecureDeleteDialog
                                        trigger={<Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 size={14} /></Button>}
                                        title="Hapus Benda Uji?"
                                        description={`Aksi ini akan menghapus data benda uji "${test.specimen_id}" secara permanen.`}
                                        confirmationText="HAPUS"
                                        onConfirm={() => deleteTest(test.id)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
