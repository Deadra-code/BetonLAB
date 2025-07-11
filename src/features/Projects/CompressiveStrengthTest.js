import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useConcreteTests } from '../../hooks/useConcreteTests';
import { Loader2, Hammer, CheckCircle, AlertCircle, Clock, Pencil, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';

// Form untuk Create dan Update
const SpecimenForm = ({ onSave, isEditing = false, initialData = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const defaultState = {
        specimen_id: '',
        casting_date: new Date().toISOString().split('T')[0],
        age_days: '7',
        testing_date: '',
        diameter: '150',
        max_load: '',
        specimen_shape: 'Silinder',
        curing_method: 'Perendaman Air',
        status: 'Dalam Perawatan',
    };
    
    const sanitizeData = (data) => {
        const sanitized = { ...defaultState, ...data };
        for (const key in sanitized) {
            if (sanitized[key] === null || sanitized[key] === undefined) {
                sanitized[key] = '';
            }
        }
        if (data && data.input_data) {
            Object.assign(sanitized, data.input_data);
        }
        return sanitized;
    };

    const [inputData, setInputData] = useState(defaultState);
    
    useEffect(() => {
        if (isOpen) {
            setInputData(isEditing ? sanitizeData(initialData) : defaultState);
        }
    }, [isOpen, isEditing, initialData]);


    const handleChange = (field, value) => {
        setInputData(prev => ({ ...prev, [field]: value }));
    };

    const calculation = useMemo(() => {
        const { diameter, max_load } = inputData;
        if (!diameter || !max_load || parseFloat(diameter) <= 0) return {};
        const area = Math.PI * Math.pow(parseFloat(diameter) / 2, 2);
        const strength_MPa = (parseFloat(max_load) * 1000) / area;
        return { strength_MPa };
    }, [inputData]);

    const canSave = useMemo(() => {
        return inputData.specimen_id.trim() !== '';
    }, [inputData]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            const hasTestData = inputData.max_load && parseFloat(inputData.max_load) > 0;
            const payload = {
                ...inputData,
                age_days: parseInt(inputData.age_days) || 0,
                test_type: 'compressive_strength',
                input_data_json: JSON.stringify({
                    diameter: inputData.diameter,
                    max_load: inputData.max_load,
                }),
                result_data_json: JSON.stringify(hasTestData ? calculation : {}),
                status: hasTestData ? 'Telah Diuji' : inputData.status,
            };
            const success = await onSave(payload);
            if (success) {
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Failed to save specimen:", error);
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
                        Masukkan detail benda uji. Anda dapat menambahkan hasil pengujian nanti dengan mengedit.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-3">
                        <Label>ID Benda Uji</Label>
                        <Input placeholder="Contoh: A1, B2" value={inputData.specimen_id} onChange={e => handleChange('specimen_id', e.target.value)} />
                        <Label>Tanggal Pengecoran</Label>
                        <Input type="date" value={inputData.casting_date} onChange={e => handleChange('casting_date', e.target.value)} />
                        <Label>Bentuk Benda Uji</Label>
                        <Select value={inputData.specimen_shape} onValueChange={val => handleChange('specimen_shape', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Silinder">Silinder</SelectItem>
                                <SelectItem value="Kubus">Kubus</SelectItem>
                            </SelectContent>
                        </Select>
                        <Label>Metode Perawatan</Label>
                        <Select value={inputData.curing_method} onValueChange={val => handleChange('curing_method', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Perendaman Air">Perendaman Air</SelectItem>
                                <SelectItem value="Karung Basah">Karung Basah</SelectItem>
                                <SelectItem value="Steam Curing">Steam Curing</SelectItem>
                                <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label>Umur Uji (hari)</Label>
                        <Input type="number" value={inputData.age_days} onChange={e => handleChange('age_days', e.target.value)} />
                        <Label>Tanggal Uji</Label>
                        <Input type="date" value={inputData.testing_date} onChange={e => handleChange('testing_date', e.target.value)} />
                        <Label>Diameter/Sisi (mm)</Label>
                        <Input type="number" value={inputData.diameter} onChange={e => handleChange('diameter', e.target.value)} />
                        <Label>Beban Maksimum (kN)</Label>
                        <Input type="number" value={inputData.max_load} onChange={e => handleChange('max_load', e.target.value)} placeholder="Isi untuk menghitung kekuatan" />
                        <div className="mt-4">
                            <h4 className="font-semibold">Hasil Kuat Tekan</h4>
                            <p className="text-2xl font-bold">{calculation.strength_MPa?.toFixed(2) || '-'} MPa</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={!canSave || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Simpan
                    </Button>
                </div>
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
            if (!acc[age]) {
                acc[age] = { age, totalStrength: 0, count: 0 };
            }
            const result = test.result_data;
            acc[age].totalStrength += result.strength_MPa || 0;
            acc[age].count++;
            return acc;
        }, {});

        return Object.values(grouped)
            .map(group => ({
                age: group.age,
                strength: group.totalStrength / group.count
            }))
            .sort((a, b) => a.age - b.age);
    }, [tests]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Telah Diuji':
                return <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
            case 'Siap Uji':
                return <Badge variant="warning"><AlertCircle className="mr-1 h-3 w-3" /> {status}</Badge>;
            case 'Dalam Perawatan':
            default:
                return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> {status}</Badge>;
        }
    };

    return (
        <div>
            <h3 className="font-bold text-lg mb-4">Grafik Perkembangan Kuat Tekan</h3>
            <div ref={chartRef} className="h-72 w-full bg-muted/30 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                    {/* PERBAIKAN: Menambahkan margin atas menjadi 20 untuk memberi ruang pada legenda dan label */}
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
                <SpecimenForm onSave={addTest} />
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
                            <TableHead>ID Benda Uji</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Bentuk</TableHead>
                            <TableHead>Umur (hari)</TableHead>
                            <TableHead className="text-right">Kuat Tekan (MPa)</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell className="font-medium">{test.specimen_id}</TableCell>
                                <TableCell>{getStatusBadge(test.status)}</TableCell>
                                <TableCell>{test.specimen_shape}</TableCell>
                                <TableCell>{test.age_days}</TableCell>
                                <TableCell className="text-right font-medium">{test.result_data.strength_MPa?.toFixed(2) || '-'}</TableCell>
                                <TableCell className="flex justify-center items-center gap-1">
                                    <SpecimenForm onSave={updateTest} isEditing={true} initialData={test} />
                                    <SecureDeleteDialog
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                <Trash2 size={14} />
                                            </Button>
                                        }
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
