// Lokasi file: src/features/Reporting/ReportBuilderV2.jsx
// Deskripsi: Menambahkan pengaturan halaman (ukuran & orientasi) dan panel properti default.

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { PlusSquare, Trash2, Settings2 } from 'lucide-react';
import { AVAILABLE_COMPONENTS, LibraryComponent } from './reportComponents';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import PageComponent from './components/PageComponent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';


// Panel Properti saat TIDAK ADA komponen yang dipilih
const ReportSettingsPanel = ({ pageSettings, onPageSettingChange }) => (
    <div className="p-4 space-y-4">
        <div className="flex items-center text-lg font-semibold">
            <Settings2 className="mr-2 h-5 w-5" />
            Pengaturan Laporan
        </div>
        <p className="text-sm text-muted-foreground">
            Atur properti global untuk seluruh halaman laporan Anda.
        </p>
        <div className="space-y-2">
            <Label htmlFor="page-size">Ukuran Kertas</Label>
            <Select value={pageSettings.size} onValueChange={(value) => onPageSettingChange('size', value)}>
                <SelectTrigger id="page-size"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="page-orientation">Orientasi</Label>
            <Select value={pageSettings.orientation} onValueChange={(value) => onPageSettingChange('orientation', value)}>
                <SelectTrigger id="page-orientation"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="portrait">Potret (Portrait)</SelectItem>
                    <SelectItem value="landscape">Lanskap (Landscape)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);


