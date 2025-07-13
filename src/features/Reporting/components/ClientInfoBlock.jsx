// Lokasi file: src/features/Reporting/components/ClientInfoBlock.jsx
// Deskripsi: Komponen React untuk menampilkan blok info klien di kanvas Report Builder.

import React from 'react';

const InfoItem = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    );
};

const ClientInfoBlock = ({ reportData }) => {
    if (!reportData) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Blok Info Klien</div>;
    }

    return (
        <div className="p-4 my-2 border rounded-lg bg-slate-50 space-y-3">
            <InfoItem label="Klien" value={reportData.clientName} />
            <InfoItem label="Alamat" value={reportData.clientAddress} />
            <InfoItem label="Kontak Person" value={reportData.clientContactPerson} />
            <InfoItem label="Nomor Kontak" value={reportData.clientContactNumber} />
        </div>
    );
};

export default ClientInfoBlock;
