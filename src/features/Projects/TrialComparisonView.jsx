// Lokasi file: src/features/Projects/TrialComparisonView.js
// Deskripsi: Penambahan grafik perbandingan visual untuk wawasan yang lebih cepat.

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowLeft, FileOutput, BarChart2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { exportComparisonToCsv } from '../../utils/csvExporter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import * as api from '../../api/electronAPI';

export default function TrialComparisonView({ trials, onBack }) {
    const [comparisonData, setComparisonData] = useState([]);
    const [chartParameter, setChartParameter] = useState('avgStrength');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestData = async () => {
            setLoading(true);
            const enrichedTrials = await Promise.all(
                trials.map(async (trial) => {
                    const tests = await api.getTestsForTrial(trial.id);
                    const testedSpecimens = tests.filter(t => t.status === 'Telah Diuji' && t.result_data?.strength_MPa);
                    let avgStrength = 0;
                    if (testedSpecimens.length > 0) {
                        const sum = testedSpecimens.reduce((acc, curr) => acc + parseFloat(curr.result_data.strength_MPa), 0);
                        avgStrength = sum / testedSpecimens.length;
                    }
                    return { ...trial, avgStrength };
                })
            );
            setComparisonData(enrichedTrials);
            setLoading(false);
        };

        if (trials.length > 0) {
            fetchTestData();
        }
    }, [trials]);

    const getValue = (obj, path, precision) => {
        const value = path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
        if (typeof value === 'number' && precision !== undefined) {
            return value.toFixed(precision);
        }
        return value || '-';
    };

    const comparisonParameters = [
        { key: 'fc', label: "f'c Rencana (MPa)", path: 'design_input.fc' },
        { key: 'avgStrength', label: 'Kuat Tekan Rata-rata (MPa)', precision: 2 },
        { key: 'fcr', label: "f'cr Target (MPa)", path: 'design_result.fcr', precision: 2 },
        { key: 'wcRatio', label: 'FAS', path: 'design_result.wcRatio', precision: 2 },
        { key: 'cementContent', label: 'Semen (kg/m³)', path: 'design_result.cementContent', precision: 2 },
        { key: 'correctedWater', label: 'Air Koreksi (kg/m³)', path: 'design_result.correctedWater', precision: 2 },
    ];
    
    const chartParameters = [
        { key: 'avgStrength', label: 'Kuat Tekan Rata-rata (MPa)', precision: 2 },
        { key: 'cementContent', label: 'Kadar Semen (kg/m³)', path: 'design_result.cementContent', precision: 2 },
        { key: 'wcRatio', label: 'FAS (W/C Ratio)', path: 'design_result.wcRatio', precision: 2 },
    ];

    const chartData = useMemo(() => {
        return comparisonData.map(trial => {
            const paramInfo = chartParameters.find(p => p.key === chartParameter);
            let value;
            if (paramInfo.key === 'avgStrength') {
                value = trial.avgStrength;
            } else {
                value = getValue(trial, paramInfo.path, 0)
            }
            return {
                name: trial.trial_name,
                [paramInfo.label]: parseFloat(value),
            };
        });
    }, [comparisonData, chartParameter, chartParameters]);


    if (!trials || trials.length < 2) {
        return (
            <div className="p-6">
                <p>Terjadi kesalahan. Pilih setidaknya dua trial untuk dibandingkan.</p>
                <Button onClick={onBack} className="mt-4">Kembali</Button>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <Button onClick={onBack} variant="outline" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Manajemen Proyek
                    </Button>
                    <h1 className="text-3xl font-bold">Perbandingan Trial Mix</h1>
                    <p className="text-muted-foreground">Membandingkan {trials.length} trial mix yang dipilih.</p>
                </div>
                <Button onClick={() => exportComparisonToCsv({ trials: comparisonData })}>
                    <FileOutput className="mr-2 h-4 w-4" /> Ekspor ke CSV
                </Button>
            </header>
            
            <div className="flex-grow overflow-auto space-y-6">
                {/* --- BARU: Grafik Perbandingan --- */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Grafik Perbandingan</CardTitle>
                            <Select value={chartParameter} onValueChange={setChartParameter}>
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Pilih parameter..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {chartParameters.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <CardDescription>Bandingkan parameter kunci antar trial secara visual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-[300px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value, name) => [value.toFixed(2), name]} cursor={{fill: 'hsl(var(--accent))'}} />
                                    <Legend />
                                    <Bar dataKey={chartParameters.find(p => p.key === chartParameter).label} fill="hsl(var(--primary))" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Tabel Data */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold w-[250px]">Parameter</TableHead>
                                    {trials.map(trial => (
                                        <TableHead key={trial.id} className="text-center font-semibold">{trial.trial_name}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comparisonParameters.map(param => (
                                    <TableRow key={param.key}>
                                        <TableCell className="font-medium">{param.label}</TableCell>
                                        {comparisonData.map(trial => (
                                            <TableCell key={trial.id} className="text-center">
                                                {param.key === 'avgStrength' ? trial.avgStrength.toFixed(2) : getValue(trial, param.path, param.precision)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
