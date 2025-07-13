// Lokasi file: src/features/Reporting/components/JmdTableComponent.jsx
// Deskripsi: Komponen untuk merender tabel Job Mix Design dengan styling kustom.

import React from 'react';

const JmdTableComponent = ({ trialData, properties }) => {
    const { design_input, design_result } = trialData || {};

    // Ekstrak properti kustomisasi dengan nilai default
    const {
        showCorrected = true,
        showSsd = true,
        headerBgColor = '#E5E7EB', // abu-abu muda
        headerTextColor = '#111827', // abu-abu gelap
        borderColor = '#9CA3AF', // abu-abu
        borderWidth = 1,
    } = properties || {};

    if (!design_input || !design_result) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data JMD tidak tersedia</div>;
    }

    const tableStyle = {
        borderCollapse: 'collapse',
        width: '100%',
        border: `${borderWidth}px solid ${borderColor}`,
    };
    const thStyle = {
        backgroundColor: headerBgColor,
        color: headerTextColor,
        padding: '8px',
        border: `${borderWidth}px solid ${borderColor}`,
        textAlign: 'left',
    };
    const tdStyle = {
        padding: '8px',
        border: `${borderWidth}px solid ${borderColor}`,
    };

    return (
        <div className="text-sm">
            <h3 className="font-bold mb-2 text-base">Tabel Rencana Campuran (Job Mix Design)</h3>
            {showSsd && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th colSpan="2" style={thStyle}>Proporsi per 1 m³ (Kondisi SSD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={tdStyle} width="50%">Semen</td>
                            <td style={tdStyle}>{design_result.cementContent?.toFixed(2)} kg</td>
                        </tr>
                         <tr>
                            <td style={tdStyle}>Air</td>
                            <td style={tdStyle}>{design_result.waterContent?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>Agregat Kasar</td>
                            <td style={tdStyle}>{design_result.coarseAggrWeightSSD?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>Agregat Halus</td>
                            <td style={tdStyle}>{design_result.fineAggrWeightSSD?.toFixed(2)} kg</td>
                        </tr>
                    </tbody>
                </table>
            )}
            {showCorrected && (
                 <table style={{...tableStyle, marginTop: '16px'}}>
                    <thead>
                        <tr>
                            <th colSpan="2" style={thStyle}>Proporsi per 1 m³ (Koreksi Lapangan)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={tdStyle} width="50%">Air Koreksi</td>
                            <td style={tdStyle}>{design_result.correctedWater?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>Agregat Kasar Lembab</td>
                            <td style={tdStyle}>{design_result.correctedCoarseWeight?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>Agregat Halus Lembab</td>
                            <td style={tdStyle}>{design_result.correctedFineWeight?.toFixed(2)} kg</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default JmdTableComponent;
