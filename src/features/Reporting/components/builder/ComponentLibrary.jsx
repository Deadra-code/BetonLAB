// Lokasi file: src/features/Reporting/components/builder/ComponentLibrary.jsx
// Deskripsi: Komponen modular untuk panel Pustaka Komponen di sisi kiri Report Builder.

import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../../components/ui/collapsible';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronRight } from 'lucide-react';
import { AVAILABLE_COMPONENTS, LibraryComponent } from '../../reportComponents';
import AssetManager from '../../AssetManager';

export default function ComponentLibrary() {
    return (
        <Card className="w-72 flex-shrink-0 flex flex-col">
            <Tabs defaultValue="components" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="components">Komponen</TabsTrigger>
                    <TabsTrigger value="assets">Aset</TabsTrigger>
                </TabsList>
                <TabsContent value="components" className="flex-grow min-h-0">
                    <ScrollArea className="h-full p-4">
                        {AVAILABLE_COMPONENTS.map((group, groupIndex) => (
                            <Collapsible key={group.group} defaultOpen className="mb-1">
                                <CollapsibleTrigger className="w-full">
                                    <div className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                                        <h4 className="font-semibold text-sm">{group.group}</h4>
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <Droppable droppableId={`library-group-${groupIndex}`} isDropDisabled={true}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className="py-2 pl-2 border-l-2 ml-2">
                                                {group.items.map((item, itemIndex) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                <LibraryComponent component={item} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="assets" className="flex-grow min-h-0">
                    <AssetManager />
                </TabsContent>
            </Tabs>
        </Card>
    );
}
