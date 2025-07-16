// Lokasi file: src/features/Reporting/components/JmdTableComponent.jsx
// Deskripsi: Komponen kini menerapkan styling dan properti kustom.

import React from 'react';

const JmdTableComponent = ({ trialData, properties }) => {
    const { design_input, design_result } = trialData || {};

    // Ekstrak properti kustomisasi dengan nilai default
    const {
        title = "Tabel Rencana Campuran (Job Mix Design)",
        showCorrected = true,
        showSsd = true,
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
        isZebra = false,
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
        fontWeight: 'bold',
    };
    const tdStyle = {
        padding: '8px',
        border: `${borderWidth}px solid ${borderColor}`,
    };
    const zebraRowStyle = {
        backgroundColor: '#F9FAFB' // gray-50
    };

    return (
        <div className="text-sm">
            <h3 className="font-bold mb-2 text-base">{title}</h3>
            {showSsd && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th colSpan="2" style={thStyle}>Proporsi per 1 m³ (Kondisi SSD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={isZebra ? zebraRowStyle : {}}>
                            <td style={tdStyle} width="50%">Semen</td>
                            <td style={tdStyle}>{design_result.cementContent?.toFixed(2)} kg</td>
                        </tr>
                         <tr>
                            <td style={tdStyle}>Air</td>
                            <td style={tdStyle}>{design_result.waterContent?.toFixed(2)} kg</td>
                        </tr>
                        <tr style={isZebra ? zebraRowStyle : {}}>
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
                 <table style={{...tableStyle, marginTop: showSsd ? '16px' : '0px'}}>
                    <thead>
                        <tr>
                            <th colSpan="2" style={thStyle}>Proporsi per 1 m³ (Koreksi Lapangan)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={isZebra ? zebraRowStyle : {}}>
                            <td style={tdStyle} width="50%">Air Koreksi</td>
                            <td style={tdStyle}>{design_result.correctedWater?.toFixed(2)} kg</td>
                        </tr>
                        <tr>
                            <td style={tdStyle}>Agregat Kasar Lembab</td>
                            <td style={tdStyle}>{design_result.correctedCoarseWeight?.toFixed(2)} kg</td>
                        </tr>
                        <tr style={isZebra ? zebraRowStyle : {}}>
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
