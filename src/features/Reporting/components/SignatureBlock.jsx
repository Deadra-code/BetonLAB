// Lokasi file: src/features/Reporting/components/SignatureBlock.jsx
// Deskripsi: Komponen dirender secara dinamis berdasarkan properti, termasuk font dan spasi.

import React from 'react';

const SignatureBlock = ({ properties }) => {
    // PENERAPAN LANGKAH 1.2
    const {
        columnCount = 2,
        fontSize = 10,
        verticalSpacing = 48,
    } = properties || {};

    const columns = Array.from({ length: columnCount }, (_, i) => ({
        label: properties[`label${i + 1}`] || `Label Kolom ${i + 1}`,
        name: properties[`name${i + 1}`] || '(_________________)',
        position: properties[`position${i + 1}`] || `Jabatan ${i + 1}`,
    }));

    return (
        <div 
            className="flex justify-around items-end text-center"
            style={{ 
                marginTop: '64px', 
                fontSize: `${fontSize}pt`
            }}
        >
            {columns.map((col, index) => (
                <div key={index} className="flex flex-col items-center" style={{ width: `${100 / columnCount}%` }}>
                    <p style={{ marginBottom: `${verticalSpacing}px` }}>{col.label}</p>
                    <p className="font-bold">{col.name}</p>
                    <p className="border-t w-full pt-1 mt-1">{col.position}</p>
                </div>
            ))}
        </div>
    );
};

export default SignatureBlock;
