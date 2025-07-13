import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Loader2, Archive } from 'lucide-react'; // PENINGKATAN: Import ikon

// Form untuk menambah data uji baru
const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [inputData, setInputData] = useState({
        container_weight: '',
        container_plus_sample_weight: '',
        container_volume: '',
    });

    const handleChange = (field, value) => {
        setInputData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));
    };

    const calculation = useMemo(() => {
        const { container_weight, container_plus_sample_weight, container_volume } = inputData;
        if (typeof container_weight !== 'number' || typeof container_plus_sample_weight !== 'number' || typeof container_volume !== 'number') return {};
        if (container_volume <= 0) return {};
        const sample_weight_kg = (container_plus_sample_weight - container_weight) / 1000;
        const container_volume_m3 = container_volume / 1000;
        const bulk_density = sample_weight_kg / container_volume_m3;
        return { bulk_density };
    }, [inputData]);

    // PENINGKATAN: Validasi input untuk mengaktifkan tombol simpan
    const canSave = useMemo(() => {
        return inputData.container_weight > 0 &&
               inputData.container_plus_sample_weight > 0 &&
               inputData.container_volume > 0 &&
               inputData.container_plus_sample_weight > inputData.container_weight;
    }, [inputData]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'bulk_density',
                test_date: testDate,
                input_data_json: JSON.stringify(inputData),
                result_data_json: JSON.stringify(calculation)
            });
            setIsOpen(false);
            setInputData({ container_weight: '', container_plus_sample_weight: '', container_volume: '' });
        } catch (error) {
            console.error("Failed to save Bulk Density test:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Uji Baru</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Pengujian Berat Isi Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan berat bejana, berat bejana plus sampel, dan volume bejana untuk menghitung berat isi.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <Label>Tanggal Uji</Label>
                        <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
                        <div className="mt-4 space-y-2">
                            <Label>Berat Bejana (A)</Label>
                            <Input type="number" placeholder="gram" value={inputData.container_weight} onChange={e => handleChange('container_weight', e.target.value)} />
                            <Label>Berat Bejana + Sampel (B)</Label>
                            <Input type="number" placeholder="gram" value={inputData.container_plus_sample_weight} onChange={e => handleChange('container_plus_sample_weight', e.target.value)} />
                            <Label>Volume Bejana (C)</Label>
                            <Input type="number" placeholder="liter" value={inputData.container_volume} onChange={e => handleChange('container_volume', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                         <p>Berat Isi (((B-A)/1000)/(C/1000)):</p>
                         <p className="text-2xl font-bold">{calculation.bulk_density?.toFixed(0) || '-'} kg/m³</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={!canSave || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Simpan Hasil
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Komponen utama
export default function BulkDensityTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Berat Isi</h3>
                <TestForm onSave={onAddTest} />
            </div>
            {/* PENINGKATAN: Tampilan empty state */}
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data pengujian berat isi pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Berat Isi (kg/m³)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                <TableCell>{test.result_data.bulk_density?.toFixed(0)}</TableCell>
                                <TableCell>{test.is_active_for_design ? <span className="text-green-600 font-bold">Aktif</span> : 'Non-aktif'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => onSetActive({ testType: 'bulk_density', testId: test.id })}
                                            disabled={!!test.is_active_for_design} variant="outline">
                                        Jadikan Aktif
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
