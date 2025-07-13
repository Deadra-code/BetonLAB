import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Loader2, Scale } from 'lucide-react';

// Komponen Header Lembar Data yang Dapat Digunakan Kembali
const DatasheetHeader = ({ metadata, onMetadataChange }) => (
    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50 mb-4">
        <Input placeholder="Diuji oleh..." value={metadata.testedBy} onChange={e => onMetadataChange('testedBy', e.target.value)} />
        <Input placeholder="Diperiksa oleh..." value={metadata.checkedBy} onChange={e => onMetadataChange('checkedBy', e.target.value)} />
        <Input placeholder="Metode Uji (e.g., SNI 1972:2008)" value={metadata.testMethod} onChange={e => onMetadataChange('testMethod', e.target.value)} />
        <Input type="date" value={metadata.testDate} onChange={e => onMetadataChange('testDate', e.target.value)} />
    </div>
);

// Form untuk menambah data uji baru
const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [inputData, setInputData] = useState({
        dry_weight: '',
        ssd_weight: '',
        in_water_weight: '',
    });
    const [metadata, setMetadata] = useState({
        testedBy: '',
        checkedBy: '',
        testMethod: 'SNI 1972:2008',
        testDate: new Date().toISOString().split('T')[0]
    });

    const handleMetadataChange = (field, value) => {
        setMetadata(prev => ({ ...prev, [field]: value }));
    };

    const handleChange = (field, value) => {
        setInputData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));
    };

    const calculation = useMemo(() => {
        const { dry_weight, ssd_weight, in_water_weight } = inputData;
        if (typeof dry_weight !== 'number' || typeof ssd_weight !== 'number' || typeof in_water_weight !== 'number' || (ssd_weight - in_water_weight) === 0 || dry_weight === 0 || (dry_weight - in_water_weight) === 0) return {};
        const bj_bulk_dry = dry_weight / (ssd_weight - in_water_weight);
        const bj_ssd = ssd_weight / (ssd_weight - in_water_weight);
        const bj_apparent = dry_weight / (dry_weight - in_water_weight);
        const absorption = ((ssd_weight - dry_weight) / dry_weight) * 100;
        return { bj_bulk_dry, bj_ssd, bj_apparent, absorption };
    }, [inputData]);

    const canSave = useMemo(() => {
        return inputData.dry_weight > 0 && inputData.ssd_weight > 0 && inputData.in_water_weight > 0 && inputData.ssd_weight > inputData.dry_weight && inputData.ssd_weight > inputData.in_water_weight;
    }, [inputData]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'specific_gravity',
                test_date: metadata.testDate,
                input_data_json: JSON.stringify(inputData),
                result_data_json: JSON.stringify(calculation),
                ...metadata
            });
            setIsOpen(false);
            setInputData({ dry_weight: '', ssd_weight: '', in_water_weight: '' });
        } catch (error) {
            console.error("Failed to save Specific Gravity test:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Uji Baru</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Lembar Data: Uji Berat Jenis & Penyerapan</DialogTitle>
                    <DialogDescription>Isi data sesuai dengan formulir data mentah dari laboratorium.</DialogDescription>
                </DialogHeader>
                <DatasheetHeader metadata={metadata} onMetadataChange={handleMetadataChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-2">
                        <Label>Berat Benda Uji Kering Oven (A)</Label>
                        <Input type="number" placeholder="gram" value={inputData.dry_weight} onChange={e => handleChange('dry_weight', e.target.value)} />
                        <Label>Berat Benda Uji SSD (B)</Label>
                        <Input type="number" placeholder="gram" value={inputData.ssd_weight} onChange={e => handleChange('ssd_weight', e.target.value)} />
                        <Label>Berat Benda Uji di Air (C)</Label>
                        <Input type="number" placeholder="gram" value={inputData.in_water_weight} onChange={e => handleChange('in_water_weight', e.target.value)} />
                    </div>
                    <div className="space-y-2 bg-muted p-4 rounded-lg">
                         <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                         <p className="text-sm">BJ Kering (A / (B-C)): <span className="font-bold">{calculation.bj_bulk_dry?.toFixed(3) || '-'}</span></p>
                         <p className="text-sm">BJ SSD (B / (B-C)): <span className="font-bold">{calculation.bj_ssd?.toFixed(3) || '-'}</span></p>
                         <p className="text-sm">BJ Semu (A / (A-C)): <span className="font-bold">{calculation.bj_apparent?.toFixed(3) || '-'}</span></p>
                         <p className="text-sm">Penyerapan (((B-A)/A)*100): <span className="font-bold">{calculation.absorption?.toFixed(2) || '-'} %</span></p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleSave} disabled={!canSave || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Simpan Hasil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Komponen utama
export default function SpecificGravityTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Berat Jenis & Penyerapan</h3>
                <TestForm onSave={onAddTest} />
            </div>
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Scale className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data pengujian berat jenis pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>BJ SSD</TableHead>
                            <TableHead>Penyerapan (%)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                <TableCell>{test.result_data.bj_ssd?.toFixed(3)}</TableCell>
                                <TableCell>{test.result_data.absorption?.toFixed(2)}</TableCell>
                                <TableCell>{test.is_active_for_design ? <span className="text-green-600 font-bold">Aktif</span> : 'Non-aktif'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => onSetActive({ testType: 'specific_gravity', testId: test.id })}
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
