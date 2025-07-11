import React from 'react';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowLeft, FileOutput } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { exportComparisonToCsv } from '../../utils/csvExporter'; // PEMANTAPAN: Import fungsi ekspor baru

export default function TrialComparisonView({ trials, onBack }) {
    if (!trials || trials.length < 2) {
        return (
            <div className="p-6">
                <p>Terjadi kesalahan. Pilih setidaknya dua trial untuk dibandingkan.</p>
                <Button onClick={onBack} className="mt-4">Kembali</Button>
            </div>
        );
    }

    const comparisonParameters = [
        { key: 'fc', label: "f'c Rencana (MPa)", path: 'design_input.fc' },
        { key: 'slump', label: 'Slump (mm)', path: 'design_input.slump' },
        { key: 'fcr', label: "f'cr Target (MPa)", path: 'design_result.fcr', precision: 2 },
        { key: 'wcRatio', label: 'FAS', path: 'design_result.wcRatio', precision: 2 },
        { key: 'cementContent', label: 'Semen (kg/m³)', path: 'design_result.cementContent', precision: 2 },
        { key: 'correctedWater', label: 'Air Koreksi (kg/m³)', path: 'design_result.correctedWater', precision: 2 },
        { key: 'correctedCoarseWeight', label: 'Ag. Kasar Lembab (kg/m³)', path: 'design_result.correctedCoarseWeight', precision: 2 },
        { key: 'correctedFineWeight', label: 'Ag. Halus Lembab (kg/m³)', path: 'design_result.correctedFineWeight', precision: 2 },
    ];

    const getValue = (obj, path, precision) => {
        const value = path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
        if (typeof value === 'number' && precision !== undefined) {
            return value.toFixed(precision);
        }
        return value || '-';
    };

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
                {/* PEMANTAPAN: Tombol untuk ekspor CSV tabular */}
                <Button onClick={() => exportComparisonToCsv({ trials })}>
                    <FileOutput className="mr-2 h-4 w-4" /> Ekspor ke CSV
                </Button>
            </header>
            
            <div className="flex-grow overflow-auto">
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
                                        {trials.map(trial => (
                                            <TableCell key={trial.id} className="text-center">
                                                {getValue(trial, param.path, param.precision)}
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
