// Lokasi file: src/features/Reporting/components/CombinedGradationChart.jsx
// Deskripsi: Komponen untuk menampilkan grafik gradasi gabungan.

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useActiveMaterialProperties } from '../../../hooks/useActiveMaterialProperties';

const CombinedGradationChart = ({ trialData, properties, apiReady }) => {
    const { activeProperties } = useActiveMaterialProperties(apiReady);
    const { title = "Grafik Gradasi Gabungan" } = properties || {};
    
    const chartData = useMemo(() => {
        if (!trialData?.design_input || !trialData?.design_result || activeProperties.fineAggregates.length === 0 || activeProperties.coarseAggregates.length === 0) {
            return [];
        }

        const fineAggr = activeProperties.fineAggregates.find(m => m.id === trialData.design_input.selectedFineId);
        const coarseAggr = activeProperties.coarseAggregates.find(m => m.id === trialData.design_input.selectedCoarseId);
        
        if (!fineAggr?.properties.sieve_table || !coarseAggr?.properties.sieve_table) {
            return [];
        }

        const fineSieve = fineAggr.properties.sieve_table;
        const coarseSieve = coarseAggr.properties.sieve_table;
        const mix = trialData.design_result;

        const totalWeight = mix.fineAggrWeightSSD + mix.coarseAggrWeightSSD;
        if (totalWeight === 0) return [];
        
        const fineRatio = mix.fineAggrWeightSSD / totalWeight;
        const coarseRatio = mix.coarseAggrWeightSSD / totalWeight;

        const allSieveSizes = [...new Set([...Object.keys(fineSieve), ...Object.keys(coarseSieve)])]
            .map(s => parseFloat(s)).sort((a, b) => b - a);

        return allSieveSizes.map(size => {
            const finePassing = fineSieve[String(size)]?.passingPercent ?? 100;
            const coarsePassing = coarseSieve[String(size)]?.passingPercent ?? 100;
            return {
                size: size,
                'Gabungan': (finePassing * fineRatio) + (coarsePassing * coarseRatio),
            };
        });
    }, [trialData, activeProperties]);

    if (chartData.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data saringan tidak lengkap untuk menampilkan grafik.</div>;
    }

    return (
        <div className="text-sm my-4">
            <h3 className="font-bold mb-2 text-base">{title}</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="size" type="number" scale="log" domain={[0.1, 100]} reversed ticks={[0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 10, 20, 40, 100]} label={{ value: "Ukuran Saringan (mm)", position: "insideBottom", offset: -15 }} />
                        <YAxis domain={[0, 100]} label={{ value: '% Lolos', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                        <Legend verticalAlign="top" />
                        <Line type="monotone" dataKey="Gabungan" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CombinedGradationChart;
