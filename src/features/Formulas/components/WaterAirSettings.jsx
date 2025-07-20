// src/features/Formulas/components/WaterAirSettings.jsx
// Deskripsi: Komponen UI untuk mengedit tabel kebutuhan air & udara, kini dengan tombol reset ke SNI.

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

export const WaterAirSettings = ({ formula, onFormulaChange }) => {
    // ... (sisa kode komponen tetap sama) ...
    const [tableData, setTableData] = useState({});
    const { notify } = useNotifier();

    useEffect(() => {
        if (formula) {
            setTableData(JSON.parse(formula.formula_value));
        }
    }, [formula]);

    const handleInputChange = (aggSize, field, subField, value) => {
        const newData = JSON.parse(JSON.stringify(tableData));
        const numValue = parseFloat(value) || 0;
        if (subField) {
            newData[aggSize][field][subField] = numValue;
        } else {
            newData[aggSize][field] = numValue;
        }
        setTableData(newData);
        onFormulaChange(formula.formula_key, JSON.stringify(newData, null, 2));
    };

    const handleResetToDefault = () => {
        const defaultFormula = defaultFormulas.find(f => f.formula_key === 'water_air_table');
        if (defaultFormula) {
            onFormulaChange(formula.formula_key, defaultFormula.formula_value);
            notify.success("Tabel Kebutuhan Air & Udara telah dikembalikan ke rekomendasi SNI.");
        }
    };

    if (!formula) return null;

    return (
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Tabel Kebutuhan Air & Udara</CardTitle>
                        <CardDescription>Sesuaikan estimasi kebutuhan air (kg/m³) dan kandungan udara (%).</CardDescription>
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
                                <h4 className="col-span-2 font-medium text-sm">Kebutuhan Air (kg/m³) untuk Slump:</h4>
                                {Object.entries(data.slump).map(([slumpRange, water]) => (
                                    <div key={slumpRange} className="space-y-1">
                                        <Label>Slump {slumpRange} mm</Label>
                                        <Input type="number" value={water} onChange={(e) => handleInputChange(aggSize, 'slump', slumpRange, e.target.value)} />
                                    </div>
                                ))}
                                <div className="col-span-2 pt-2 border-t">
                                    <Label>Perkiraan Kandungan Udara (%)</Label>
                                    <Input type="number" step="0.1" value={data.air} onChange={(e) => handleInputChange(aggSize, 'air', null, e.target.value)} />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </CardContent>
        </Card>
    );
};
