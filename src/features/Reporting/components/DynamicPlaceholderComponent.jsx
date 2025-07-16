// Lokasi file: src/features/Reporting/components/DynamicPlaceholderComponent.jsx
// Deskripsi: Komponen baru untuk menampilkan nilai data tunggal secara dinamis.

import React from 'react';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils';

const DynamicPlaceholderComponent = ({ properties, reportData, settings }) => {
    const {
        placeholder = '{{nama_proyek}}',
        label = '',
        suffix = '',
        // Properti styling diwarisi dari text component
        fontSize = 12,
        isBold = false,
        isItalic = false,
        isUnderline = false,
        align = 'left',
        color = '#000000',
        fontFamily = 'Arial',
    } = properties || {};

    const style = {
        fontFamily: fontFamily,
        fontSize: `${fontSize}pt`,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: isUnderline ? 'underline' : 'none',
        textAlign: align,
        color: color,
    };

    const value = replacePlaceholders(placeholder, reportData, settings);

    return (
        <div style={style}>
            {label}{value}{suffix}
        </div>
    );
};

export default DynamicPlaceholderComponent;
