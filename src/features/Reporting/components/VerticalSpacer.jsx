// Lokasi file: src/features/Reporting/components/VerticalSpacer.jsx
// Deskripsi: Komponen untuk menambahkan spasi vertikal.

import React from 'react';

const VerticalSpacer = ({ properties }) => {
    const { height = 20 } = properties || {};
    return <div style={{ height: `${height}px` }} />;
};

export default VerticalSpacer;
