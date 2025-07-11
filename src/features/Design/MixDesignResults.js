import React from 'react';
import ResultCard from '../../components/ResultCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, ChevronsRight, Droplet, Wind, Package, Component, Waves } from 'lucide-react';
import { sniReferenceData } from '../../data/sniData';

const VolumePieChart = ({ results }) => {
    if (!results || !results.volumes) return null;
    const { volWater, volCement, volCoarseSSD, volFineSSD, volAir } = results.volumes;
    const data = [
        { name: 'Semen', value: volCement }, { name: 'Air', value: volWater },
        { name: 'Kerikil', value: volCoarseSSD }, { name: 'Pasir', value: volFineSSD },
        { name: 'Udara', value: volAir },
    ];
    const COLORS = ['#71717a', '#3b82f6', '#6366f1', '#facc15', '#e5e7eb'];
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Proporsi Volume Absolut</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(4)} m³`} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const MixDesignResults = ({ results, error, validationWarnings, setInfoPopupContent, volumeChartRef }) => {
    return (
        <div className="mt-8 md:mt-0">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-600">Hasil Perhitungan</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">{error}</div>}
            {!results && !error && (
                <div className="text-center py-12 px-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <FileText size={48} className="mx-auto text-gray-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Hasil perhitungan akan ditampilkan di sini.</p>
                </div>
            )}
            {results && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Parameter Kunci</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ResultCard title="Kuat Tekan Target (f'cr)" data={results.fcr.toFixed(2)} unit="MPa" icon={<ChevronsRight size={20}/>} />
                            <ResultCard title="Faktor Air/Semen (FAS)" data={results.wcRatio.toFixed(2)} unit="" icon={<Droplet size={20}/>} warning={validationWarnings.wcRatio} onInfoClick={() => setInfoPopupContent(sniReferenceData.wcRatio)} />
                            <ResultCard title="Kandungan Udara" data={results.airContent.toFixed(1)} unit="%" icon={<Wind size={20}/>} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-3 mt-6">Proporsi Campuran (Kondisi SSD) per 1 m³</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ResultCard title="Semen" data={results.cementContent.toFixed(2)} unit="kg" icon={<Package size={20}/>} />
                            <ResultCard title="Air" data={results.waterContent.toFixed(2)} unit="kg (liter)" icon={<Droplet size={20}/>} />
                            <ResultCard title="Agregat Kasar" data={results.coarseAggrWeightSSD.toFixed(2)} unit="kg" icon={<Component size={20}/>} />
                            <ResultCard title="Agregat Halus" data={results.fineAggrWeightSSD.toFixed(2)} unit="kg" icon={<Waves size={20}/>} />
                        </div>
                    </div>
                    <div className="pt-4">
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 mt-4 border-t pt-4 dark:border-gray-600">Proporsi Terkoreksi (Lapangan) per 1 m³</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ResultCard title="Semen" data={results.cementContent.toFixed(2)} unit="kg" icon={<Package size={20}/>} />
                            <ResultCard title="Air" data={results.correctedWater.toFixed(2)} unit="kg (liter)" icon={<Droplet size={20}/>} />
                            <ResultCard title="Agregat Kasar (Lembab)" data={results.correctedCoarseWeight.toFixed(2)} unit="kg" icon={<Component size={20}/>} />
                            <ResultCard title="Agregat Halus (Lembab)" data={results.correctedFineWeight.toFixed(2)} unit="kg" icon={<Waves size={20}/>} />
                        </div>
                    </div>
                    <div ref={volumeChartRef}>
                        <VolumePieChart results={results} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MixDesignResults;
