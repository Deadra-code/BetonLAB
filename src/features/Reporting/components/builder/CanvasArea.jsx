// Lokasi file: src/features/Reporting/components/builder/CanvasArea.jsx
// Deskripsi: Menerima props onUpdateProject/onUpdateTrial dan meneruskannya ke PageComponent.

import React from 'react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Button } from '../../../../components/ui/button';
import { PlusSquare } from 'lucide-react';
import PageComponent from '../../components/PageComponent';
import ErrorBoundary from '../../../../components/ErrorBoundary';

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
    onUpdateProject,
    onUpdateTrial
}) {
    return (
        <div className="flex-grow flex flex-col min-w-0">
            <ScrollArea className="flex-grow bg-muted p-4 rounded-md">
                {layout.map((page, index) => (
                    <ErrorBoundary key={index}>
                        <PageComponent
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
                            onUpdateProject={onUpdateProject}
                            onUpdateTrial={onUpdateTrial}
                        />
                    </ErrorBoundary>
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
