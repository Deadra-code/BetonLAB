// Lokasi file: src/features/Reporting/components/CustomTextComponent.jsx
// Deskripsi: Komponen kini menerapkan semua properti styling teks.

import React from 'react';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils';

const CustomTextComponent = ({ properties, reportData, settings }) => {
    // Ekstrak properti dengan nilai default untuk kustomisasi
    const {
        content = 'Klik untuk mengedit teks...',
        fontSize = 12,
        isBold = false,
        isItalic = false,
        isUnderline = false,
        align = 'left',
        color = '#000000',
        fontFamily = 'Arial',
        lineHeight = 1.5,
        letterSpacing = 0,
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
        lineHeight: lineHeight,
        letterSpacing: `${letterSpacing}px`,
        whiteSpace: 'pre-wrap', // Agar line break dari textarea dihormati
    };
    
    const processedContent = replacePlaceholders(content, reportData, settings);

    return (
        <div style={style}>
            {processedContent}
        </div>
    );
};

export default CustomTextComponent;
