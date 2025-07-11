import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Loader2, Droplets } from 'lucide-react'; // PENINGKATAN: Import ikon

// Form untuk menambah data uji baru
const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [inputData, setInputData] = useState({
        wet_weight: '',
        dry_weight: '',
    });

    const handleChange = (field, value) => {
        setInputData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));
    };

    const calculation = useMemo(() => {
        const { wet_weight, dry_weight } = inputData;
        if (typeof wet_weight !== 'number' || typeof dry_weight !== 'number' || dry_weight <= 0) return {};
        const moisture_content = ((wet_weight - dry_weight) / dry_weight) * 100;
        return { moisture_content };
    }, [inputData]);

    // PENINGKATAN: Validasi input
    const canSave = useMemo(() => {
        return inputData.wet_weight > 0 &&
               inputData.dry_weight > 0 &&
               inputData.wet_weight >= inputData.dry_weight;
    }, [inputData]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'moisture',
                test_date: testDate,
                input_data_json: JSON.stringify(inputData),
                result_data_json: JSON.stringify(calculation)
            });
            setIsOpen(false);
            setInputData({ wet_weight: '', dry_weight: '' });
        } catch (error) {
            console.error("Failed to save Moisture Content test:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Uji Baru</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Pengujian Kadar Air Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan berat sampel asli (basah) dan berat setelah dikeringkan untuk menghitung kadar air.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <Label>Tanggal Uji</Label>
                        <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
                        <div className="mt-4 space-y-2">
                            <Label>Berat Sampel Asli (A)</Label>
                            <Input type="number" placeholder="gram" value={inputData.wet_weight} onChange={e => handleChange('wet_weight', e.target.value)} />
                            <Label>Berat Sampel Kering (B)</Label>
                            <Input type="number" placeholder="gram" value={inputData.dry_weight} onChange={e => handleChange('dry_weight', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                         <p>Kadar Air (((A-B)/B)*100):</p>
                         <p className="text-2xl font-bold">{calculation.moisture_content?.toFixed(2) || '-'} %</p>
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
export default function MoistureContentTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Kadar Air</h3>
                <TestForm onSave={onAddTest} />
            </div>
            {/* PENINGKATAN: Tampilan empty state */}
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Droplets className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data pengujian kadar air pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Kadar Air (%)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                <TableCell>{test.result_data.moisture_content?.toFixed(2)}</TableCell>
                                <TableCell>{test.is_active_for_design ? <span className="text-green-600 font-bold">Aktif</span> : 'Non-aktif'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => onSetActive({ testType: 'moisture', testId: test.id })}
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
