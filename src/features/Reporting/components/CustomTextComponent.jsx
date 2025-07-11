// Lokasi file: src/features/Reporting/components/CustomTextComponent.jsx
// Deskripsi: Komponen untuk merender blok teks yang dapat diedit.

import React from 'react';

const CustomTextComponent = ({ properties }) => {
    const style = {
        fontSize: `${properties?.fontSize || 12}pt`,
        fontWeight: properties?.isBold ? 'bold' : 'normal',
        textAlign: properties?.align || 'left',
        color: properties?.color || '#000000',
    };

    return (
        <div style={style}>
            {properties?.content || 'Klik untuk mengedit teks...'}
        </div>
    );
};

export default CustomTextComponent;
