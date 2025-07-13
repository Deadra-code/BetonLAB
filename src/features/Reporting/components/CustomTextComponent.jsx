// Lokasi file: src/features/Reporting/components/CustomTextComponent.jsx
// Deskripsi: Komponen untuk merender blok teks yang dapat diedit, dengan kustomisasi penuh.

import React from 'react';

const CustomTextComponent = ({ properties }) => {
    // Ekstrak properti dengan nilai default untuk kustomisasi
    const {
        content = 'Klik untuk mengedit teks...',
        fontSize = 12,
        isBold = false,
        isItalic = false, // BARU: Properti Italic
        isUnderline = false, // BARU: Properti Underline
        align = 'left',
        color = '#000000',
        fontFamily = 'Arial' // BARU: Properti Font Family
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
    };

    return (
        <div style={style}>
            {content}
        </div>
    );
};

export default CustomTextComponent;
