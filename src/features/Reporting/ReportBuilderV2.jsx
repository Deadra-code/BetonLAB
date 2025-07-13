// Lokasi file: src/features/Reporting/ReportBuilderV2.jsx
// Deskripsi: Dirombak total untuk menggunakan state management terpusat dari Zustand.

import React, { useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useReportBuilderStore } from '../../hooks/useReportBuilderStore'; // Import store Zustand
import ComponentLibrary from './components/builder/ComponentLibrary';
import CanvasArea from './components/builder/CanvasArea';
import PropertyInspector from './components/builder/PropertyInspector';

export default function ReportBuilderV2({ reportData, settings, onLayoutChange, initialLayout, apiReady }) {
    
    // Mengambil semua state dan action dari store Zustand
    const {
        layout,
        pageSettings,
        selectedComponentId,
        initializeLayout,
        onDragEnd,
        setSelectedComponentId,
        updateProperty,
        deleteComponent,
        addPage,
        deletePage,
        updatePageSettings
    } = useReportBuilderStore();

    // Inisialisasi atau reset store ketika template awal berubah
    useEffect(() => {
        initializeLayout(initialLayout);
    }, [initialLayout, initializeLayout]);

    // Memberi tahu komponen induk (ReportBuilderPage) tentang perubahan layout
    useEffect(() => {
        onLayoutChange({ layout, pageSettings });
    }, [layout, pageSettings, onLayoutChange]);
    
    // Mencari detail komponen yang dipilih dari state `layout`
    const findComponentById = (id) => {
        if (!id) return null;
        let found = null;
        const findRecursive = (nodes) => {
            for (const component of nodes) {
                if (component.instanceId === id) { found = component; return; }
                if (component.children && Array.isArray(component.children)) {
                    if (component.id.startsWith('columns-')) {
                        for (const col of component.children) { findRecursive(col); if (found) return; }
                    } else {
                        findRecursive(component.children);
                        if (found) return;
                    }
                }
            }
        };
        for (const page of layout) { findRecursive(page); if(found) break; }
        return found;
    };
    
    const selectedComponent = findComponentById(selectedComponentId);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="h-full w-full flex gap-4 bg-background p-4">
                <ComponentLibrary />
                <CanvasArea
                    // Props yang diambil dari store
                    layout={layout}
                    pageSettings={pageSettings}
                    selectedComponentId={selectedComponentId}
                    onComponentClick={setSelectedComponentId}
                    onDeletePage={deletePage}
                    onDeleteComponent={deleteComponent}
                    onAddPage={addPage}
                    // Props yang diteruskan dari parent
                    reportData={reportData}
                    settings={settings}
                    apiReady={apiReady}
                />
                <PropertyInspector
                    // Props yang diambil dari store
                    selectedComponent={selectedComponent}
                    pageSettings={pageSettings}
                    onPropertyChange={updateProperty}
                    onPageSettingChange={updatePageSettings}
                    // Props yang diteruskan dari parent
                    reportData={reportData}
                />
            </div>
        </DragDropContext>
    );
}
