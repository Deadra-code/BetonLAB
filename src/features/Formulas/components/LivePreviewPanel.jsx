// src/features/Formulas/components/LivePreviewPanel.jsx
// Deskripsi: Panel umpan balik ditingkatkan dengan tab untuk visualisasi kurva gradasi.

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import ResultCard from '../../../components/ResultCard';
import { calculateMixDesign } from '../../../utils/concreteCalculator';
import { defaultInputs } from '../../../data/sniData';
import { AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Batas SNI untuk gradasi gabungan (contoh)
const sniBoundaries = { '4.75': [30, 59], '2.36': [19, 45], '1.18': [12, 35], '0.60': [7, 23], '0.30': [4, 15], '0.15': [2, 8] };

export const LivePreviewPanel = ({ formulas }) => {
    const [previewInputs, setPreviewInputs] = useState({ fc: '30', slump: '90', maxAggrSize: '20', finenessModulus: '2.60' });
    const [previewResults, setPreviewResults] = useState(null);
    const [error, setError] = useState('');

    const gradationChartData = useMemo(() => {
        if (!previewResults) return [];
        
        const { coarseAggrWeightSSD, fineAggrWeightSSD } = previewResults;
        const totalWeight = coarseAggrWeightSSD + fineAggrWeightSSD;
        if (totalWeight === 0) return [];
        
        const coarseRatio = coarseAggrWeightSSD / totalWeight;
        const fineRatio = fineAggrWeightSSD / totalWeight;

        const sieveSizes = [100, 50, 40, 25, 20, 12.5, 10, 4.75, 2.36, 1.18, 0.60, 0.30, 0.15];

        return sieveSizes.map(size => {
            const finePassing = defaultInputs.sieve.fine[size] || 100;
            const coarsePassing = defaultInputs.sieve.coarse[size] || 100;
            const combined = (finePassing * fineRatio) + (coarsePassing * coarseRatio);
            const boundary = sniBoundaries[size] || [null, null];
            return {
                size: size,
                'Gabungan': combined,
                'Batas Bawah': boundary[0],
                'Batas Atas': boundary[1]
            };
        }).reverse();
    }, [previewResults]);

    useEffect(() => {
        if (!formulas || Object.keys(formulas).length === 0) return;

        const { fc, slump, maxAggrSize, finenessModulus } = previewInputs;
        if ([fc, slump, maxAggrSize, finenessModulus].some(val => !val || isNaN(parseFloat(val)))) {
            setPreviewResults(null);
            setError('');
            return;
        }

        try {
            const mockInputs = { ...defaultInputs, ...previewInputs };
            const results = calculateMixDesign(mockInputs, formulas);
            setPreviewResults(results);
            setError('');
        } catch (e) {
            setPreviewResults(null);
            setError(e.message);
        }
    }, [previewInputs, formulas]);

    const handleInputChange = (field, value) => {
        setPreviewInputs(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle>Pratinjau Dampak Langsung</CardTitle>
                <CardDescription>Lihat bagaimana perubahan Anda memengaruhi hasil perhitungan.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    <Label>Input Hipotetis</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input type="number" placeholder="f'c (MPa)" value={previewInputs.fc} onChange={e => handleInputChange('fc', e.target.value)} />
                        <Input type="number" placeholder="Slump (mm)" value={previewInputs.slump} onChange={e => handleInputChange('slump', e.target.value)} />
                    </div>
                </div>
                <Tabs defaultValue="numerical">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="numerical">Hasil Numerik</TabsTrigger>
                        <TabsTrigger value="gradation">Gradasi</TabsTrigger>
                    </TabsList>
                    <TabsContent value="numerical" className="pt-4">
                        {error ? (
                            <div className="text-sm text-destructive p-2 border border-destructive/50 rounded-md flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" /> {error}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <ResultCard title="f'cr Target" data={previewResults?.fcr.toFixed(2) || '-'} unit="MPa" />
                                <ResultCard title="FAS" data={previewResults?.wcRatio.toFixed(2) || '-'} unit="" />
                                <ResultCard title="Kebutuhan Air" data={previewResults?.waterContent.toFixed(2) || '-'} unit="kg/m³" />
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="gradation">
                        <div className="h-64 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={gradationChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                                    <XAxis dataKey="size" type="number" scale="log" domain={[0.1, 100]} reversed ticks={[0.15, 1.18, 4.75, 20, 50]} tick={{ fontSize: 8 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                                    <Tooltip contentStyle={{ fontSize: 10, padding: '4px 8px' }} />
                                    <Legend wrapperStyle={{ fontSize: 10 }} />
                                    <Line type="monotone" dataKey="Gabungan" stroke="#16a34a" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="Batas Atas" stroke="#ef4444" strokeDasharray="3 3" dot={false} />
                                    <Line type="monotone" dataKey="Batas Bawah" stroke="#ef4444" strokeDasharray="3 3" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
