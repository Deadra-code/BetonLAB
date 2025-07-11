import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GradationAnalysis = ({ sieveData, onSieveChange, onRatioChange }) => {
    const sieveSizes = [100, 50, 40, 25, 20, 12.5, 10, 4.75, 2.36, 1.18, 0.60, 0.30, 0.15];
    const sniboundaries = { '4.75': [95, 100], '2.36': [80, 100], '1.18': [50, 85], '0.60': [25, 60], '0.30': [10, 30], '0.15': [2, 10] };

    const chartData = useMemo(() => {
        return sieveSizes.map(size => {
            const finePassing = Number(sieveData.fine[size] || 0);
            const coarsePassing = Number(sieveData.coarse[size] || 0);
            const ratio = Number(sieveData.combinationRatio) / 100;
            const combinedPassing = (finePassing * (1 - ratio)) + (coarsePassing * ratio);
            const boundary = sniboundaries[size] || [null, null];
            return { size: size, 'Pasir': finePassing, 'Kerikil': coarsePassing, 'Gabungan': combinedPassing, 'Batas Atas SNI': boundary[1], 'Batas Bawah SNI': boundary[0] };
        }).reverse();
    }, [sieveData]);

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Kurva Gradasi Agregat</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis dataKey="size" type="number" scale="log" domain={['auto', 'auto']} reversed={true} label={{ value: "Ukuran Saringan (mm) - Skala Log", position: "insideBottom", offset: -15 }} ticks={[0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 10, 20, 40, 100]} stroke="currentColor" />
                            <YAxis domain={[0, 100]} label={{ value: '% Lolos', angle: -90, position: 'insideLeft' }} stroke="currentColor"/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: 'none' }} itemStyle={{ color: '#e5e7eb' }}/>
                            <Legend verticalAlign="top" height={40} />
                            <Line type="monotone" dataKey="Pasir" stroke="#facc15" strokeWidth={2} />
                            <Line type="monotone" dataKey="Kerikil" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="Gabungan" stroke="#16a34a" strokeWidth={3} />
                            <Line type="step" dataKey="Batas Atas SNI" stroke="#ef4444" strokeDasharray="5 5" name="Batas Atas" />
                            <Line type="step" dataKey="Batas Bawah SNI" stroke="#ef4444" strokeDasharray="5 5" name="Batas Bawah" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Input Data Saringan</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rasio Agregat Kasar (%)</label>
                        <input type="range" min="0" max="100" value={sieveData.combinationRatio} onChange={onRatioChange} className="w-full" />
                        <span className="text-center block font-semibold text-gray-800 dark:text-white">{sieveData.combinationRatio}% Kerikil, {100 - sieveData.combinationRatio}% Pasir</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center font-bold mb-2 text-gray-800 dark:text-white">
                        <div>Saringan</div><div>Pasir (%)</div><div>Kerikil (%)</div>
                    </div>
                    <div className="max-h-80 overflow-y-auto pr-2">
                        {sieveSizes.map(size => (
                            <div key={size} className="grid grid-cols-3 gap-2 items-center mb-1">
                                <label className="text-sm font-medium text-right pr-2 text-gray-700 dark:text-gray-300">{size}</label>
                                <input type="number" value={sieveData.fine[size] || ''} onChange={(e) => onSieveChange('fine', size, e.target.value)} className="w-full p-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                                <input type="number" value={sieveData.coarse[size] || ''} onChange={(e) => onSieveChange('coarse', size, e.target.value)} className="w-full p-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"/>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradationAnalysis;
