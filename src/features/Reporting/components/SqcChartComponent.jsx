// Lokasi file: src/features/Reporting/components/SqcChartComponent.jsx
import React, { useMemo } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

const SqcChartComponent = ({ trialData, properties }) => {
    const chartData = useMemo(() => {
        const testedSpecimens = trialData?.tests
            ?.filter(t => t.status === 'Telah Diuji' && t.result_data?.strength_MPa)
            .map((t, index) => ({
                index: index + 1,
                id: t.specimen_id,
                strength: t.result_data.strength_MPa,
            })) || [];
        
        if (testedSpecimens.length < 2) {
            return { data: [], stats: null };
        }

        const strengths = testedSpecimens.map(t => t.strength);
        const sum = strengths.reduce((a, b) => a + b, 0);
        const mean = sum / strengths.length;
        const stdDev = Math.sqrt(strengths.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (strengths.length - 1));
        
        const ucl = mean + 3 * stdDev;
        const lcl = mean - 3 * stdDev;

        return {
            data: testedSpecimens,
            stats: { mean, ucl, lcl, stdDev },
        };
    }, [trialData]);

    if (!chartData.stats) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Grafik SQC tidak cukup (min. 2 data)</div>;
    }

    const { data, stats } = chartData;

    return (
        <div className="text-sm my-4" id={`sqc-chart-${trialData.id}`}>
            <h3 className="font-bold mb-2 text-base">{properties?.title || "Grafik Kontrol Kualitas Statistik"}</h3>
            <div className="h-72 w-full">
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
                        <ReferenceLine y={stats.ucl} stroke="#ef4444" strokeWidth={2}>
                            <Label value={`BKA: ${stats.ucl.toFixed(2)}`} position="top" fill="#ef4444" fontSize={12} />
                        </ReferenceLine>
                        <ReferenceLine y={stats.lcl} stroke="#ef4444" strokeWidth={2}>
                            <Label value={`BKB: ${stats.lcl.toFixed(2)}`} position="bottom" fill="#ef4444" fontSize={12} />
                        </ReferenceLine>
                        <Line dataKey={() => stats.mean} name={`Rata-rata (${stats.mean.toFixed(2)})`} stroke="#16a34a" strokeWidth={2} dot={false} activeDot={false} />
                        <Scatter dataKey="strength" name="Hasil Uji" fill="#16a34a" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SqcChartComponent;
