// Lokasi file: src/features/Reporting/components/FooterComponent.jsx
// Deskripsi: Komponen baru untuk footer halaman.

import React from 'react';

const FooterComponent = ({ properties, pageNumber, totalPages }) => {
    const {
        leftText = 'Laporan Internal',
        centerText = '',
        rightText = 'Halaman {{pageNumber}} dari {{totalPages}}',
        fontSize = 9,
        color = '#6B7280', // gray-500
        showBorder = true,
    } = properties || {};

    const processText = (text) => {
        return text
            .replace('{{pageNumber}}', pageNumber)
            .replace('{{totalPages}}', totalPages);
    };

    const style = {
        fontSize: `${fontSize}pt`,
        color: color,
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '8px',
        marginTop: 'auto', // Mendorong ke bawah
        borderTop: showBorder ? `1px solid ${color}` : 'none',
    };

    return (
        <div style={style}>
            <span>{processText(leftText)}</span>
            <span>{processText(centerText)}</span>
            <span>{processText(rightText)}</span>
        </div>
    );
};

export default FooterComponent;
