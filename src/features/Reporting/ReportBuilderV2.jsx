// Lokasi file: src/features/Reporting/ReportBuilderV2.jsx
// Deskripsi: Menerima props onUpdateProject/onUpdateTrial dan meneruskannya ke CanvasArea.

import React, { useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useReportBuilderStore } from '../../hooks/useReportBuilderStore';
import ComponentLibrary from './components/builder/ComponentLibrary';
import CanvasArea from './components/builder/CanvasArea';
import PropertyInspector from './components/builder/PropertyInspector';

export default function ReportBuilderV2({ reportData, settings, onLayoutChange, initialLayout, apiReady, onUpdateProject, onUpdateTrial }) {
    
    const {
        layout,
        pageSettings,
        selectedComponentId,
        initializeLayout,
        onDragEnd,
        onDragStart,
        setSelectedComponentId,
        updateProperty,
        deleteComponent,
        addPage,
        deletePage,
        updatePageSettings
    } = useReportBuilderStore();

    useEffect(() => {
        initializeLayout(initialLayout);
    }, [initialLayout, initializeLayout]);

    useEffect(() => {
        onLayoutChange({ layout, pageSettings });
    }, [layout, pageSettings, onLayoutChange]);
    
    const findComponentById = (id) => {
        if (!id) return null;
        
        for (const page of layout) {
            if (page.header?.instanceId === id) return page.header;
            if (page.footer?.instanceId === id) return page.footer;

            let found = null;
            const findRecursive = (nodes) => {
                for (const component of nodes) {
                    if (component.instanceId === id) { found = component; return; }
                    if (component.children && Array.isArray(component.children)) {
                        if (component.id === 'columns') {
                            for (const col of component.children) { findRecursive(col); if (found) return; }
                        } else {
                            findRecursive(component.children);
                            if (found) return;
                        }
                    }
                }
            };

            findRecursive(page.components);
            if (found) return found;
        }

        return null;
    };
    
    const selectedComponent = findComponentById(selectedComponentId);

    return (
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
            <div className="h-full w-full flex gap-4 bg-background p-4">
                <ComponentLibrary reportData={reportData} />
                <CanvasArea
                    layout={layout}
                    pageSettings={pageSettings}
                    selectedComponentId={selectedComponentId}
                    onComponentClick={setSelectedComponentId}
                    onDeletePage={deletePage}
                    onDeleteComponent={deleteComponent}
                    onPropertyChange={updateProperty}
                    onAddPage={addPage}
                    reportData={reportData}
                    settings={settings}
                    apiReady={apiReady}
                    onUpdateProject={onUpdateProject}
                    onUpdateTrial={onUpdateTrial}
                />
                <PropertyInspector
                    selectedComponent={selectedComponent}
                    pageSettings={pageSettings}
                    onPropertyChange={updateProperty}
                    onPageSettingChange={updatePageSettings}
                    reportData={reportData}
                />
            </div>
        </DragDropContext>
    );
}
