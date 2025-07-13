// Lokasi file: src/features/Reporting/components/PageComponent.jsx
// Deskripsi: Menambahkan handler onClick pada area halaman untuk membatalkan seleksi.

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CanvasComponent } from '../reportComponents';
import { Button } from '../../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const PAGE_DIMENSIONS = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
};

// PERUBAHAN: Menambahkan prop onDeselect
const PageComponent = ({ page, pageIndex, onComponentClick, onDeletePage, onDeleteComponent, selectedComponentId, reportData, settings, onPropertyChange, apiReady, pageSettings, onDeselect }) => {
    
    const { size = 'a4', orientation = 'portrait' } = pageSettings || {};
    const dimensions = PAGE_DIMENSIONS[size];

    const pageStyle = {
        width: orientation === 'portrait' ? `${dimensions.width}mm` : `${dimensions.height}mm`,
        minHeight: orientation === 'portrait' ? `${dimensions.height}mm` : `${dimensions.width}mm`,
    };

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
            <Droppable droppableId={`page-${pageIndex}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={pageStyle}
                        // PERUBAHAN: Menambahkan event onClick untuk memanggil fungsi onDeselect
                        onClick={onDeselect}
                        className={cn(
                            "p-8 bg-white dark:bg-card shadow-lg mx-auto border",
                            snapshot.isDraggingOver && 'bg-primary/5'
                        )}
                    >
                        {page.length === 0 && !snapshot.isDraggingOver && (
                            <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Area Halaman {pageIndex + 1}. Seret komponen ke sini.</p>
                            </div>
                        )}
                        {page.map((component) => (
                            <Draggable key={component.instanceId} draggableId={component.instanceId} index={page.indexOf(component)}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="relative group/component"
                                    >
                                        <div className={cn(selectedComponentId === component.instanceId && "outline outline-2 outline-offset-2 outline-primary rounded-md")}>
                                            <CanvasComponent
                                                component={component}
                                                isSelected={selectedComponentId}
                                                onClick={onComponentClick}
                                                reportData={reportData}
                                                settings={settings}
                                                onPropertyChange={onPropertyChange}
                                                onDeleteComponent={onDeleteComponent}
                                                apiReady={apiReady}
                                            />
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover/component:opacity-100 transition-opacity z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteComponent(component.instanceId);
                                            }}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default React.memo(PageComponent);
