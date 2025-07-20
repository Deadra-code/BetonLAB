// src/features/Formulas/components/CoarseAggSettings.jsx
// Deskripsi: Komponen UI untuk mengedit tabel volume agregat kasar, kini dengan tombol reset ke SNI.

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useNotifier } from '../../../hooks/useNotifier';
// PERBAIKAN: Menggunakan default import
import defaultFormulas from '../../../electron/defaultFormulas';

export const CoarseAggSettings = ({ formula, onFormulaChange }) => {
    // ... (sisa kode komponen tetap sama) ...
    const [tableData, setTableData] = useState({});
    const { notify } = useNotifier();

    useEffect(() => {
        if (formula) {
            setTableData(JSON.parse(formula.formula_value));
        }
    }, [formula]);

    const handleInputChange = (aggSize, fm, value) => {
        const newData = JSON.parse(JSON.stringify(tableData));
        newData[aggSize][fm] = parseFloat(value) || 0;
        setTableData(newData);
        onFormulaChange(formula.formula_key, JSON.stringify(newData, null, 2));
    };

    const handleResetToDefault = () => {
        const defaultFormula = defaultFormulas.find(f => f.formula_key === 'coarse_agg_vol_table');
        if (defaultFormula) {
            onFormulaChange(formula.formula_key, defaultFormula.formula_value);
            notify.success("Tabel Volume Agregat Kasar telah dikembalikan ke rekomendasi SNI.");
        }
    };

    if (!formula) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Tabel Volume Agregat Kasar</CardTitle>
                        <CardDescription>Sesuaikan faktor volume agregat kasar berdasarkan ukuran agregat dan FM pasir.</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleResetToDefault}><RotateCcw className="mr-2 h-4 w-4" /> Gunakan Rekomendasi SNI</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {Object.entries(tableData).map(([aggSize, data]) => (
                    <Collapsible key={aggSize}>
                        <CollapsibleTrigger className="w-full flex justify-between items-center p-3 bg-muted/50 rounded-md hover:bg-muted">
                            <span className="font-semibold">Agregat Ukuran Maks. {aggSize} mm</span>
                            <ChevronRight className="h-5 w-5 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 border border-t-0 rounded-b-md">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {Object.entries(data).map(([fm, factor]) => (
                                    <div key={fm} className="space-y-1">
                                        <Label>Faktor untuk FM Pasir {fm}</Label>
                                        <Input type="number" step="0.01" value={factor} onChange={(e) => handleInputChange(aggSize, fm, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </CardContent>
        </Card>
    );
};
