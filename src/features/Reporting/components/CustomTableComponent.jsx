// Lokasi file: src/features/Reporting/components/CustomTableComponent.jsx
// Deskripsi: Komponen tabel kustom kini mendukung render header secara kondisional.

import React from 'react';

const CustomTableComponent = ({ properties }) => {
    // Ekstrak properti dengan nilai default
    const {
        rowCount = 2,
        colCount = 2,
        cells = {},
        // PENERAPAN LANGKAH 1.2
        isHeaderFirstRow = true,
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
        isZebra = false,
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
        fontWeight: 'bold',
    };
    const tdStyle = {
        padding: '8px',
        border: `${borderWidth}px solid ${borderColor}`,
    };
    const zebraRowStyle = {
        backgroundColor: '#F9FAFB'
    };

    const rows = Array.from({ length: rowCount }, (_, i) => i);
    const cols = Array.from({ length: colCount }, (_, i) => i);

    return (
        <div className="text-sm my-4">
            <table style={tableStyle}>
                {isHeaderFirstRow && rowCount > 0 && (
                     <thead>
                        <tr>
                            {cols.map(colIndex => (
                                <th key={colIndex} style={thStyle}>
                                    {cells[`0-${colIndex}`] || ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {rows.map(rowIndex => {
                        if (isHeaderFirstRow && rowIndex === 0) return null;
                        const rowStyle = isZebra && rowIndex % 2 !== 0 ? { ...tdStyle, ...zebraRowStyle } : tdStyle;
                        return (
                            <tr key={rowIndex}>
                                {cols.map(colIndex => (
                                    <td key={colIndex} style={rowStyle}>
                                        {cells[`${rowIndex}-${colIndex}`] || ''}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default CustomTableComponent;
