// Lokasi file: src/features/Reporting/components/RawStrengthTestTable.jsx
// Deskripsi: Komponen tabel kini menerapkan semua properti styling dan visibilitas kolom.

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const RawStrengthTestTable = ({ trialData, properties }) => {
    const tests = trialData?.tests || [];

    // Ekstrak properti kustomisasi dengan nilai default
    const {
        title = "Tabel Data Mentah Uji Kuat Tekan",
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
        isZebra = false,
        // Properti visibilitas kolom
        showId = true,
        showAge = true,
        showTestDate = true,
        showStrength = true,
    } = properties || {};

    if (!tests || tests.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Uji Tekan tidak tersedia</div>;
    }

    const tableStyle = {
        border: `${borderWidth}px solid ${borderColor}`,
        borderCollapse: 'collapse',
    };
    const thStyle = {
        backgroundColor: headerBgColor,
        color: headerTextColor,
        border: `${borderWidth}px solid ${borderColor}`,
        fontWeight: 'bold',
    };
    const tdStyle = {
        border: `${borderWidth}px solid ${borderColor}`,
    };
    const zebraRowStyle = {
        backgroundColor: '#F9FAFB'
    };

    return (
        <div className="text-sm my-4">
            <h3 className="font-bold mb-2 text-base">{title}</h3>
            <Table style={tableStyle}>
                <TableHeader>
                    <TableRow>
                        {showId && <TableHead style={thStyle}>ID Benda Uji</TableHead>}
                        {showAge && <TableHead style={thStyle}>Umur (hari)</TableHead>}
                        {showTestDate && <TableHead style={thStyle}>Tanggal Uji</TableHead>}
                        {showStrength && <TableHead style={thStyle} className="text-right">Kuat Tekan (MPa)</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tests.map((test, index) => (
                        <TableRow key={test.id} style={isZebra && index % 2 !== 0 ? zebraRowStyle : {}}>
                            {showId && <TableCell style={tdStyle}>{test.specimen_id}</TableCell>}
                            {showAge && <TableCell style={tdStyle}>{test.age_days}</TableCell>}
                            {showTestDate && <TableCell style={tdStyle}>{new Date(test.testing_date).toLocaleDateString('id-ID')}</TableCell>}
                            {showStrength && <TableCell style={tdStyle} className="text-right font-medium">{test.result_data.strength_MPa?.toFixed(2) || '-'}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default RawStrengthTestTable;
