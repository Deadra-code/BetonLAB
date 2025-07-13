// Lokasi file: src/features/Reporting/components/MaterialPropertiesTable.jsx
// Deskripsi: Komponen tabel properti material dengan visibilitas kolom dan styling kustom.

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const MaterialPropertiesTable = ({ trialData, properties }) => {
    const { design_input } = trialData || {};

    // Ekstrak properti kustomisasi dengan nilai default
    const {
        title = "Tabel Properti Material",
        showSg = true,
        showAbsorption = true,
        showMoisture = true,
        showBulkDensity = true,
        showFm = true,
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
    } = properties || {};

    if (!design_input) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Input Desain tidak tersedia</div>;
    }

    const data = [
        { name: 'Semen', sg: design_input.sgCement, absorption: '-', moisture: '-', bulkDensity: '-', fm: '-' },
        { name: 'Agregat Halus', sg: design_input.sgFine, absorption: design_input.absorptionFine, moisture: design_input.moistureFine, bulkDensity: '-', fm: design_input.finenessModulus },
        { name: 'Agregat Kasar', sg: design_input.sgCoarse, absorption: design_input.absorptionCoarse, moisture: design_input.moistureCoarse, bulkDensity: design_input.dryRoddedWeightCoarse, fm: '-' },
    ];

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
            <h3 className="font-bold mb-2 text-base">{title}</h3>
            <Table style={tableStyle}>
                <TableHeader>
                    <TableRow>
                        <TableHead style={thStyle}>Material</TableHead>
                        {showSg && <TableHead style={thStyle}>BJ (SSD)</TableHead>}
                        {showAbsorption && <TableHead style={thStyle}>Penyerapan (%)</TableHead>}
                        {showMoisture && <TableHead style={thStyle}>Kadar Air (%)</TableHead>}
                        {showBulkDensity && <TableHead style={thStyle}>Berat Isi (kg/m³)</TableHead>}
                        {showFm && <TableHead style={thStyle}>Modulus Halus</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(mat => (
                        <TableRow key={mat.name}>
                            <TableCell style={tdStyle} className="font-medium">{mat.name}</TableCell>
                            {showSg && <TableCell style={tdStyle}>{mat.sg}</TableCell>}
                            {showAbsorption && <TableCell style={tdStyle}>{mat.absorption}</TableCell>}
                            {showMoisture && <TableCell style={tdStyle}>{mat.moisture}</TableCell>}
                            {showBulkDensity && <TableCell style={tdStyle}>{mat.bulkDensity}</TableCell>}
                            {showFm && <TableCell style={tdStyle}>{mat.fm}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default MaterialPropertiesTable;
