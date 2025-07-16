// Lokasi file: src/features/Reporting/components/StrengthSummaryTable.jsx
// Deskripsi: Komponen tabel kini menerapkan semua properti styling.

import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const StrengthSummaryTable = ({ trialData, properties }) => {
    const { 
        title = "Ringkasan Hasil Uji Kuat Tekan",
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
        isZebra = false,
    } = properties || {};
    const tests = trialData?.tests || [];

    const summaryData = useMemo(() => {
        if (tests.length === 0) return [];
        const groupedByAge = tests.reduce((acc, test) => {
            if (test.status === 'Telah Diuji') {
                const age = test.age_days;
                if (!acc[age]) {
                    acc[age] = { strengths: [], count: 0 };
                }
                acc[age].strengths.push(test.result_data.strength_MPa);
                acc[age].count++;
            }
            return acc;
        }, {});

        return Object.entries(groupedByAge).map(([age, data]) => {
            const sum = data.strengths.reduce((a, b) => a + b, 0);
            return {
                age: parseInt(age),
                count: data.count,
                average: sum / data.count,
            };
        }).sort((a, b) => a.age - b.age);

    }, [tests]);

    if (summaryData.length === 0) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Ringkasan Uji Tekan tidak tersedia.</div>;
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
                        <TableHead style={thStyle}>Umur (Hari)</TableHead>
                        <TableHead style={thStyle}>Jumlah Benda Uji</TableHead>
                        <TableHead style={thStyle} className="text-right">Kuat Tekan Rata-rata (MPa)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {summaryData.map((row, index) => (
                        <TableRow key={row.age} style={isZebra && index % 2 !== 0 ? zebraRowStyle : {}}>
                            <TableCell style={tdStyle}>{row.age}</TableCell>
                            <TableCell style={tdStyle}>{row.count}</TableCell>
                            <TableCell style={tdStyle} className="text-right font-medium">{row.average.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default StrengthSummaryTable;
