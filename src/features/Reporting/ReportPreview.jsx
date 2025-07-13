// Lokasi file: src/features/Reporting/ReportPreview.js
// Deskripsi: Komponen untuk menampilkan preview laporan sebelum di-generate.

import React from 'react';
import { ScrollArea } from '../../components/ui/scroll-area';

// Komponen placeholder untuk setiap blok laporan
const PreviewBlock = ({ name }) => (
    <div className="p-4 mb-2 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
        <p className="text-sm font-semibold text-gray-500">{name}</p>
    </div>
);

export default function ReportPreview({ template, settings }) {
    if (!template || !template.layout) {
        return <div className="text-center text-muted-foreground p-10">Pilih template untuk melihat preview.</div>;
    }

    return (
        <ScrollArea className="h-[50vh] bg-gray-200 p-4 rounded-md">
            <div className="w-[210mm] min-h-[297mm] p-8 bg-white shadow-lg mx-auto">
                {template.layout.map((block, index) => (
                    <PreviewBlock key={block.instanceId || index} name={block.name} />
                ))}
            </div>
        </ScrollArea>
    );
}
