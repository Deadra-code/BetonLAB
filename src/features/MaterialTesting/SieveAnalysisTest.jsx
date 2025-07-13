import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Loader2, SlidersHorizontal } from 'lucide-react';

const DatasheetHeader = ({ metadata, onMetadataChange }) => (
    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50 mb-4">
        <Input placeholder="Diuji oleh..." value={metadata.testedBy} onChange={e => onMetadataChange('testedBy', e.target.value)} />
        <Input placeholder="Diperiksa oleh..." value={metadata.checkedBy} onChange={e => onMetadataChange('checkedBy', e.target.value)} />
        <Input placeholder="Metode Uji (e.g., SNI 03-1968-1990)" value={metadata.testMethod} onChange={e => onMetadataChange('testMethod', e.target.value)} />
        <Input type="date" value={metadata.testDate} onChange={e => onMetadataChange('testDate', e.target.value)} />
    </div>
);

const TestForm = ({ material, onSave }) => {
    const isCoarse = material.material_type === 'coarse_aggregate';
    const defaultSieves = useMemo(() => isCoarse 
        ? [75, 50, 40, 25, 20, 12.5, 10, 4.75, 'pan'] 
        : [10, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 'pan'], [isCoarse]);
    
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [initialWeight, setInitialWeight] = useState(isCoarse ? 5000 : 500);
    const [retainedWeights, setRetainedWeights] = useState(defaultSieves.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
    const [metadata, setMetadata] = useState({
        testedBy: '',
        checkedBy: '',
        testMethod: 'SNI 03-1968-1990',
        testDate: new Date().toISOString().split('T')[0]
    });

    const handleMetadataChange = (field, value) => {
        setMetadata(prev => ({ ...prev, [field]: value }));
    };
    
    const handleWeightChange = (size, value) => {
        setRetainedWeights(prev => ({ ...prev, [size]: value === '' ? '' : parseFloat(value) }));
    };

    const calculation = useMemo(() => {
        const results = {};
        let cumulativeRetainedWeight = 0;
        const totalRetained = defaultSieves.reduce((sum, size) => sum + (retainedWeights[size] || 0), 0);

        if (initialWeight <= 0) return { table: {}, finenessModulus: 0, loss: 0 };

        defaultSieves.forEach(size => {
            if (size === 'pan') return;
            const retainedWeight = retainedWeights[size] || 0;
            cumulativeRetainedWeight += retainedWeight;
            const cumulativeRetainedPercent = (cumulativeRetainedWeight / initialWeight) * 100;
            results[size] = {
                retainedPercent: (retainedWeight / initialWeight) * 100,
                cumulativeRetainedPercent: cumulativeRetainedPercent,
                passingPercent: 100 - cumulativeRetainedPercent,
            };
        });
        
        const fmSieves = [4.75, 2.36, 1.18, 0.6, 0.3, 0.15];
        const fmSum = fmSieves.reduce((acc, size) => acc + (results[size]?.cumulativeRetainedPercent || 0), 0);
        const finenessModulus = fmSum / 100;

        return { table: results, finenessModulus, loss: ((initialWeight - totalRetained) / initialWeight) * 100 };
    }, [retainedWeights, initialWeight, defaultSieves]);

    const canSave = useMemo(() => {
        const totalRetained = defaultSieves.reduce((sum, size) => sum + (retainedWeights[size] || 0), 0);
        return initialWeight > 0 && totalRetained > 0 && totalRetained <= initialWeight;
    }, [initialWeight, retainedWeights, defaultSieves]);

    const handleSave = async () => {
        if (!canSave) return;
        setIsSaving(true);
        try {
            await onSave({
                test_type: 'sieve_analysis',
                test_date: metadata.testDate,
                input_data_json: JSON.stringify({ initialWeight, retainedWeights }),
                result_data_json: JSON.stringify(calculation),
                ...metadata
            });
            setIsOpen(false);
            setInitialWeight(isCoarse ? 5000 : 500);
            setRetainedWeights(defaultSieves.reduce((acc, size) => ({ ...acc, [size]: '' }), {}));
        } catch (error) {
            console.error("Failed to save Sieve Analysis test:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button>Uji Baru</Button></DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Lembar Data: Analisis Saringan</DialogTitle>
                    <DialogDescription>Masukkan berat sampel awal dan berat yang tertahan di setiap saringan.</DialogDescription>
                </DialogHeader>
                <DatasheetHeader metadata={metadata} onMetadataChange={handleMetadataChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <Label className="mt-4 block">Berat Sampel Awal (gram)</Label>
                        <Input type="number" value={initialWeight} onChange={e => setInitialWeight(parseFloat(e.target.value) || 0)} />
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                            {defaultSieves.map(size => (
                                <div key={size} className="flex items-center gap-2">
                                    <Label className="w-32">Tertahan {size} mm</Label>
                                    <Input type="number" placeholder="gram" value={retainedWeights[size]} onChange={e => handleWeightChange(size, e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                        <p>Modulus Kehalusan (FM): <span className="font-bold">{calculation.finenessModulus?.toFixed(2) || '0.00'}</span></p>
                        <p>Kehilangan Berat: <span className="font-bold">{calculation.loss?.toFixed(2) || '0.00'}%</span></p>
                        <div className="mt-4 h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={Object.keys(calculation.table).map(s => ({size: s, Lolos: calculation.table[s].passingPercent})).reverse()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="size" scale="log" type="number" domain={['auto', 'auto']} reversed={true} />
                                    <YAxis domain={[0, 100]}/>
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="Lolos" stroke="#8884d8" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
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

export default function SieveAnalysisTest({ material, tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Analisis Saringan</h3>
                <TestForm material={material} onSave={onAddTest} />
            </div>
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data analisis saringan pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Modulus Kehalusan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                <TableCell>{test.result_data.finenessModulus?.toFixed(2)}</TableCell>
                                <TableCell>{test.is_active_for_design ? <span className="text-green-600 font-bold">Aktif</span> : 'Non-aktif'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => onSetActive({ testType: 'sieve_analysis', testId: test.id })}
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
