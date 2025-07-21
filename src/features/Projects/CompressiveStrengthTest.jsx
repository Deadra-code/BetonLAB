// Lokasi file: src/features/Projects/CompressiveStrengthTest.jsx
// Deskripsi: Form input hasil uji kini memiliki dropdown untuk memilih peralatan yang digunakan,
// lengkap dengan peringatan jika kalibrasi alat sudah kedaluwarsa (Rancangan Efisiensi #4).

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useConcreteTests } from '../../hooks/useConcreteTests';
import { Loader2, Hammer, CheckCircle, AlertCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { cn } from '../../lib/utils';
import { useEquipment } from '../../hooks/useEquipment'; // Impor hook equipment

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Form ini sekarang hanya digunakan untuk mengedit/memasukkan hasil pengujian.
export const SpecimenForm = ({ onSave, isEditing = false, initialData = null, apiReady }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // --- RANCANGAN #4: State untuk Peralatan ---
    const { equipment } = useEquipment(apiReady);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
    const [calibrationWarning, setCalibrationWarning] = useState('');

    const defaultState = {
        specimen_id: '',
        casting_date: new Date().toISOString().split('T')[0],
        planned_age_days: '7',
        diameter: '150',
        max_load: '',
        specimen_shape: 'Silinder',
        curing_method: 'Perendaman Air',
        testedBy: '',
        checkedBy: '',
        testMethod: 'SNI 1974:2011',
    };
    
    const [inputData, setInputData] = useState(defaultState);

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                const initialEqId = initialData.input_data?.equipment_id || '';
                setInputData({
                    ...defaultState,
                    ...initialData,
                    planned_age_days: initialData.age_days,
                    ...initialData.input_data,
                });
                setSelectedEquipmentId(initialEqId);
            } else {
                setInputData(defaultState);
                setSelectedEquipmentId('');
            }
        }
    }, [isOpen, isEditing, initialData]);

    // --- RANCANGAN #4: Cek status kalibrasi saat alat dipilih ---
    useEffect(() => {
        const selectedEq = equipment.find(e => e.id === parseInt(selectedEquipmentId));
        if (selectedEq) {
            const today = new Date().setHours(0, 0, 0, 0);
            const nextCalDate = new Date(selectedEq.next_calibration_date).setHours(0, 0, 0, 0);
            if (nextCalDate < today) {
                setCalibrationWarning(`Peringatan: Kalibrasi alat "${selectedEq.name}" telah kedaluwarsa pada ${formatDate(selectedEq.next_calibration_date)}.`);
            } else {
                setCalibrationWarning('');
            }
        } else {
            setCalibrationWarning('');
        }
    }, [selectedEquipmentId, equipment]);


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
            ...initialData,
            specimen_id: inputData.specimen_id,
            casting_date: inputData.casting_date,
            age_days: parseInt(inputData.planned_age_days, 10),
            testing_date: hasTestData ? new Date().toISOString().split('T')[0] : derivedValues.plannedTestDate,
            specimen_shape: inputData.specimen_shape,
            curing_method: inputData.curing_method,
            test_type: 'compressive_strength',
            input_data_json: JSON.stringify({ 
                diameter: inputData.diameter, 
                max_load: inputData.max_load || null,
                equipment_id: selectedEquipmentId || null // Simpan ID alat
            }),
            result_data_json: JSON.stringify(hasTestData ? { strength_MPa: derivedValues.strength_MPa } : {}),
            status: hasTestData ? 'Telah Diuji' : 'Dalam Perawatan',
            testedBy: inputData.testedBy,
            checkedBy: inputData.checkedBy,
            testMethod: inputData.testMethod,
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
                <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil size={14} /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Lembar Data Uji Tekan</DialogTitle>
                    <DialogDescription>Masukkan atau perbarui hasil pengujian untuk benda uji ini.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1">Data Benda Uji</h4>
                        <div><Label>ID Benda Uji</Label><Input value={inputData.specimen_id} readOnly className="bg-muted/50"/></div>
                        <div><Label>Tanggal Pengecoran</Label><Input type="date" value={inputData.casting_date} readOnly className="bg-muted/50"/></div>
                        <div><Label>Umur Uji Rencana (hari)</Label><Input type="number" value={inputData.planned_age_days} readOnly className="bg-muted/50"/></div>
                         <div><Label>Tanggal Uji Rencana</Label><Input type="date" value={derivedValues.plannedTestDate} readOnly className="bg-muted/50" /></div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground border-b pb-1">Hasil Pengujian</h4>
                        <div>
                            <Label>Alat Uji Tekan</Label>
                            <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                                <SelectTrigger><SelectValue placeholder="Pilih alat..."/></SelectTrigger>
                                <SelectContent>
                                    {equipment.map(eq => <SelectItem key={eq.id} value={eq.id.toString()}>{eq.name} ({eq.serial_number})</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {calibrationWarning && <p className="text-xs text-destructive mt-1">{calibrationWarning}</p>}
                        </div>
                        <div><Label>Diameter/Sisi (mm)</Label><Input type="number" value={inputData.diameter} onChange={e => setInputData({...inputData, diameter: e.target.value})} /></div>
                        <div><Label>Beban Maksimum (kN)</Label><Input type="number" value={inputData.max_load} onChange={e => setInputData({...inputData, max_load: e.target.value})} placeholder="Isi untuk menghitung kekuatan" /></div>
                        <div className="pt-2">
                            <h4 className="font-semibold">Hasil Kuat Tekan</h4>
                            <p className="text-2xl font-bold">{derivedValues.strength_MPa?.toFixed(2) || '-'} MPa</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
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
export default function CompressiveStrengthTest({ trial, chartRef, apiReady }) { // Tambahkan prop apiReady
    const { tests, updateTest, deleteTest } = useConcreteTests(trial?.id);

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
            </div>
            {tests.length === 0 ? (
                 <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Hammer className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Benda Uji</h4>
                    <p className="text-muted-foreground text-sm">Benda uji untuk trial ini dapat ditambahkan melalui menu "Penerimaan Sampel".</p>
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
                                    <SpecimenForm onSave={updateTest} isEditing={true} initialData={test} apiReady={apiReady} />
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
