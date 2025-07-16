// Lokasi file: src/features/Reporting/components/TrialInfoBlock.jsx
// Deskripsi: Komponen kini menerapkan styling dan jumlah kolom dari properti.

import React from 'react';
import { cn } from '../../../lib/utils';

const InfoItem = ({ label, value, unit, properties }) => {
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
            <span style={labelStyle}>{label}</span>
            <p style={valueStyle}>{value} <span className="font-normal text-muted-foreground">{unit}</span></p>
        </div>
    );
};

const TrialInfoBlock = ({ trialData, properties }) => {
    const { design_input, design_result } = trialData || {};
    const { showBorder = true, columnCount = 3 } = properties || {};

    if (!design_input || !design_result) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Info Trial tidak tersedia.</div>;
    }

    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
    };

    return (
        <div className={cn("text-sm my-4 p-4 grid gap-4", gridClasses[columnCount], showBorder && "border rounded-lg")}>
            <InfoItem label="f'c Rencana" value={design_input.fc} unit="MPa" properties={properties} />
            <InfoItem label="Slump" value={design_input.slump} unit="mm" properties={properties} />
            <InfoItem label="f'cr Target" value={design_result.fcr?.toFixed(2)} unit="MPa" properties={properties} />
        </div>
    );
};

export default TrialInfoBlock;
