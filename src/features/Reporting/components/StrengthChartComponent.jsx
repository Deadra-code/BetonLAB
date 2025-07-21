// Lokasi file: src/features/Reporting/components/StrengthChartComponent.jsx
// Implementasi: Rancangan #7 - Analisis Prediktif Kekuatan Beton Sederhana
// Deskripsi: Menambahkan garis proyeksi kekuatan 28 hari pada grafik berdasarkan
// data yang ada, memberikan wawasan prediktif kepada pengguna.

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
        showDataLabels = false,
        axisFontSize = 10,
        axisColor = '#666666',
    } = properties || {};

    const { chartData, predictionData } = useMemo(() => {
        const testedSpecimens = trialData?.tests?.filter(t => t.status === 'Telah Diuji' && t.result_data?.strength_MPa) || [];
        if (testedSpecimens.length === 0) return { chartData: [], predictionData: null };
        
        const grouped = testedSpecimens.reduce((acc, test) => {
            const age = test.age_days;
            if (!acc[age]) { acc[age] = { age, totalStrength: 0, count: 0 }; }
            acc[age].totalStrength += test.result_data.strength_MPa || 0;
            acc[age].count++;
            return acc;
        }, {});

        const calculatedChartData = Object.values(grouped).map(group => ({ age: group.age, strength: group.totalStrength / group.count })).sort((a, b) => a.age - b.age);

        // --- RANCANGAN #7: Logika Analisis Prediktif ---
        let calculatedPredictionData = null;
        if (calculatedChartData.length >= 2) {
            // Menggunakan model f'c = a * log(t) + b
            // Ambil dua titik pertama untuk membuat model sederhana
            const point1 = calculatedChartData[0];
            const point2 = calculatedChartData[1];

            const log_t1 = Math.log(point1.age);
            const log_t2 = Math.log(point2.age);
            const fc1 = point1.strength;
            const fc2 = point2.strength;

            // Hindari pembagian dengan nol jika umurnya sama
            if (log_t1 !== log_t2) {
                const a = (fc2 - fc1) / (log_t2 - log_t1);
                const b = fc1 - a * log_t1;
                
                const predictStrength = (age) => a * Math.log(age) + b;

                const lastAge = calculatedChartData[calculatedChartData.length - 1].age;
                
                // Hanya tampilkan prediksi jika umur terakhir < 28 hari
                if (lastAge < 28) {
                     calculatedPredictionData = {
                        projected28DayStrength: predictStrength(28),
                        // Buat titik data untuk garis prediksi dari titik terakhir ke 28 hari
                        linePoints: [
                            calculatedChartData[calculatedChartData.length - 1],
                            { age: 28, strength: predictStrength(28) }
                        ]
                    };
                }
            }
        }

        return { chartData: calculatedChartData, predictionData: calculatedPredictionData };
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
                    <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="age" type="number" domain={['dataMin', 28]} allowDataOverflow ticks={[3, 7, 14, 21, 28]} tick={{ fontSize: axisFontSize, fill: axisColor }}>
                            <Label value="Umur (hari)" offset={-15} position="insideBottom" />
                        </XAxis>
                        <YAxis tick={{ fontSize: axisFontSize, fill: axisColor }}>
                             <Label value="Kuat Tekan (MPa)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>
                        <Tooltip formatter={(value) => `${value.toFixed(2)} MPa`} />
                        {showLegend && <Legend verticalAlign="top" />}
                        <Line type="monotone" dataKey="strength" name="Kuat Tekan Rata-rata" stroke={lineColor} strokeWidth={lineWidth} label={showDataLabels ? { position: 'top', fontSize: 8 } : false} data={chartData} />
                        
                        {/* --- RANCANGAN #7: Render Garis Prediksi --- */}
                        {predictionData && (
                            <Line 
                                type="monotone" 
                                dataKey="strength" 
                                name={`Prediksi 28 Hari (${predictionData.projected28DayStrength.toFixed(2)} MPa)`}
                                data={predictionData.linePoints}
                                stroke={lineColor} 
                                strokeWidth={lineWidth} 
                                strokeDasharray="5 5" 
                                dot={{ r: 4, fill: lineColor }}
                            />
                        )}

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
