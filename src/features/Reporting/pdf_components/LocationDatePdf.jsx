// src/features/Reporting/pdf_components/LocationDatePdf.jsx
// Deskripsi: Komponen PDF baru untuk merender komponen Kota & Tanggal.

import React from 'react';
import { Text } from '@react-pdf/renderer';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils.js';

const LocationDatePdf = ({ properties, reportData, settings }) => {
    const {
        city = 'Balikpapan',
        dateFormat = 'long',
        prefix = '',
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
        fontFamily: isBold ? 'Helvetica-Bold' : 'Helvetica',
        fontStyle: isItalic ? 'italic' : 'normal',
        textDecoration: isUnderline ? 'underline' : 'none',
        color: color,
        marginBottom: 4,
    };

    const date = new Date();
    const formattedDate = dateFormat === 'long'
        ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : date.toLocaleDateString('id-ID');

    const content = `${prefix ? prefix + ' ' : ''}${city}, ${formattedDate}`;
    const processedContent = replacePlaceholders(content, reportData, settings);

    return <Text style={style}>{processedContent}</Text>;
};

export default LocationDatePdf;
