// Lokasi file: src/features/Projects/QualityControlChart.jsx
// Deskripsi: Rombak total untuk menggunakan metode Moving Range (XmR Chart)
// yang lebih sesuai standar industri, memperbaiki bug visual, dan menambahkan
// grafik Moving Range untuk analisis variabilitas.

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { AlertTriangle, TrendingUp, BarChartHorizontal } from 'lucide-react';

// --- Konstanta Statistik untuk Individual & Moving Range Chart (n=2) ---
const D2 = 1.128; // Konstanta untuk mengestimasi sigma dari MR-bar
const D4 = 3.267; // Konstanta untuk menghitung UCL pada MR chart

// --- Fungsi untuk mendeteksi pelanggaran aturan SPC (Nelson Rules) ---
const checkForSpcViolations = (data, mean, ucl, lcl) => {
    const warnings = [];
    if (data.length < 1) return warnings;

    // Aturan 1: Satu titik di luar batas 3-sigma (UCL/LCL)
    const outOfControl = data.find(p => p.strength > ucl || p.strength < lcl);
    if (outOfControl) {
        warnings.push(`Peringatan Aturan 1: Hasil uji #${outOfControl.index} (${outOfControl.strength.toFixed(2)} MPa) berada di luar batas kontrol.`);
    }

    // Aturan 2: Tujuh titik berturut-turut di satu sisi dari garis tengah
    for (let i = 0; i <= data.length - 7; i++) {
        const segment = data.slice(i, i + 7);
        if (segment.every(p => p.strength > mean)) {
            warnings.push(`Peringatan Aturan 2: 7 titik berturut-turut di atas rata-rata (mulai dari uji #${segment[0].index}).`);
            break; 
        }
        if (segment.every(p => p.strength < mean)) {
            warnings.push(`Peringatan Aturan 2: 7 titik berturut-turut di bawah rata-rata (mulai dari uji #${segment[0].index}).`);
            break;
        }
    }
    
    // Aturan 3: Enam titik berturut-turut terus meningkat atau menurun
     for (let i = 0; i <= data.length - 6; i++) {
        const segment = data.slice(i, i + 6);
        if (segment.slice(1).every((p, j) => p.strength > segment[j].strength)) {
            warnings.push(`Peringatan Aturan 3: 6 titik berturut-turut terus meningkat (mulai dari uji #${segment[0].index}).`);
            break;
        }
        if (segment.slice(1).every((p, j) => p.strength < segment[j].strength)) {
            warnings.push(`Peringatan Aturan 3: 6 titik berturut-turut terus menurun (mulai dari uji #${segment[0].index}).`);
            break;
        }
    }

    return warnings;
};


