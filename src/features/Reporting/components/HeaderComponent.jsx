// Lokasi file: src/features/Reporting/components/HeaderComponent.jsx
// Deskripsi: Komponen kop surat kini menerapkan styling dari properti.

import React from 'react';

const HeaderComponent = ({ settings, properties }) => {
    if (!settings) return null;

    const {
        layout = 'left',
        logoSize = 64,
        companyNameSize = 18,
        subtitleSize = 10,
        companyNameColor = '#000000',
        subtitleColor = '#6B7280',
    } = properties || {};

    const containerClasses = {
        left: "flex items-center",
        top: "flex flex-col items-center text-center"
    };

    const companyNameStyle = {
        fontSize: `${companyNameSize}pt`,
        color: companyNameColor,
        fontWeight: 'bold',
    };

    const subtitleStyle = {
        fontSize: `${subtitleSize}pt`,
        color: subtitleColor,
    };

    return (
        <div className={`${containerClasses[layout]} p-2 border-b-2 border-black mb-4`}>
            {settings.logoPath && (
                <img
                    src={`file://${settings.logoPath}`}
                    alt="Logo"
                    style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                    className="object-contain mr-4"
                />
            )}
            <div>
                <h2 style={companyNameStyle}>{settings.companyName || 'Nama Perusahaan Anda'}</h2>
                <p style={subtitleStyle}>Laporan Laboratorium Beton</p>
            </div>
        </div>
    );
};

export default HeaderComponent;
