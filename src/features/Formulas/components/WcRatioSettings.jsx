// src/features/Formulas/components/WcRatioSettings.jsx
// Deskripsi: Komponen UI untuk mengedit tabel Faktor Air/Semen, kini dengan tombol reset ke SNI.

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Pencil, RotateCcw } from 'lucide-react';
import { useNotifier } from '../../../hooks/useNotifier';
// PERBAIKAN: Menggunakan default import
import defaultFormulas from '../../../electron/defaultFormulas';

export const WcRatioSettings = ({ formula, onFormulaChange }) => {
    // ... (sisa kode komponen tetap sama) ...
    const [tableData, setTableData] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { notify } = useNotifier();

    useEffect(() => {
        if (formula) {
            const parsedData = JSON.parse(formula.formula_value);
            const sortedData = Object.entries(parsedData)
                .filter(([key]) => key !== 'default')
                .map(([key, value]) => ({ fcr: parseInt(key), fas: value }))
                .sort((a, b) => b.fcr - a.fcr);
            setTableData(sortedData);
        }
    }, [formula]);

    const handleInputChange = (index, value) => {
        const newData = [...tableData];
        newData[index].fas = parseFloat(value) || 0;
        setTableData(newData);
    };

    const handleSaveChanges = () => {
        const newFormulaObject = tableData.reduce((acc, item) => {
            acc[item.fcr] = item.fas;
            return acc;
        }, { default: 0.75 });
        onFormulaChange(formula.formula_key, JSON.stringify(newFormulaObject, null, 2));
        setIsDialogOpen(false);
    };

    const handleResetToDefault = () => {
        const defaultFormula = defaultFormulas.find(f => f.formula_key === 'wc_ratio_table');
        if (defaultFormula) {
            onFormulaChange(formula.formula_key, defaultFormula.formula_value);
            notify.success("Nilai Tabel FAS telah dikembalikan ke rekomendasi SNI.");
        }
    };

    if (!formula) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Tabel Faktor Air/Semen (FAS)</CardTitle>
                        <CardDescription>Sesuaikan nilai FAS berdasarkan kuat tekan target (f'cr).</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleResetToDefault}><RotateCcw className="mr-2 h-4 w-4" /> Gunakan Rekomendasi SNI</Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Ubah Nilai</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Edit Tabel Faktor Air/Semen</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[60vh] p-4">
                                    <div className="space-y-4">
                                        {tableData.map((row, index) => (
                                            <div key={row.fcr} className="grid grid-cols-2 items-center gap-4">
                                                <Label htmlFor={`fas-${row.fcr}`}>Jika f'cr ≥ {row.fcr} MPa, maka FAS =</Label>
                                                <Input id={`fas-${row.fcr}`} type="number" step="0.01" value={row.fas} onChange={(e) => handleInputChange(index, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                                    <Button onClick={handleSaveChanges}>Simpan Perubahan</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kuat Tekan Target (f'cr)</TableHead>
                            <TableHead className="text-right">Faktor Air/Semen (FAS)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.map(row => (
                            <TableRow key={row.fcr}>
                                <TableCell className="font-medium">≥ {row.fcr} MPa</TableCell>
                                <TableCell className="text-right">{row.fas.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
