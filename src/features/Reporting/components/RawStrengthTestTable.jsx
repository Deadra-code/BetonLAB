// Lokasi file: src/features/Reporting/components/RawStrengthTestTable.jsx
// Deskripsi: Komponen tabel data mentah uji tekan dengan styling kustom.

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const RawStrengthTestTable = ({ trialData, properties }) => {
    const tests = trialData?.tests || [];

    // Ekstrak properti kustomisasi dengan nilai default
    const {
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
    } = properties || {};

    if (!tests || tests.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Uji Tekan tidak tersedia</div>;
    }

    // Terapkan gaya kustom
    const tableStyle = {
        border: `${borderWidth}px solid ${borderColor}`,
        borderCollapse: 'collapse',
    };
    const thStyle = {
        backgroundColor: headerBgColor,
        color: headerTextColor,
        border: `${borderWidth}px solid ${borderColor}`,
    };
    const tdStyle = {
        border: `${borderWidth}px solid ${borderColor}`,
    };

    return (
        <div className="text-sm my-4">
            <h3 className="font-bold mb-2 text-base">Tabel Data Mentah Uji Kuat Tekan</h3>
            <Table style={tableStyle}>
                <TableHeader>
                    <TableRow>
                        <TableHead style={thStyle}>ID Benda Uji</TableHead>
                        <TableHead style={thStyle}>Umur (hari)</TableHead>
                        <TableHead style={thStyle}>Tanggal Uji</TableHead>
                        <TableHead style={thStyle} className="text-right">Kuat Tekan (MPa)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map(test => (
                        <TableRow key={test.id}>
                            <TableCell style={tdStyle}>{test.specimen_id}</TableCell>
                            <TableCell style={tdStyle}>{test.age_days}</TableCell>
                            <TableCell style={tdStyle}>{new Date(test.testing_date).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell style={tdStyle} className="text-right font-medium">{test.result_data.strength_MPa?.toFixed(2) || '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default RawStrengthTestTable;
