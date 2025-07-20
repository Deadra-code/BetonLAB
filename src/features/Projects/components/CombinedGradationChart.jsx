// src/features/Projects/components/CombinedGradationChart.jsx (FILE BARU)
// Deskripsi: Komponen grafik untuk menampilkan kurva gradasi gabungan di halaman JobMixDesign.

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

export const CombinedGradationChart = ({ chartRef, fineAggregate, coarseAggregate, mixProportions }) => {
    const chartData = useMemo(() => {
        if (!fineAggregate || !coarseAggregate || !mixProportions) return [];
        
        const fineSieve = fineAggregate.properties.sieve_table;
        const coarseSieve = coarseAggregate.properties.sieve_table;
        if (!fineSieve || !coarseSieve) return [];

        const totalWeight = mixProportions.fineAggrWeightSSD + mixProportions.coarseAggrWeightSSD;
        if (totalWeight === 0) return [];
        
        const fineRatio = mixProportions.fineAggrWeightSSD / totalWeight;
        const coarseRatio = mixProportions.coarseAggrWeightSSD / totalWeight;

        const allSieveSizes = [...new Set([...Object.keys(fineSieve), ...Object.keys(coarseSieve)])]
            .map(s => parseFloat(s)).sort((a, b) => b - a);

        return allSieveSizes.map(size => {
            const finePassing = fineSieve[String(size)]?.passingPercent || 0;
            const coarsePassing = coarseSieve[String(size)]?.passingPercent || 0;
            return {
                size: size,
                'Gabungan': (finePassing * fineRatio) + (coarsePassing * coarseRatio),
            };
        });
    }, [fineAggregate, coarseAggregate, mixProportions]);

    if (chartData.length === 0) {
        return <p className="text-sm text-center py-10 text-muted-foreground">Data saringan tidak lengkap untuk menampilkan grafik.</p>;
    }

    return (
        <div ref={chartRef} className="bg-card p-4 rounded-lg border h-full w-full">
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="size" 
                        type="number" 
                        scale="log" 
                        domain={[0.1, 100]} 
                        reversed 
                        ticks={[0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 10, 20, 40, 100]}
                    >
                        <Label value="Ukuran Saringan (mm)" offset={-15} position="insideBottom" />
                    </XAxis>
                    <YAxis domain={[0, 100]}>
                        <Label value='% Lolos' angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} />
                    </YAxis>
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="Gabungan" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
