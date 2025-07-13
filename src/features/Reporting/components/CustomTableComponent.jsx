// Lokasi file: src/features/Reporting/components/CustomTableComponent.jsx
// Deskripsi: Komponen baru untuk merender tabel kustom yang dapat diisi secara manual.

import React from 'react';

const CustomTableComponent = ({ properties }) => {
    // Ekstrak properti dengan nilai default
    const {
        rowCount = 2,
        colCount = 2,
        cells = {}, // contoh: { '0-0': 'Teks Sel 1', '0-1': 'Teks Sel 2' }
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
    } = properties || {};

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

    // Buat array untuk iterasi
    const rows = Array.from({ length: rowCount }, (_, i) => i);
    const cols = Array.from({ length: colCount }, (_, i) => i);

    return (
        <div className="text-sm my-4">
            <table style={tableStyle}>
                <tbody>
                    {rows.map(rowIndex => (
                        <tr key={rowIndex}>
                            {cols.map(colIndex => (
                                <td key={colIndex} style={tdStyle}>
                                    {cells[`${rowIndex}-${colIndex}`] || ''}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomTableComponent;
