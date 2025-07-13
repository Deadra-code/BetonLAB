import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Loader2, TestTube2, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

const DatasheetHeader = ({ metadata, onMetadataChange }) => (
    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50 mb-4">
        <Input placeholder="Diuji oleh..." value={metadata.testedBy} onChange={e => onMetadataChange('testedBy', e.target.value)} />
        <Input placeholder="Diperiksa oleh..." value={metadata.checkedBy} onChange={e => onMetadataChange('checkedBy', e.target.value)} />
        <Input placeholder="Metode Uji (e.g., SNI 03-4142-1996)" value={metadata.testMethod} onChange={e => onMetadataChange('testMethod', e.target.value)} />
        <Input type="date" value={metadata.testDate} onChange={e => onMetadataChange('testDate', e.target.value)} />
    </div>
);

const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [inputData, setInputData] = useState({
        initial_weight: '',
        washed_weight: '',
    });
    const [metadata, setMetadata] = useState({
        testedBy: '',
        checkedBy: '',
        testMethod: 'SNI 03-4142-1996',
        testDate: new Date().toISOString().split('T')[0]
    });
    const [validationError, setValidationError] = useState('');

    const handleMetadataChange = (field, value) => setMetadata(prev => ({ ...prev, [field]: value }));
    const handleChange = (field, value) => setInputData(prev => ({ ...prev, [field]: value === '' ? '' : parseFloat(value) }));

    const calculation = useMemo(() => {
        const { initial_weight, washed_weight } = inputData;
        if (typeof initial_weight !== 'number' || typeof washed_weight !== 'number' || initial_weight <= 0) return {};
        const silt_content = ((initial_weight - washed_weight) / initial_weight) * 100;
        return { silt_content };
    }, [inputData]);

    useEffect(() => {
        const { initial_weight, washed_weight } = inputData;
        if (washed_weight && initial_weight && washed_weight > initial_weight) {
            setValidationError('Berat tercuci tidak boleh lebih besar dari berat awal.');
        } else {
            setValidationError('');
        }
    }, [inputData]);

    const canSave = useMemo(() => {
        return inputData.initial_weight > 0 && inputData.washed_weight > 0 && !validationError;
    }, [inputData, validationError]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'silt',
                test_date: metadata.testDate,
                input_data_json: JSON.stringify(inputData),
                result_data_json: JSON.stringify(calculation),
                ...metadata
            });
            setIsOpen(false);
            setInputData({ initial_weight: '', washed_weight: '' });
        } catch (error) {
            console.error("Failed to save Silt Content test:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Uji Baru</Button></DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Lembar Data: Uji Kadar Lumpur</DialogTitle>
                </DialogHeader>
                <DatasheetHeader metadata={metadata} onMetadataChange={handleMetadataChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-3">
                        <div>
                            <Label>Berat Sampel Awal Kering (A)</Label>
                            <Input type="number" placeholder="gram" value={inputData.initial_weight} onChange={e => handleChange('initial_weight', e.target.value)} />
                        </div>
                        <div>
                            <Label>Berat Sampel Tercuci Kering (B)</Label>
                            <Input type="number" placeholder="gram" value={inputData.washed_weight} onChange={e => handleChange('washed_weight', e.target.value)} />
                            {validationError && <p className="text-sm text-destructive mt-1">{validationError}</p>}
                        </div>
                    </div>
                    <div className="space-y-2 bg-muted p-4 rounded-lg">
                         <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                         <p>Kadar Lumpur (((A-B)/A)*100):</p>
                         <p className="text-2xl font-bold">{calculation.silt_content?.toFixed(2) || '-'} %</p>
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

export default function SiltContentTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Kadar Lumpur</h3>
                <TestForm onSave={onAddTest} />
            </div>
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <TestTube2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data pengujian kadar lumpur pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Kadar Lumpur (%)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => {
                            const isResultValid = typeof test.result_data.silt_content === 'number';
                            return (
                                <TableRow key={test.id} className={cn(test.is_active_for_design && 'bg-primary/10')}>
                                    <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{test.result_data.silt_content?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {test.is_active_for_design ? 
                                            <Badge variant="success"><Star className="mr-1 h-3 w-3" /> Aktif</Badge> 
                                            : <Badge variant="secondary">Non-aktif</Badge>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <Button 
                                                            onClick={() => onSetActive({ testType: 'silt', testId: test.id })}
                                                            disabled={!!test.is_active_for_design || !isResultValid} 
                                                            variant="outline"
                                                        >
                                                            Jadikan Aktif
                                                        </Button>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {isResultValid 
                                                        ? <p>Hasil tes ini akan digunakan secara otomatis<br/>dalam perhitungan Desain Campuran baru.</p>
                                                        : <p>Tidak dapat diaktifkan karena data hasil tidak valid.</p>
                                                    }
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
