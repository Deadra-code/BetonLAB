// src/features/Reporting/components/LocationDateComponent.jsx
// Deskripsi: Komponen baru untuk menampilkan kota dan tanggal laporan.

import React from 'react';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils';

const LocationDateComponent = ({ properties, reportData, settings }) => {
    // Ekstrak properti dengan nilai default
    const {
        city = 'Balikpapan',
        dateFormat = 'long',
        prefix = '',
        // Warisi properti styling dari komponen teks
        fontSize = 12,
        isBold = false,
        isItalic = false,
        isUnderline = false,
        align = 'left',
        color = '#000000',
        fontFamily = 'Arial',
    } = properties || {};

    // Terapkan gaya CSS inline berdasarkan properti
    const style = {
        fontFamily: fontFamily,
        fontSize: `${fontSize}pt`,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: isUnderline ? 'underline' : 'none',
        textAlign: align,
        color: color,
        whiteSpace: 'pre-wrap',
    };

    // Format tanggal
    const date = new Date();
    const formattedDate = dateFormat === 'long'
        ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : date.toLocaleDateString('id-ID');
    
    const content = `${prefix ? prefix + ' ' : ''}${city}, ${formattedDate}`;
    
    // Proses placeholder jika ada di dalam properti (misal: kota dari data)
    const processedContent = replacePlaceholders(content, reportData, settings);

    return (
        <div style={style}>
            {processedContent}
        </div>
    );
};

export default LocationDateComponent;
