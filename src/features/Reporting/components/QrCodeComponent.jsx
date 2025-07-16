// Lokasi file: src/features/Reporting/components/QrCodeComponent.jsx
// Deskripsi: Komponen baru untuk merender Kode QR.

import React from 'react';
import { replacePlaceholders } from '../../../utils/reporting/reportUtils';

const QrCodeComponent = ({ properties, reportData, settings }) => {
    const {
        content = 'https://www.google.com',
        size = 100,
        align = 'center',
    } = properties || {};

    const processedContent = replacePlaceholders(content, reportData, settings);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(processedContent)}`;

    const wrapperStyle = {
        display: 'flex',
        justifyContent: align,
    };

    return (
        <div style={wrapperStyle}>
            <img src={qrUrl} alt="QR Code" width={size} height={size} />
        </div>
    );
};

export default QrCodeComponent;
