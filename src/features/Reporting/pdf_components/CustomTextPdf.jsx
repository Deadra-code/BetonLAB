// ========================================================================
// Lokasi file: src/features/Reporting/pdf_components/CustomTextPdf.jsx
// Perbaikan: Mengubah path impor `reportUtils` menjadi path relatif yang benar
// ========================================================================
import React from 'react';
import { Text } from '@react-pdf/renderer';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils.js'; // <-- PERBAIKAN DI SINI

const CustomTextPdf = ({ properties, reportData, settings }) => {
    const {
        content = '',
        fontSize = 10,
        isBold = false,
        isItalic = false,
        isUnderline = false,
        align = 'left',
        color = '#000000',
    } = properties || {};

    const style = {
        fontSize: fontSize,
        textAlign: align,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: isUnderline ? 'underline' : 'none',
        color: color,
        marginBottom: 4,
    };

    const processedContent = replacePlaceholders(content, reportData, settings);

    return <Text style={style}>{processedContent}</Text>;
};

export default CustomTextPdf;