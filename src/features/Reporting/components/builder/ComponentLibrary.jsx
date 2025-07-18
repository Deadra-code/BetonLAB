// Lokasi file: src/features/Reporting/components/builder/ComponentLibrary.jsx
// Deskripsi: Komponen data kini dinonaktifkan jika tidak ada "Data Pratinjau" yang dipilih.

import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../../components/ui/collapsible';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronRight, Info } from 'lucide-react';
import { AVAILABLE_COMPONENTS, LibraryComponent } from '../../reportComponents';
import AssetManager from '../../AssetManager';
import { cn } from '../../../../lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../../../../components/ui/tooltip';

// TAHAP 2: Menerima prop `reportData` untuk memeriksa ketersediaan data.
export default function ComponentLibrary({ reportData }) {
    const isDataLoaded = !!reportData;

    return (
        <Card className="w-72 flex-shrink-0 flex flex-col">
            <Tabs defaultValue="components" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="components">Komponen</TabsTrigger>
                    <TabsTrigger value="assets">Aset</TabsTrigger>
                </TabsList>
                <TabsContent value="components" className="flex-grow min-h-0">
                    <ScrollArea className="h-full p-4">
                        {/* TAHAP 2: Tambahkan pesan info jika data belum dimuat */}
                        {!isDataLoaded && (
                            <div className="p-2 mb-4 text-xs text-center bg-blue-50 border border-blue-200 text-blue-800 rounded-md flex items-center">
                                <Info className="h-4 w-4 mr-2 flex-shrink-0"/>
                                Pilih "Data Pratinjau" di header untuk mengaktifkan Komponen Data.
                            </div>
                        )}
                        {AVAILABLE_COMPONENTS.map((group, groupIndex) => {
                            // TAHAP 2: Tentukan apakah grup ini harus dinonaktifkan
                            const isDisabled = group.group === 'Komponen Data' && !isDataLoaded;
                            return (
                                <Collapsible key={group.group} defaultOpen className="mb-1">
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex justify-between items-center p-2 rounded-md hover:bg-accent">
                                            <h4 className={cn("font-semibold text-sm", isDisabled && "text-muted-foreground/50")}>{group.group}</h4>
                                            <ChevronRight className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-90" />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <Droppable droppableId={`library-group-${groupIndex}`} isDropDisabled={true}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps} className="py-2 pl-2 border-l-2 ml-2">
                                                    {group.items.map((item, itemIndex) => (
                                                        <TooltipProvider key={item.id}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    {/* TAHAP 2: Terapkan `isDragDisabled` dan styling nonaktif */}
                                                                    <div className={cn(isDisabled && "opacity-50 cursor-not-allowed")}>
                                                                        <Draggable key={item.id} draggableId={item.id} index={itemIndex} isDragDisabled={isDisabled}>
                                                                            {(provided) => (
                                                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                                    <LibraryComponent component={item} />
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                {isDisabled && <TooltipContent><p>Pilih "Data Pratinjau" untuk menggunakan komponen ini.</p></TooltipContent>}
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </CollapsibleContent>
                                </Collapsible>
                            );
                        })}
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="assets" className="flex-grow min-h-0">
                    <AssetManager />
                </TabsContent>
            </Tabs>
        </Card>
    );
}
