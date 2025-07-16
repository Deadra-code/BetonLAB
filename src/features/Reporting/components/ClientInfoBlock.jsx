// Lokasi file: src/features/Reporting/components/ClientInfoBlock.jsx
// Deskripsi: Komponen kini menerapkan styling dari properti.

import React from 'react';
import { cn } from '../../../lib/utils';

const InfoItem = ({ label, value, properties }) => {
    if (!value) return null;
    const { labelStyling = {}, valueStyling = {} } = properties;
    
    const labelStyle = {
        fontSize: `${labelStyling.fontSize || 9}pt`,
        color: labelStyling.color || '#6B7280',
        fontWeight: labelStyling.isBold ? 'bold' : 'normal',
    };
    const valueStyle = {
        fontSize: `${valueStyling.fontSize || 10}pt`,
        color: valueStyling.color || '#1F2937',
        fontWeight: valueStyling.isBold ? 'bold' : 'normal',
    };

    return (
        <div>
            <p style={labelStyle} className="uppercase tracking-wider">{label}</p>
            <p style={valueStyle}>{value}</p>
        </div>
    );
};

const ClientInfoBlock = ({ reportData, properties }) => {
    const { showBorder = true } = properties || {};

    if (!reportData) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Blok Info Klien</div>;
    }

    return (
        <div className={cn("p-4 my-2 space-y-3", showBorder && "border rounded-lg")}>
            <InfoItem label="Klien" value={reportData.clientName} properties={properties} />
            <InfoItem label="Alamat" value={reportData.clientAddress} properties={properties} />
            <InfoItem label="Kontak Person" value={reportData.clientContactPerson} properties={properties} />
            <InfoItem label="Nomor Kontak" value={reportData.clientContactNumber} properties={properties} />
        </div>
    );
};

export default ClientInfoBlock;
