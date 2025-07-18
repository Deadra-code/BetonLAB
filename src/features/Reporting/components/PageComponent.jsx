// Lokasi file: src/features/Reporting/components/PageComponent.jsx
// Deskripsi: Menerima props onUpdateProject/onUpdateTrial dan meneruskannya ke CanvasComponent.

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CanvasComponent } from '../reportComponents';
import { Button } from '../../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReportBuilderStore } from '../../../hooks/useReportBuilderStore';
import ErrorBoundary from '../../../components/ErrorBoundary';

const PAGE_DIMENSIONS = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
};

const PageComponent = ({ 
    page, 
    pageIndex, 
    onComponentClick, 
    onDeletePage, 
    onDeleteComponent, 
    selectedComponentId, 
    reportData, 
    settings, 
    onPropertyChange, 
    apiReady, 
    pageSettings, 
    onDeselect,
    onUpdateProject,
    onUpdateTrial
}) => {
    
    const { size = 'a4', orientation = 'portrait' } = pageSettings || {};
    const dimensions = PAGE_DIMENSIONS[size];
    const draggingComponent = useReportBuilderStore(state => state.draggingComponent);

    const pageStyle = {
        width: orientation === 'portrait' ? `${dimensions.width}mm` : `${dimensions.height}mm`,
        minHeight: orientation === 'portrait' ? `${dimensions.height}mm` : `${dimensions.width}mm`,
    };

    const isPageDropDisabled = draggingComponent ? !draggingComponent.rules.validParents.includes('page') : false;

    return (
        <div className="mb-8 p-2 bg-gray-400/30 rounded-lg relative group/page">
            <p className="text-xs text-center text-muted-foreground mb-2">Halaman {pageIndex + 1}</p>
            {onDeletePage && (
                 <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7 opacity-0 group-hover/page:opacity-100 transition-opacity z-10"
                    onClick={() => onDeletePage(pageIndex)}
                >
                    <Trash2 size={14} className="mr-1" /> Hapus Halaman
                </Button>
            )}
            <div
                style={pageStyle}
                onClick={onDeselect}
                className="bg-white dark:bg-card shadow-lg mx-auto border flex flex-col"
            >
                {/* Header Section */}
                {page.header && (
                    <div className="flex-shrink-0 p-8 pb-0">
                         <CanvasComponent component={page.header} isSelected={selectedComponentId} onClick={onComponentClick} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onDeleteComponent={onDeleteComponent} apiReady={apiReady} onUpdateProject={onUpdateProject} onUpdateTrial={onUpdateTrial} />
                    </div>
                )}

                {/* Body Section (Droppable Area) */}
                <div className="flex-grow p-8">
                    <Droppable droppableId={`page-${page.id}`} isDropDisabled={isPageDropDisabled}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                    "h-full",
                                    snapshot.isDraggingOver && !isPageDropDisabled && 'bg-primary/5 rounded-lg',
                                    isPageDropDisabled && draggingComponent && "bg-red-100/50 border-red-300 rounded-lg"
                                )}
                            >
                                {page.components.length === 0 && !snapshot.isDraggingOver && (
                                    <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
                                        <p className="text-muted-foreground">Area Konten Halaman {pageIndex + 1}</p>
                                    </div>
                                )}
                                {page.components.map((component, index) => (
                                    <ErrorBoundary key={component.instanceId}>
                                        <Draggable key={component.instanceId} draggableId={component.instanceId} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <CanvasComponent component={component} isSelected={selectedComponentId} onClick={onComponentClick} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onDeleteComponent={onDeleteComponent} apiReady={apiReady} onUpdateProject={onUpdateProject} onUpdateTrial={onUpdateTrial}/>
                                                </div>
                                            )}
                                        </Draggable>
                                    </ErrorBoundary>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>

                {/* Footer Section */}
                {page.footer && (
                     <div className="flex-shrink-0 p-8 pt-0">
                        <CanvasComponent component={page.footer} isSelected={selectedComponentId} onClick={onComponentClick} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onDeleteComponent={onDeleteComponent} apiReady={apiReady} onUpdateProject={onUpdateProject} onUpdateTrial={onUpdateTrial}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(PageComponent);
