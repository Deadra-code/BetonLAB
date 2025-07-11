// Lokasi file: src/features/Reporting/components/StrengthChartComponent.jsx
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const StrengthChartComponent = ({ trialData, properties }) => {
    const chartData = useMemo(() => {
        const testedSpecimens = trialData?.tests?.filter(t => t.status === 'Telah Diuji') || [];
        if (testedSpecimens.length === 0) return [];
        
        const grouped = testedSpecimens.reduce((acc, test) => {
            const age = test.age_days;
            if (!acc[age]) {
                acc[age] = { age, totalStrength: 0, count: 0 };
            }
            const result = test.result_data;
            acc[age].totalStrength += result.strength_MPa || 0;
            acc[age].count++;
            return acc;
        }, {});

        return Object.values(grouped)
            .map(group => ({
                age: group.age,
                strength: group.totalStrength / group.count
            }))
            .sort((a, b) => a.age - b.age);
    }, [trialData]);

    if (!trialData || !trialData.tests || chartData.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Grafik Kuat Tekan tidak tersedia</div>;
    }

    return (
        <div className="text-sm my-4" id={`strength-chart-${trialData.id}`}>
            <h3 className="font-bold mb-2 text-base">{properties?.title || "Grafik Perkembangan Kuat Tekan"}</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" label={{ value: 'Umur (hari)', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Kuat Tekan (MPa)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)} MPa`} />
                        <Legend verticalAlign="top" />
                        <Line type="monotone" dataKey="strength" name="Kuat Tekan Rata-rata" stroke="#16a34a" strokeWidth={2} />
                        {trialData?.design_result?.fcr && (
                            <ReferenceLine y={trialData.design_result.fcr} label={{ value: `Target f'cr`, position: 'insideTopLeft' }} stroke="#ef4444" strokeDasharray="3 3" />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StrengthChartComponent;
