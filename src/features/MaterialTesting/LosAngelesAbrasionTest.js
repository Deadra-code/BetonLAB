import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Loader2, HardHat } from 'lucide-react';

// Form untuk menambah data uji baru
const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [inputData, setInputData] = useState({
        initial_weight: 5000,
        final_weight: '',
    });

    const handleChange = (field, value) => {
        setInputData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));
    };

    const calculation = useMemo(() => {
        const { initial_weight, final_weight } = inputData;
        if (typeof initial_weight !== 'number' || typeof final_weight !== 'number') return {};
        const abrasion_value = ((initial_weight - final_weight) / initial_weight) * 100;
        return { abrasion_value };
    }, [inputData]);
    
    // PENINGKATAN: Validasi input untuk mengaktifkan tombol simpan
    const canSave = useMemo(() => {
        return inputData.initial_weight > 0 && inputData.final_weight > 0 && inputData.final_weight <= inputData.initial_weight;
    }, [inputData]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'los_angeles',
                test_date: testDate,
                input_data_json: JSON.stringify(inputData),
                result_data_json: JSON.stringify(calculation)
            });
            setIsOpen(false); // Tutup dialog jika sukses
            // Reset form
            setInputData({ initial_weight: 5000, final_weight: '' });
        } catch (error) {
            console.error("Failed to save LA Abrasion test:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Uji Baru</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Pengujian Abrasi Los Angeles Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan berat sampel awal dan berat akhir setelah uji abrasi untuk menghitung nilai keausan.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <Label>Tanggal Uji</Label>
                        <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
                        <div className="mt-4 space-y-2">
                            <Label>Berat Sampel Awal (A)</Label>
                            <Input type="number" placeholder="gram" value={inputData.initial_weight} onChange={e => handleChange('initial_weight', e.target.value)} />
                            <Label>Berat Sampel Tertahan No.12 (B)</Label>
                            <Input type="number" placeholder="gram" value={inputData.final_weight} onChange={e => handleChange('final_weight', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                         <p>Nilai Abrasi (((A-B)/A)*100):</p>
                         <p className="text-2xl font-bold">{calculation.abrasion_value?.toFixed(2) || '-'} %</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    {/* PENINGKATAN: Tombol dengan state loading dan disabled */}
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
export default function LosAngelesAbrasionTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Abrasi Los Angeles</h3>
                <TestForm onSave={onAddTest} />
            </div>
            {/* PENINGKATAN: Tampilan empty state yang lebih informatif */}
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <HardHat className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data pengujian abrasi pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Nilai Abrasi (%)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                <TableCell>{test.result_data.abrasion_value?.toFixed(2)}</TableCell>
                                <TableCell>{test.is_active_for_design ? <span className="text-green-600 font-bold">Aktif</span> : 'Non-aktif'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => onSetActive({ testType: 'los_angeles', testId: test.id })}
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
