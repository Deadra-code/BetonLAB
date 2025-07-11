// Lokasi file: src/features/Reporting/components/TrialLoopingSection.jsx
// Deskripsi: Perbaikan pada fungsionalitas hapus untuk komponen anak di dalam loop.

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { CanvasComponent } from '../reportComponents';
import { Button } from '../../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const TrialLoopingSection = ({ component, onComponentClick, selectedComponentId, reportData, settings, onPropertyChange, onDeleteComponent }) => {
    const { children = [], instanceId } = component;

    const selectedTrialIds = component.properties?.selectedTrials || [];
    const trialsToRender = selectedTrialIds.length > 0
        ? reportData?.trials.filter(t => selectedTrialIds.includes(t.id)) || []
        : reportData?.trials || [];

    return (
        <div className="p-4 my-2 border-2 border-dashed border-purple-400 rounded-md bg-purple-50/50">
            {trialsToRender.length === 0 && (
                 <div className="p-4 text-center text-muted-foreground">
                    <h4 className="font-semibold text-purple-700">Bagian Perulangan Trial</h4>
                    <p className="text-sm text-purple-600">Pilih komponen ini dan gunakan panel Properti untuk memilih trial mix yang akan ditampilkan, atau pastikan proyek memiliki data trial.</p>
                 </div>
            )}

            {trialsToRender.map((trial, loopIndex) => (
                <div key={trial.id} className="mb-4 p-2 border-b-2 border-purple-200 last:border-b-0">
                    {children.map((childComponent, childIndex) => (
                         <div key={childComponent.instanceId + loopIndex} className="relative group">
                            <div className={cn(selectedComponentId === childComponent.instanceId && "outline outline-2 outline-offset-2 outline-primary rounded-md")}>
                                <CanvasComponent
                                    component={childComponent}
                                    onClick={onComponentClick}
                                    isSelected={selectedComponentId}
                                    reportData={{...reportData, trials: [trial]}}
                                    settings={settings}
                                    onPropertyChange={onPropertyChange}
                                    onDeleteComponent={onDeleteComponent}
                                />
                            </div>
                            {/* Tombol hapus hanya muncul sekali, di atas tumpukan komponen */}
                            {loopIndex === 0 && (
                                 <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // PERBAIKAN: Memanggil onDeleteComponent dengan ID anak
                                        onDeleteComponent(childComponent.instanceId);
                                    }}
                                >
                                    <Trash2 size={12} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            ))}

             <Droppable droppableId={`loop-${instanceId}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn("min-h-[50px] mt-2 p-2 rounded transition-colors", snapshot.isDraggingOver ? "bg-purple-200" : "bg-purple-100")}
                    >
                        <p className="text-xs text-center text-muted-foreground">Seret komponen ke dalam bagian perulangan ini</p>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default TrialLoopingSection;