// Panel Properti saat ADA komponen yang dipilih
const PropertyInspector = ({ component, onPropertyChange, reportData, apiReady }) => {
    // ... (Isi dari PropertyInspector tetap sama, tidak perlu diubah)
    if (!component) {
        return null; // Akan ditangani oleh ReportSettingsPanel
    }
    const handleChange = (propName, value) => onPropertyChange(component.instanceId, propName, value);
    const handleAppearanceChange = (propName, value) => {
        const newAppearance = { ...(component.properties.appearance || {}), [propName]: value };
        onPropertyChange(component.instanceId, 'appearance', newAppearance);
    };

    const handleTrialSelection = (trialId) => {
        const currentSelection = component.properties.selectedTrials || [];
        const newSelection = currentSelection.includes(trialId)
            ? currentSelection.filter(id => id !== trialId)
            : [...currentSelection, trialId];
        handleChange('selectedTrials', newSelection);
    };

    const renderSpecificProperties = () => {
        switch (component.id) {
            case 'custom-text':
                return (
                    <div className="space-y-4">
                        <div><Label htmlFor="content">Teks Konten</Label><Input id="content" value={component.properties.content || ''} onChange={(e) => handleChange('content', e.target.value)} /></div>
                        <div><Label htmlFor="fontSize">Ukuran Font (pt)</Label><Input id="fontSize" type="number" value={component.properties.fontSize || 12} onChange={(e) => handleChange('fontSize', parseInt(e.target.value))} /></div>
                        <div><Label htmlFor="color">Warna Teks</Label><Input id="color" type="color" value={component.properties.color || '#000000'} onChange={(e) => handleChange('color', e.target.value)} /></div>
                    </div>
                );
            case 'jmd-table':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Opsi Tabel JMD</h4>
                        <div className="flex items-center space-x-2"><Checkbox id="showSsd" checked={component.properties.showSsd ?? true} onCheckedChange={(checked) => handleChange('showSsd', checked)} /><Label htmlFor="showSsd">Tampilkan Proporsi SSD</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showCorrected" checked={component.properties.showCorrected ?? true} onCheckedChange={(checked) => handleChange('showCorrected', checked)} /><Label htmlFor="showCorrected">Tampilkan Proporsi Koreksi</Label></div>
                    </div>
                );
            case 'material-properties-table':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Opsi Tabel Properti</h4>
                        <div><Label>Judul Tabel</Label><Input value={component.properties.title || ''} onChange={(e) => handleChange('title', e.target.value)} placeholder="Properti Material"/></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showSg" checked={component.properties.showSg ?? true} onCheckedChange={(checked) => handleChange('showSg', checked)} /><Label htmlFor="showSg">Tampilkan BJ</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showAbsorption" checked={component.properties.showAbsorption ?? true} onCheckedChange={(checked) => handleChange('showAbsorption', checked)} /><Label htmlFor="showAbsorption">Tampilkan Penyerapan</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showMoisture" checked={component.properties.showMoisture ?? true} onCheckedChange={(checked) => handleChange('showMoisture', checked)} /><Label htmlFor="showMoisture">Tampilkan Kadar Air</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showBulkDensity" checked={component.properties.showBulkDensity ?? true} onCheckedChange={(checked) => handleChange('showBulkDensity', checked)} /><Label htmlFor="showBulkDensity">Tampilkan Berat Isi</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showFm" checked={component.properties.showFm ?? true} onCheckedChange={(checked) => handleChange('showFm', checked)} /><Label htmlFor="showFm">Tampilkan FM</Label></div>
                    </div>
                );
            case 'strength-summary-table':
            case 'combined-gradation-chart':
            case 'strength-chart':
            case 'sqc-chart':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Opsi Komponen</h4>
                        <div><Label>Judul</Label><Input value={component.properties.title || ''} onChange={(e) => handleChange('title', e.target.value)} placeholder="Judul Default"/></div>
                    </div>
                );
            case 'trial-info-block':
                 return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Opsi Tampilan</h4>
                        <div className="flex items-center space-x-2"><Checkbox id="showBorder" checked={component.properties.showBorder ?? true} onCheckedChange={(checked) => handleChange('showBorder', checked)} /><Label htmlFor="showBorder">Tampilkan Border</Label></div>
                    </div>
                );
            case 'vertical-spacer':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Opsi Spasi</h4>
                        <div><Label>Tinggi (px)</Label><Input type="number" value={component.properties.height || 20} onChange={(e) => handleChange('height', parseInt(e.target.value))} /></div>
                    </div>
                );
            case 'custom-image':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Opsi Gambar</h4>
                        <div className="flex items-center space-x-2"><Checkbox id="hasFrame" checked={component.properties.hasFrame ?? false} onCheckedChange={(checked) => handleChange('hasFrame', checked)} /><Label htmlFor="hasFrame">Tampilkan Bingkai</Label></div>
                    </div>
                );
            case 'signature-block':
                return (
                   <div className="space-y-4">
                       <h4 className="font-semibold">Blok Tanda Tangan Kiri</h4>
                       <div><Label>Label 1</Label><Input value={component.properties.label1 || 'Disiapkan oleh,'} onChange={(e) => handleChange('label1', e.target.value)} /></div>
                       <div><Label>Nama 1</Label><Input value={component.properties.name1 || '(_________________)'} onChange={(e) => handleChange('name1', e.target.value)} /></div>
                       <div><Label>Posisi 1</Label><Input value={component.properties.position1 || 'Teknisi Lab'} onChange={(e) => handleChange('position1', e.target.value)} /></div>
                       <h4 className="font-semibold pt-4 border-t">Blok Tanda Tangan Kanan</h4>
                       <div><Label>Label 2</Label><Input value={component.properties.label2 || 'Disetujui oleh,'} onChange={(e) => handleChange('label2', e.target.value)} /></div>
                       <div><Label>Nama 2</Label><Input value={component.properties.name2 || '(_________________)'} onChange={(e) => handleChange('name2', e.target.value)} /></div>
                       <div><Label>Posisi 2</Label><Input value={component.properties.position2 || 'Penyelia'} onChange={(e) => handleChange('position2', e.target.value)} /></div>
                   </div>
               );
            case 'trial-loop':
                return (
                    <div className="space-y-2">
                        <Label>Pilih Trial untuk Ditampilkan</Label>
                        <ScrollArea className="h-40 border rounded-md p-2">
                            {(reportData?.trials || []).map(trial => (
                                <div key={trial.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`trial-cb-${trial.id}`}
                                        checked={(component.properties.selectedTrials || []).includes(trial.id)}
                                        onCheckedChange={() => handleTrialSelection(trial.id)}
                                    />
                                    <Label htmlFor={`trial-cb-${trial.id}`} className="font-normal">{trial.trial_name}</Label>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                );
            default:
                return <p className="text-sm text-muted-foreground">Tidak ada properti spesifik untuk komponen ini.</p>;
        }
    };

    return (
        <div className="p-4">
            <h4 className="font-bold mb-2">{component.name}</h4>
            <Tabs defaultValue="specific">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="specific">Properti</TabsTrigger>
                    <TabsTrigger value="appearance">Tampilan</TabsTrigger>
                </TabsList>
                <TabsContent value="specific" className="pt-4">{renderSpecificProperties()}</TabsContent>
                <TabsContent value="appearance" className="pt-4 space-y-4">
                    <div><Label>Margin Atas (px)</Label><Input type="number" value={component.properties.appearance?.marginTop || 8} onChange={(e) => handleAppearanceChange('marginTop', parseInt(e.target.value))} /></div>
                    <div><Label>Margin Bawah (px)</Label><Input type="number" value={component.properties.appearance?.marginBottom || 8} onChange={(e) => handleAppearanceChange('marginBottom', parseInt(e.target.value))} /></div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default function ReportBuilderV2({ reportData, settings, onLayoutChange, initialLayout = [], apiReady }) {
    const [layout, setLayout] = useState(initialLayout.length > 0 ? initialLayout : [[]]);
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    // State baru untuk pengaturan halaman
    const [pageSettings, setPageSettings] = useState({
        size: 'a4',
        orientation: 'portrait'
    });

    useEffect(() => {
        // ... (logika useEffect yang ada tetap sama)
        if (initialLayout.length > 0 && !Array.isArray(initialLayout[0])) {
            setLayout([initialLayout]);
        } else if (initialLayout.length === 0) {
            setLayout([[]]);
        } else {
            setLayout(initialLayout);
        }
    }, [initialLayout]);

    useEffect(() => { 
        if (onLayoutChange) { 
            // Sertakan pageSettings saat layout berubah
            onLayoutChange({ layout, pageSettings }); 
        } 
    }, [layout, pageSettings, onLayoutChange]);

    const addPage = () => {
        setLayout(prevLayout => [...prevLayout, []]);
    };

    const onDragEnd = (result) => {
        // ... (logika onDragEnd yang sudah diperbaiki tetap sama)
        const { source, destination } = result;
        if (!destination) return;

        const newLayout = JSON.parse(JSON.stringify(layout));

        const findContainerRecursive = (component, droppableId) => {
            if (component.id === 'section' && component.instanceId === droppableId) return component.children;
            if (component.id === 'trial-loop' && `loop-${component.instanceId}` === droppableId) return component.children;
            if (component.id === 'columns-2' || component.id === 'columns-3') {
                 if (droppableId.startsWith(component.instanceId)) {
                    const colIndex = parseInt(droppableId.split('-col-')[1]);
                    if (component.children && Array.isArray(component.children[colIndex])) {
                        return component.children[colIndex];
                    }
                }
            }
            if (component.children && Array.isArray(component.children)) {
                if (component.id === 'columns-2' || component.id === 'columns-3') {
                    for (const colArray of component.children) {
                        for (const child of colArray) {
                            const found = findContainerRecursive(child, droppableId);
                            if (found) return found;
                        }
                    }
                } else {
                    for (const child of component.children) {
                        const found = findContainerRecursive(child, droppableId);
                        if (found) return found;
                    }
                }
            }
            return null;
        };

        const findTopLevelContainer = (nodes, droppableId) => {
            if (droppableId.startsWith('page-')) {
                const pageIndex = parseInt(droppableId.split('-')[1]);
                return nodes[pageIndex];
            }
            for (const page of nodes) {
                for (const component of page) {
                    const found = findContainerRecursive(component, droppableId);
                    if (found) return found;
                }
            }
            return null;
        };

        let movedItem;
        if (source.droppableId.startsWith('library-group')) {
            const groupIndex = parseInt(source.droppableId.split('-')[2]);
            const itemIndex = source.index;
            const componentToClone = AVAILABLE_COMPONENTS[groupIndex].items[itemIndex];
            movedItem = { 
                ...componentToClone, 
                instanceId: `${componentToClone.id}-${Date.now()}`, 
                children: componentToClone.children ? JSON.parse(JSON.stringify(componentToClone.children)) : undefined,
                properties: {} 
            };
        } else {
            const sourceContainer = findTopLevelContainer(newLayout, source.droppableId);
            if (!sourceContainer) return;
            [movedItem] = sourceContainer.splice(source.index, 1);
        }

        const destinationContainer = findTopLevelContainer(newLayout, destination.droppableId);
        if (!destinationContainer) {
             if (!source.droppableId.startsWith('library-group')) {
                 const sourceContainer = findTopLevelContainer(newLayout, source.droppableId);
                 if(sourceContainer) sourceContainer.splice(source.index, 0, movedItem);
            }
            setLayout(newLayout);
            return;
        }
        destinationContainer.splice(destination.index, 0, movedItem);
        
        setLayout(newLayout);
    };

    const handlePropertyChange = (instanceId, propName, value) => {
        // ... (logika handlePropertyChange tetap sama)
        const newLayout = JSON.parse(JSON.stringify(layout));
        let componentFound = false;

        const updatePropertiesRecursive = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                const component = nodes[i];
                if (component.instanceId === instanceId) {
                    if (!component.properties) component.properties = {};
                    component.properties[propName] = value;
                    componentFound = true;
                    return;
                }
                if (component.children && Array.isArray(component.children)) {
                    if (component.id === 'columns-2' || component.id === 'columns-3') {
                        for (const col of component.children) {
                            updatePropertiesRecursive(col);
                            if (componentFound) return;
                        }
                    } else {
                        updatePropertiesRecursive(component.children);
                        if (componentFound) return;
                    }
                }
            }
        };
        
        for (const page of newLayout) {
            updatePropertiesRecursive(page);
            if(componentFound) break;
        }
        
        setLayout(newLayout);
    };

    const handleDeletePage = (pageIndex) => {
        // ... (logika handleDeletePage tetap sama)
        if (layout.length > 1) {
            if (window.confirm(`Anda yakin ingin menghapus Halaman ${pageIndex + 1}?`)) {
                const newLayout = [...layout];
                newLayout.splice(pageIndex, 1);
                setLayout(newLayout);
            }
        } else {
            alert("Tidak dapat menghapus halaman terakhir.");
        }
    };
    
    const handleDeleteComponent = (instanceIdToDelete) => {
        // ... (logika handleDeleteComponent tetap sama)
        const newLayout = JSON.parse(JSON.stringify(layout));

        const removeById = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                const component = nodes[i];
                if (component.instanceId === instanceIdToDelete) {
                    nodes.splice(i, 1);
                    return true;
                }
                if (component.children && Array.isArray(component.children)) {
                    if (component.id === 'columns-2' || component.id === 'columns-3') {
                        for (const col of component.children) {
                            if (removeById(col)) return true;
                        }
                    } else {
                        if (removeById(component.children)) return true;
                    }
                }
            }
            return false;
        };

        for (const page of newLayout) {
            if (removeById(page)) break;
        }

        setLayout(newLayout);
        if (selectedComponentId === instanceIdToDelete) {
            setSelectedComponentId(null);
        }
    };

    const findComponentById = (id) => {
        // ... (logika findComponentById tetap sama)
        if (!id) return null;
        let found = null;
        const findRecursive = (nodes) => {
            for (const component of nodes) {
                if (component.instanceId === id) {
                    found = component;
                    return;
                }
                 if (component.children && Array.isArray(component.children)) {
                    if (component.id === 'columns-2' || component.id === 'columns-3') {
                        for (const col of component.children) {
                            findRecursive(col);
                            if (found) return;
                        }
                    } else {
                        findRecursive(component.children);
                        if (found) return;
                    }
                }
            }
        };
        for (const page of layout) {
            findRecursive(page);
            if(found) break;
        }
        return found;
    };

    const selectedComponent = findComponentById(selectedComponentId);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="h-full w-full flex gap-4 bg-background p-4">
                <Card className="w-72 flex-shrink-0 flex flex-col">
                    <CardHeader className="flex-shrink-0"><CardTitle className="text-lg">Pustaka Komponen</CardTitle></CardHeader>
                    <CardContent className="flex-grow p-0 min-h-0">
                        <ScrollArea className="h-full p-4 pt-0">
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
                                                            {(provided) => (<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}><LibraryComponent component={item} /></div>)}
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
                    </CardContent>
                </Card>

                <div className="flex-grow flex flex-col min-w-0">
                    <ScrollArea className="flex-grow bg-muted p-4 rounded-md">
                        {layout.map((page, index) => (
                            <PageComponent
                                key={index}
                                page={page}
                                pageIndex={index}
                                onComponentClick={setSelectedComponentId}
                                onDeletePage={handleDeletePage}
                                onDeleteComponent={handleDeleteComponent}
                                selectedComponentId={selectedComponentId}
                                reportData={reportData}
                                settings={settings}
                                onPropertyChange={handlePropertyChange}
                                apiReady={apiReady}
                                pageSettings={pageSettings} // Teruskan pengaturan halaman
                            />
                        ))}
                        <div className="flex justify-center mt-4">
                            <Button onClick={addPage} variant="outline">
                                <PlusSquare className="mr-2 h-4 w-4" /> Tambah Halaman
                            </Button>
                        </div>
                    </ScrollArea>
                </div>

                <Card className="w-72 flex-shrink-0 flex flex-col">
                    <CardHeader className="flex-shrink-0"><CardTitle className="text-lg">Properti</CardTitle></CardHeader>
                    <CardContent className="flex-grow p-0 min-h-0">
                        <ScrollArea className="h-full">
                            {selectedComponent ? (
                                <PropertyInspector component={selectedComponent} onPropertyChange={handlePropertyChange} reportData={reportData} apiReady={apiReady} />
                            ) : (
                                <ReportSettingsPanel pageSettings={pageSettings} onPageSettingChange={setPageSettings} />
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </DragDropContext>
    );
}
