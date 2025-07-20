// src/features/Formulas/components/FcrSettings.jsx
// Deskripsi: Komponen UI untuk mengatur rumus f'cr dengan cara yang user-friendly.

import React from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import HelpTooltip from '../../../components/ui/HelpTooltip';

export const FcrSettings = ({ formula, onFormulaChange }) => {
    if (!formula) return null;

    // Ekstrak nilai K dari string formula, contoh: "fc + 1.64 * stdDev" -> 1.64
    const kValue = parseFloat(formula.formula_value.split('*')[0].split('+')[1].trim());

    const handleKValueChange = (newKValue) => {
        const value = parseFloat(newKValue);
        if (!isNaN(value)) {
            const newFormulaString = `fc + ${value} * stdDev`;
            onFormulaChange(formula.formula_key, newFormulaString);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parameter Kuat Tekan Target (f'cr)</CardTitle>
                <CardDescription>
                    Atur konstanta yang digunakan untuk menghitung kuat tekan rata-rata yang ditargetkan dari kuat tekan karakteristik (f'c).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 border bg-muted/50 rounded-lg text-center mb-6">
                    <p className="text-lg font-mono tracking-wider">f'cr = f'c + ( K × S )</p>
                </div>
                <div className="max-w-sm space-y-2">
                    <div className="flex items-center">
                        <Label htmlFor="k-value" className="text-base">Faktor Keamanan (K)</Label>
                        <HelpTooltip content="Nilai default 1.64 sesuai dengan standar ACI untuk tingkat kepercayaan 95%. Ubah hanya jika Anda memiliki standar internal yang berbeda." />
                    </div>
                    <Input
                        id="k-value"
                        type="number"
                        step="0.01"
                        value={kValue}
                        onChange={(e) => handleKValueChange(e.target.value)}
                        className="text-lg font-semibold"
                    />
                </div>
            </CardContent>
        </Card>
    );
};
