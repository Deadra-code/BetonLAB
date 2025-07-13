import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Loader2, Archive } from 'lucide-react';

const DatasheetHeader = ({ metadata, onMetadataChange }) => (
    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50 mb-4">
        <Input placeholder="Diuji oleh..." value={metadata.testedBy} onChange={e => onMetadataChange('testedBy', e.target.value)} />
        <Input placeholder="Diperiksa oleh..." value={metadata.checkedBy} onChange={e => onMetadataChange('checkedBy', e.target.value)} />
        <Input placeholder="Metode Uji (e.g., SNI 03-1970-1990)" value={metadata.testMethod} onChange={e => onMetadataChange('testMethod', e.target.value)} />
        <Input type="date" value={metadata.testDate} onChange={e => onMetadataChange('testDate', e.target.value)} />
    </div>
);

const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [inputData, setInputData] = useState({
        container_weight: '',
        container_plus_sample_weight: '',
        container_volume: '',
    });
    const [metadata, setMetadata] = useState({
        testedBy: '',
        checkedBy: '',
        testMethod: 'SNI 03-1970-1990',
        testDate: new Date().toISOString().split('T')[0]
    });

    const handleMetadataChange = (field, value) => setMetadata(prev => ({ ...prev, [field]: value }));
    const handleChange = (field, value) => setInputData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));

    const calculation = useMemo(() => {
        const { container_weight, container_plus_sample_weight, container_volume } = inputData;
        if (typeof container_weight !== 'number' || typeof container_plus_sample_weight !== 'number' || typeof container_volume !== 'number' || container_volume <= 0) return {};
        const sample_weight_kg = (container_plus_sample_weight - container_weight) / 1000;
        const container_volume_m3 = container_volume / 1000;
        const bulk_density = sample_weight_kg / container_volume_m3;
        return { bulk_density };
    }, [inputData]);

    const canSave = useMemo(() => {
        return inputData.container_weight > 0 && inputData.container_plus_sample_weight > 0 && inputData.container_volume > 0 && inputData.container_plus_sample_weight > inputData.container_weight;
    }, [inputData]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'bulk_density',
                test_date: metadata.testDate,
                input_data_json: JSON.stringify(inputData),
                result_data_json: JSON.stringify(calculation),
                ...metadata
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
                    <DialogTitle>Lembar Data: Uji Berat Isi</DialogTitle>
                </DialogHeader>
                <DatasheetHeader metadata={metadata} onMetadataChange={handleMetadataChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-2">
                        <Label>Berat Bejana (A)</Label>
                        <Input type="number" placeholder="gram" value={inputData.container_weight} onChange={e => handleChange('container_weight', e.target.value)} />
                        <Label>Berat Bejana + Sampel (B)</Label>
                        <Input type="number" placeholder="gram" value={inputData.container_plus_sample_weight} onChange={e => handleChange('container_plus_sample_weight', e.target.value)} />
                        <Label>Volume Bejana (C)</Label>
                        <Input type="number" placeholder="liter" value={inputData.container_volume} onChange={e => handleChange('container_volume', e.target.value)} />
                    </div>
                    <div className="space-y-2 bg-muted p-4 rounded-lg">
                         <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                         <p>Berat Isi (((B-A)/1000)/(C/1000)):</p>
                         <p className="text-2xl font-bold">{calculation.bulk_density?.toFixed(0) || '-'} kg/m³</p>
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

export default function BulkDensityTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Berat Isi</h3>
                <TestForm onSave={onAddTest} />
            </div>
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
