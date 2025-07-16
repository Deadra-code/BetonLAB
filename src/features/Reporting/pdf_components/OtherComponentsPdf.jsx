// src/features/Reporting/pdf_components/OtherComponentsPdf.jsx
import React from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils';

// --- QR Code ---
export const QrCodePdf = ({ properties, reportData, settings }) => {
    const { content = '', size = 80 } = properties || {};
    const processedContent = replacePlaceholders(content, reportData, settings);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(processedContent)}`;
    return <Image style={{ width: size, height: size }} src={qrUrl} />;
};

// --- Custom Image ---
export const CustomImagePdf = ({ properties }) => {
    const { src, maxWidth = 100 } = properties || {};
    if (!src) return null;
    return <Image style={{ maxWidth: `${maxWidth}%`, height: 'auto' }} src={src} />;
};

// --- Dynamic Placeholder ---
export const DynamicPlaceholderPdf = ({ properties, reportData, settings }) => {
    const { placeholder = '', label = '', suffix = '', fontSize = 10, isBold = false } = properties || {};
    const value = replacePlaceholders(placeholder, reportData, settings);
    const style = { fontSize, fontFamily: isBold ? 'Helvetica-Bold' : 'Helvetica' };
    return <Text style={style}>{label}{value}{suffix}</Text>;
};

// --- Footer ---
export const FooterPdf = ({ properties, pageNumber, totalPages }) => {
    const { leftText = '', centerText = '', rightText = 'Halaman {{pageNumber}} dari {{totalPages}}', fontSize = 8, color = '#6B7280' } = properties || {};
    
    const process = (text) => text.replace('{{pageNumber}}', pageNumber).replace('{{totalPages}}', totalPages);

    const style = {
        position: 'absolute',
        bottom: 30,
        left: 35,
        right: 35,
        fontSize,
        color,
        fontFamily: 'Helvetica',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    };
    
    return (
        <View style={style} fixed>
            <Text>{process(leftText)}</Text>
            <Text>{process(centerText)}</Text>
            <Text>{process(rightText)}</Text>
        </View>
    );
};

// --- Custom Table ---
export const CustomTablePdf = ({ properties }) => {
    const { rowCount = 2, colCount = 2, cells = {}, isHeaderFirstRow = true, borderColor = '#bfbfbf', borderWidth = 1 } = properties || {};
    const styles = StyleSheet.create({
        table: { display: "table", width: "auto", borderStyle: "solid", borderWidth, borderColor, borderRightWidth: 0, borderBottomWidth: 0 },
        tableRow: { margin: "auto", flexDirection: "row" },
        tableColHeader: { borderStyle: "solid", borderWidth, borderColor, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f2f2f2', padding: 5, fontFamily: 'Helvetica-Bold' },
        tableCol: { borderStyle: "solid", borderWidth, borderColor, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
        tableCell: { fontSize: 9, fontFamily: 'Helvetica' }
    });

    const rows = Array.from({ length: rowCount }, (_, i) => i);
    const cols = Array.from({ length: colCount }, (_, i) => i);

    return (
        <View style={styles.table}>
            {rows.map(rowIndex => {
                const isHeader = isHeaderFirstRow && rowIndex === 0;
                return (
                    <View style={styles.tableRow} key={rowIndex}>
                        {cols.map(colIndex => (
                            <View key={colIndex} style={{ ...(isHeader ? styles.tableColHeader : styles.tableCol), width: `${100/colCount}%` }}>
                                <Text style={styles.tableCell}>{cells[`${rowIndex}-${colIndex}`] || ''}</Text>
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
};
