// Lokasi file: src/features/Reporting/components/PageComponent.jsx
// Deskripsi: Menggunakan Flexbox untuk memastikan footer menempel di bagian bawah.

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
    
    const { header, components, footer } = page;

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
            <Droppable droppableId={`page-${pageIndex}-wrapper`} type="PAGE_WRAPPER">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={pageStyle}
                        onClick={onDeselect}
                        className="p-8 bg-white dark:bg-card shadow-lg mx-auto border flex flex-col"
                    >
                        {/* Header */}
                        {header && (
                            <Draggable key={header.instanceId} draggableId={header.instanceId} index={0}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <CanvasComponent {...{ component: header, isSelected: selectedComponentId, onClick: onComponentClick, reportData, settings, onPropertyChange, onDeleteComponent, apiReady, onUpdateProject, onUpdateTrial }} />
                                    </div>
                                )}
                            </Draggable>
                        )}

                        {/* Main Content Area */}
                        <Droppable droppableId={`page-${pageIndex}`} isDropDisabled={isPageDropDisabled}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={cn(
                                        "flex-grow w-full h-full",
                                        snapshot.isDraggingOver && !isPageDropDisabled && 'bg-primary/5',
                                        isPageDropDisabled && draggingComponent && "bg-red-100/50 border-red-300",
                                        components.length === 0 && !snapshot.isDraggingOver && "border-2 border-dashed rounded-lg flex items-center justify-center"
                                    )}
                                >
                                    {components.length === 0 && !snapshot.isDraggingOver && (
                                        <p className="text-muted-foreground">Area Halaman {pageIndex + 1}. Seret komponen ke sini.</p>
                                    )}
                                    {components.map((component, index) => (
                                        <ErrorBoundary key={component.instanceId}>
                                            <Draggable key={component.instanceId} draggableId={component.instanceId} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <CanvasComponent {...{ component, isSelected: selectedComponentId, onClick: onComponentClick, reportData, settings, onPropertyChange, onDeleteComponent, apiReady, onUpdateProject, onUpdateTrial }}/>
                                                    </div>
                                                )}
                                            </Draggable>
                                        </ErrorBoundary>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {/* Footer */}
                        {footer && (
                            <Draggable key={footer.instanceId} draggableId={footer.instanceId} index={1}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <CanvasComponent {...{ component: footer, isSelected: selectedComponentId, onClick: onComponentClick, reportData, settings, onPropertyChange, onDeleteComponent, apiReady, onUpdateProject, onUpdateTrial }} />
                                    </div>
                                )}
                            </Draggable>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default React.memo(PageComponent);