export default function QualityControlChart({ tests, targetStrength }) {
    const chartData = useMemo(() => {
        // PERBAIKAN: Memastikan data di-parse sebagai float untuk mencegah bug sumbu Y
        const testedSpecimens = tests
            .filter(t => t.status === 'Telah Diuji' && t.result_data?.strength_MPa)
            .map((t, index) => ({
                index: index + 1,
                id: t.specimen_id,
                strength: parseFloat(t.result_data.strength_MPa),
            }));
        
        if (testedSpecimens.length < 2) {
            return { data: [], stats: null, spcWarnings: [] };
        }

        // --- PERBAIKAN: Implementasi Perhitungan Berbasis Moving Range ---
        const movingRanges = [];
        for (let i = 1; i < testedSpecimens.length; i++) {
            const range = Math.abs(testedSpecimens[i].strength - testedSpecimens[i-1].strength);
            movingRanges.push(range);
            testedSpecimens[i].movingRange = range;
        }
        testedSpecimens[0].movingRange = null; // Titik pertama tidak punya moving range

        const mrSum = movingRanges.reduce((a, b) => a + b, 0);
        const mrBar = mrSum / movingRanges.length;

        const strengths = testedSpecimens.map(t => t.strength);
        const mean = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        
        const sigmaEstimate = mrBar / D2;
        const ucl = mean + 3 * sigmaEstimate;
        const lcl = mean - 3 * sigmaEstimate;
        const uclMr = D4 * mrBar;

        const spcWarnings = checkForSpcViolations(testedSpecimens, mean, ucl, lcl);

        return {
            data: testedSpecimens,
            stats: { mean, ucl, lcl, mrBar, uclMr },
            spcWarnings,
        };
    }, [tests]);

    if (!chartData.stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Grafik Kontrol Kualitas Statistik</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                    <BarChartHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Data tidak cukup.</p>
                    <p className="text-xs text-muted-foreground">Dibutuhkan minimal 2 hasil pengujian untuk membuat grafik kontrol.</p>
                </CardContent>
            </Card>
        );
    }

    const { data, stats, spcWarnings } = chartData;
    
    // PERBAIKAN: Tooltip yang lebih informatif
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const point = payload[0].payload;
            return (
                <div className="p-2 bg-background/80 border rounded-md shadow-lg backdrop-blur-sm">
                    <p className="font-bold">{`Uji #${label}`}</p>
                    <p className="text-sm">{`ID Benda Uji: ${point.id}`}</p>
                    <p className="text-sm" style={{ color: payload[0].color }}>{`Kuat Tekan: ${point.strength.toFixed(2)} MPa`}</p>
                    {point.movingRange !== null && <p className="text-sm" style={{ color: '#ff7300' }}>{`Moving Range: ${point.movingRange.toFixed(2)}`}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Kontrol Kualitas Statistik (XmR Chart)</CardTitle>
                <CardDescription>
                    Memantau rata-rata proses (Grafik Individual) dan variabilitas proses (Grafik Moving Range).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {spcWarnings.length > 0 && (
                    <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-md space-y-1">
                        <div className="flex items-center font-bold">
                            <AlertTriangle className="h-5 w-5 mr-2" /> Peringatan Kontrol Proses
                        </div>
                        <ul className="list-disc list-inside text-sm pl-2">
                            {spcWarnings.map((warning, i) => <li key={i}>{warning}</li>)}
                        </ul>
                    </div>
                )}
                
                {/* Grafik Individual (X-Chart) */}
                <div>
                    <h4 className="font-semibold text-center text-sm mb-2">Grafik Individual (X)</h4>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" type="number" allowDecimals={false}><Label value="Urutan Pengujian" offset={-15} position="insideBottom" /></XAxis>
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']}><Label value="Kuat Tekan (MPa)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} /></YAxis>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" />

                                {targetStrength && <ReferenceLine y={targetStrength} stroke="#8884d8" strokeDasharray="5 5" label={{ value: `Target f'cr: ${targetStrength.toFixed(2)}`, position: 'insideTopLeft', fill: '#8884d8' }} />}
                                <ReferenceLine y={stats.ucl} stroke="#ef4444" strokeWidth={2} label={{ value: `BKA: ${stats.ucl.toFixed(2)}`, position: 'top', fill: '#ef4444', fontSize: 12 }} />
                                <ReferenceLine y={stats.mean} stroke="#16a34a" strokeWidth={2} strokeDasharray="2 2" label={{ value: `Rata-rata: ${stats.mean.toFixed(2)}`, position: 'insideRight', fill: '#16a34a', fontSize: 12 }} />
                                <ReferenceLine y={stats.lcl} stroke="#ef4444" strokeWidth={2} label={{ value: `BKB: ${stats.lcl.toFixed(2)}`, position: 'bottom', fill: '#ef4444', fontSize: 12 }} />
                                
                                <Scatter dataKey="strength" name="Hasil Uji" fill="#10b981" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* BARU: Grafik Moving Range (MR-Chart) */}
                <div>
                    <h4 className="font-semibold text-center text-sm mb-2">Grafik Moving Range (MR)</h4>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.slice(1)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" type="number" allowDecimals={false}><Label value="Urutan Pengujian" offset={-15} position="insideBottom" /></XAxis>
                                <YAxis domain={[0, 'dataMax + 2']}><Label value="Moving Range" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} /></YAxis>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" />
                                
                                <ReferenceLine y={stats.uclMr} stroke="#ef4444" strokeWidth={2} label={{ value: `BKA: ${stats.uclMr.toFixed(2)}`, position: 'top', fill: '#ef4444', fontSize: 12 }} />
                                <ReferenceLine y={stats.mrBar} stroke="#16a34a" strokeWidth={2} strokeDasharray="2 2" label={{ value: `Rata-rata: ${stats.mrBar.toFixed(2)}`, position: 'insideRight', fill: '#16a34a', fontSize: 12 }} />
                                
                                <Scatter dataKey="movingRange" name="Moving Range" fill="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
