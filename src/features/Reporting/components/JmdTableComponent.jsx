// Lokasi file: src/features/Reporting/components/JmdTableComponent.jsx
// Deskripsi: Komponen untuk merender tabel Job Mix Design.

import React from 'react';

const JmdTableComponent = ({ trialData, properties }) => {
    // Komponen ini menggunakan data dari 'trialData'
    const { design_input, design_result } = trialData || {};

    if (!design_input || !design_result) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data JMD tidak tersedia</div>;
    }

    const showCorrected = properties?.showCorrected ?? true;
    const showSsd = properties?.showSsd ?? true;

    return (
        <div className="text-sm">
            <h3 className="font-bold mb-2 text-base">Tabel Rencana Campuran (Job Mix Design)</h3>
            {showSsd && (
                <table className="w-full border-collapse border border-gray-400">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th colSpan="2" className="p-2 border border-gray-400 text-left">Proporsi per 1 m³ (Kondisi SSD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border border-gray-400 w-1/2">Semen</td>
                            <td className="p-2 border border-gray-400">{design_result.cementContent?.toFixed(2)} kg</td>
                        </tr>
                         <tr>
                            <td className="p-2 border border-gray-400">Air</td>
                            <td className="p-2 border border-gray-400">{design_result.waterContent?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-gray-400">Agregat Kasar</td>
                            <td className="p-2 border border-gray-400">{design_result.coarseAggrWeightSSD?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-gray-400">Agregat Halus</td>
                            <td className="p-2 border border-gray-400">{design_result.fineAggrWeightSSD?.toFixed(2)} kg</td>
                        </tr>
                    </tbody>
                </table>
            )}
            {showCorrected && (
                 <table className="w-full border-collapse border border-gray-400 mt-4">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th colSpan="2" className="p-2 border border-gray-400 text-left">Proporsi per 1 m³ (Koreksi Lapangan)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border border-gray-400 w-1/2">Air Koreksi</td>
                            <td className="p-2 border border-gray-400">{design_result.correctedWater?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-gray-400">Agregat Kasar Lembab</td>
                            <td className="p-2 border border-gray-400">{design_result.correctedCoarseWeight?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td className="p-2 border border-gray-400">Agregat Halus Lembab</td>
                            <td className="p-2 border border-gray-400">{design_result.correctedFineWeight?.toFixed(2)} kg</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default JmdTableComponent;
