// Lokasi file: src/features/Reporting/components/builder/CanvasArea.jsx
// Deskripsi: Komponen modular untuk area Kanvas tengah di Report Builder.

import React from 'react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Button } from '../../../../components/ui/button';
import { PlusSquare } from 'lucide-react';
import PageComponent from '../../components/PageComponent';

export default function CanvasArea({
    layout,
    pageSettings,
    reportData,
    settings,
    apiReady,
    selectedComponentId,
    onComponentClick,
    onDeletePage,
    onDeleteComponent,
    onPropertyChange,
    onAddPage,
}) {
    return (
        <div className="flex-grow flex flex-col min-w-0">
            <ScrollArea className="flex-grow bg-muted p-4 rounded-md">
                {layout.map((page, index) => (
                    <PageComponent
                        key={index}
                        page={page}
                        pageIndex={index}
                        onComponentClick={onComponentClick}
                        onDeletePage={onDeletePage}
                        onDeleteComponent={onDeleteComponent}
                        selectedComponentId={selectedComponentId}
                        reportData={reportData}
                        settings={settings}
                        onPropertyChange={onPropertyChange}
                        apiReady={apiReady}
                        pageSettings={pageSettings}
                        onDeselect={() => onComponentClick(null)}
                    />
                ))}
                <div className="flex justify-center mt-4">
                    <Button onClick={onAddPage} variant="outline">
                        <PlusSquare className="mr-2 h-4 w-4" /> Tambah Halaman
                    </Button>
                </div>
            </ScrollArea>
        </div>
    );
}
