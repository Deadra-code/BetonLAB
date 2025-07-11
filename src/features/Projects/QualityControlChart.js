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
import { AlertTriangle, TrendingUp } from 'lucide-react';

// Komponen untuk titik data pada scatter plot
const CustomizedDot = (props) => {
    const { cx, cy, payload, ucl, lcl } = props;
    const isOutOfControl = payload.strength > ucl || payload.strength < lcl;
  
    if (isOutOfControl) {
      return <circle cx={cx} cy={cy} r={6} stroke="red" strokeWidth={2} fill="white" />;
    }
  
    return <circle cx={cx} cy={cy} r={4} fill="#16a34a" />;
};

// PEMANTAPAN: Fungsi untuk mendeteksi tren berdasarkan Nelson Rules (Rule 2)
const checkForTrends = (data, mean) => {
    if (data.length < 7) return null;

    for (let i = 0; i <= data.length - 7; i++) {
        const segment = data.slice(i, i + 7);
        const allAbove = segment.every(p => p.strength > mean);
        const allBelow = segment.every(p => p.strength < mean);

        if (allAbove) {
            return `Peringatan Tren: 7 titik berturut-turut di atas rata-rata, dimulai dari pengujian ke-${segment[0].index}.`;
        }
        if (allBelow) {
            return `Peringatan Tren: 7 titik berturut-turut di bawah rata-rata, dimulai dari pengujian ke-${segment[0].index}.`;
        }
    }
    return null;
};


export default function QualityControlChart({ tests, targetStrength }) {
    const chartData = useMemo(() => {
        const testedSpecimens = tests
            .filter(t => t.status === 'Telah Diuji' && t.result_data?.strength_MPa)
            .map((t, index) => ({
                index: index + 1,
                id: t.specimen_id,
                strength: t.result_data.strength_MPa,
            }));
        
        if (testedSpecimens.length < 2) {
            return { data: [], stats: null, trendWarning: null };
        }

        const strengths = testedSpecimens.map(t => t.strength);
        const sum = strengths.reduce((a, b) => a + b, 0);
        const mean = sum / strengths.length;
        const stdDev = Math.sqrt(strengths.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (strengths.length -1));
        
        const ucl = mean + 3 * stdDev;
        const lcl = mean - 3 * stdDev;

        const trendWarning = checkForTrends(testedSpecimens, mean);

        return {
            data: testedSpecimens,
            stats: { mean, ucl, lcl, stdDev },
            trendWarning,
        };
    }, [tests]);

    if (!chartData.stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Grafik Kontrol Kualitas Statistik</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Data tidak cukup.</p>
                    <p className="text-xs text-muted-foreground">Dibutuhkan minimal 2 hasil pengujian untuk membuat grafik kontrol.</p>
                </CardContent>
            </Card>
        );
    }

    const { data, stats, trendWarning } = chartData;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Grafik Kontrol Kualitas Statistik</CardTitle>
                <CardDescription>
                    Menampilkan hasil uji kuat tekan individual beserta batas kontrol statistik (±3 deviasi standar).
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* PEMANTAPAN: Menampilkan peringatan tren */}
                {trendWarning && (
                    <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-center">
                        <TrendingUp className="h-5 w-5 mr-3" />
                        <p className="text-sm">{trendWarning}</p>
                    </div>
                )}
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" type="number" allowDecimals={false}>
                                <Label value="Urutan Pengujian" offset={-15} position="insideBottom" />
                            </XAxis>
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']}>
                                <Label value="Kuat Tekan (MPa)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                            </YAxis>
                            <Tooltip formatter={(value, name, props) => [`${props.payload.id}: ${value.toFixed(2)} MPa`, 'Hasil Uji']} />
                            <Legend verticalAlign="top" />

                            {targetStrength && (
                                <ReferenceLine y={targetStrength} stroke="#8884d8" strokeDasharray="5 5">
                                    <Label value={`Target f'cr: ${targetStrength.toFixed(2)}`} position="insideTopLeft" fill="#8884d8" />
                                </ReferenceLine>
                            )}

                            <ReferenceLine y={stats.ucl} stroke="#ef4444" strokeWidth={2}>
                                <Label value={`BKA: ${stats.ucl.toFixed(2)}`} position="top" fill="#ef4444" fontSize={12} />
                            </ReferenceLine>
                            <ReferenceLine y={stats.lcl} stroke="#ef4444" strokeWidth={2}>
                                <Label value={`BKB: ${stats.lcl.toFixed(2)}`} position="bottom" fill="#ef4444" fontSize={12} />
                            </ReferenceLine>
                            
                            <Line dataKey={() => stats.mean} name={`Rata-rata (${stats.mean.toFixed(2)})`} stroke="#16a34a" strokeWidth={2} dot={false} activeDot={false} />
                            
                            <Scatter dataKey="strength" name="Hasil Uji" fill="#16a34a" shape={<CustomizedDot ucl={stats.ucl} lcl={stats.lcl} />} />

                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
