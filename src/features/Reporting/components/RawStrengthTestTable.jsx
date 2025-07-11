// Lokasi file: src/features/Reporting/components/RawStrengthTestTable.jsx
// Deskripsi: Komponen untuk merender tabel data mentah hasil uji tekan.

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const RawStrengthTestTable = ({ trialData, properties }) => {
    // Komponen ini menggunakan data dari 'trialData.tests'
    const tests = trialData?.tests || [];

    if (!tests || tests.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Uji Tekan tidak tersedia</div>;
    }

    return (
        <div className="text-sm my-4">
            <h3 className="font-bold mb-2 text-base">Tabel Data Mentah Uji Kuat Tekan</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID Benda Uji</TableHead>
                        <TableHead>Umur (hari)</TableHead>
                        <TableHead>Tanggal Uji</TableHead>
                        <TableHead className="text-right">Kuat Tekan (MPa)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map(test => (
                        <TableRow key={test.id}>
                            <TableCell>{test.specimen_id}</TableCell>
                            <TableCell>{test.age_days}</TableCell>
                            <TableCell>{new Date(test.testing_date).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell className="text-right font-medium">{test.result_data.strength_MPa?.toFixed(2) || '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default RawStrengthTestTable;
