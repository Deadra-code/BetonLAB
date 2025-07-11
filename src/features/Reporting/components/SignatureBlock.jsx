// Lokasi file: src/features/Reporting/components/SignatureBlock.jsx
// Deskripsi: Komponen untuk merender blok tanda tangan yang dapat dikustomisasi.

import React from 'react';

const SignatureBlock = ({ properties }) => {
    const {
        label1 = 'Disiapkan oleh,',
        label2 = 'Disetujui oleh,',
        name1 = '(_________________)',
        name2 = '(_________________)',
        position1 = 'Teknisi Lab',
        position2 = 'Penyelia',
    } = properties || {};

    return (
        <div className="flex justify-between items-end mt-16 text-center text-sm">
            <div className="flex flex-col items-center">
                <p className="mb-12">{label1}</p>
                <p className="font-bold">{name1}</p>
                <p className="border-t w-full pt-1 mt-1">{position1}</p>
            </div>
            <div className="flex flex-col items-center">
                <p className="mb-12">{label2}</p>
                <p className="font-bold">{name2}</p>
                <p className="border-t w-full pt-1 mt-1">{position2}</p>
            </div>
        </div>
    );
};

export default SignatureBlock;
