// Lokasi file: src/features/Reporting/components/StrengthChartComponent.jsx
// Deskripsi: Komponen grafik kuat tekan dengan kustomisasi sumbu dan label.

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

const StrengthChartComponent = ({ trialData, properties }) => {
    const {
        title = "Grafik Perkembangan Kuat Tekan",
        subtitle = "",
        showGrid = true,
        showLegend = true,
        legendPosition = "top",
        lineColor = "#16a34a",
        lineWidth = 2,
        showFcrLine = true,
        // PENERAPAN LANGKAH 1.3
        showDataLabels = false,
        axisFontSize = 10,
        axisColor = '#666666',
    } = properties || {};

    const chartData = useMemo(() => {
        const testedSpecimens = trialData?.tests?.filter(t => t.status === 'Telah Diuji' && t.result_data?.strength_MPa) || [];
        if (testedSpecimens.length === 0) return [];
        
        const grouped = testedSpecimens.reduce((acc, test) => {
            const age = test.age_days;
            if (!acc[age]) { acc[age] = { age, totalStrength: 0, count: 0 }; }
            acc[age].totalStrength += test.result_data.strength_MPa || 0;
            acc[age].count++;
            return acc;
        }, {});

        return Object.values(grouped).map(group => ({ age: group.age, strength: group.totalStrength / group.count })).sort((a, b) => a.age - b.age);
    }, [trialData]);

    if (!trialData || !trialData.tests || chartData.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Grafik Kuat Tekan tidak tersedia</div>;
    }

    return (
        <div className="text-sm my-4" id={`strength-chart-${trialData.id}`}>
            <h3 className="font-bold mb-1 text-base">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="age" tick={{ fontSize: axisFontSize, fill: axisColor }}>
                            <Label value="Umur (hari)" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis tick={{ fontSize: axisFontSize, fill: axisColor }}>
                             <Label value="Kuat Tekan (MPa)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={(value) => `${value.toFixed(2)} MPa`} />
                        {showLegend && <Legend verticalAlign={legendPosition} />}
                        <Line type="monotone" dataKey="strength" name="Kuat Tekan Rata-rata" stroke={lineColor} strokeWidth={lineWidth} label={showDataLabels ? { position: 'top', fontSize: 8 } : false} />
                        {showFcrLine && trialData?.design_result?.fcr && (
                            <ReferenceLine y={trialData.design_result.fcr} label={{ value: `Target f'cr: ${trialData.design_result.fcr.toFixed(2)}`, position: 'insideTopLeft' }} stroke="#ef4444" strokeDasharray="3 3" />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StrengthChartComponent;
