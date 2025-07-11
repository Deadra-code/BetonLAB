// Lokasi file: src/features/Reporting/components/TrialInfoBlock.jsx
// Deskripsi: Komponen untuk menampilkan blok info ringkas dari sebuah trial.

import React from 'react';
import { cn } from '../../../lib/utils';

const InfoItem = ({ label, value, unit }) => (
    <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="font-semibold">{value} <span className="font-normal text-muted-foreground">{unit}</span></p>
    </div>
);

const TrialInfoBlock = ({ trialData, properties }) => {
    const { design_input, design_result } = trialData || {};
    const { showBorder = true } = properties || {};

    if (!design_input || !design_result) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Info Trial tidak tersedia.</div>;
    }

    return (
        <div className={cn("text-sm my-4 p-4 grid grid-cols-3 gap-4", showBorder && "border rounded-lg")}>
            <InfoItem label="f'c Rencana" value={design_input.fc} unit="MPa" />
            <InfoItem label="Slump" value={design_input.slump} unit="mm" />
            <InfoItem label="f'cr Target" value={design_result.fcr?.toFixed(2)} unit="MPa" />
        </div>
    );
};

export default TrialInfoBlock;
