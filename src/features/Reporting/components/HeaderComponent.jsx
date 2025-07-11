// Lokasi file: src/features/Reporting/components/HeaderComponent.jsx
// Deskripsi: Komponen untuk merender Kop Surat pada laporan.

import React from 'react';

const HeaderComponent = ({ settings, properties }) => {
    // Komponen ini menggunakan data dari 'settings' yang dilewatkan dari ReportBuilder
    if (!settings) return null;

    return (
        <div className="flex items-center p-2 border-b-2 border-black mb-4">
            {settings.logoPath && (
                <img
                    src={`file://${settings.logoPath}`}
                    alt="Logo"
                    className="w-16 h-16 object-contain mr-4"
                />
            )}
            <div>
                <h2 className="text-xl font-bold">{settings.companyName || 'Nama Perusahaan Anda'}</h2>
                <p className="text-xs">Laporan Laboratorium Beton</p>
            </div>
        </div>
    );
};

export default HeaderComponent;
