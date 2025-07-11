// Lokasi file: src/features/Reporting/components/MaterialPropertiesTable.jsx
// Deskripsi: Komponen untuk menampilkan tabel properti material yang digunakan.

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

const MaterialPropertiesTable = ({ trialData, properties }) => {
    const { design_input } = trialData || {};
    const {
        title = "Tabel Properti Material",
        showSg = true,
        showAbsorption = true,
        showMoisture = true,
        showBulkDensity = true,
        showFm = true,
    } = properties || {};

    if (!design_input) {
        return <div className="p-4 text-center text-muted-foreground border-2 border-dashed">Data Input Desain tidak tersedia</div>;
    }

    const data = [
        { name: 'Semen', sg: design_input.sgCement, absorption: '-', moisture: '-', bulkDensity: '-', fm: '-' },
        { name: 'Agregat Halus', sg: design_input.sgFine, absorption: design_input.absorptionFine, moisture: design_input.moistureFine, bulkDensity: '-', fm: design_input.finenessModulus },
        { name: 'Agregat Kasar', sg: design_input.sgCoarse, absorption: design_input.absorptionCoarse, moisture: design_input.moistureCoarse, bulkDensity: design_input.dryRoddedWeightCoarse, fm: '-' },
    ];

    return (
        <div className="text-sm my-4">
            <h3 className="font-bold mb-2 text-base">{title}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material</TableHead>
                        {showSg && <TableHead>BJ (SSD)</TableHead>}
                        {showAbsorption && <TableHead>Penyerapan (%)</TableHead>}
                        {showMoisture && <TableHead>Kadar Air (%)</TableHead>}
                        {showBulkDensity && <TableHead>Berat Isi (kg/m³)</TableHead>}
                        {showFm && <TableHead>Modulus Halus</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(mat => (
                        <TableRow key={mat.name}>
                            <TableCell className="font-medium">{mat.name}</TableCell>
                            {showSg && <TableCell>{mat.sg}</TableCell>}
                            {showAbsorption && <TableCell>{mat.absorption}</TableCell>}
                            {showMoisture && <TableCell>{mat.moisture}</TableCell>}
                            {showBulkDensity && <TableCell>{mat.bulkDensity}</TableCell>}
                            {showFm && <TableCell>{mat.fm}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default MaterialPropertiesTable;
