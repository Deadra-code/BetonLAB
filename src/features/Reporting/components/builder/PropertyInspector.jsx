// src/features/Reporting/components/builder/PropertyInspector.jsx
// DESKRIPSI: File ini telah dimodularisasi. Logika untuk setiap panel properti
// kini dipisah ke dalam file-file tersendiri di dalam direktori 'property-panels'.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

// Impor panel-panel yang telah dimodularisasi
import GeneralPanel from './property-panels/GeneralPanel';
import ReportSettingsPanel from './property-panels/ReportSettingsPanel';
import ComponentPropertiesPanel from './property-panels/ComponentPropertiesPanel';

export default function PropertyInspector({ selectedComponent, onPropertyChange, reportData, pageSettings, onPageSettingChange }) {
    return (
        <Card className="w-80 flex-shrink-0 flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg">Properti</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0 min-h-0">
                <ScrollArea className="h-full">
                    {selectedComponent ? 
                        (
                            <Tabs defaultValue="specific" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="specific">Properti</TabsTrigger>
                                    <TabsTrigger value="appearance">Tampilan</TabsTrigger>
                                </TabsList>
                                <TabsContent value="specific">
                                    <ComponentPropertiesPanel 
                                        component={selectedComponent} 
                                        onPropertyChange={onPropertyChange} 
                                    />
                                </TabsContent>
                                <TabsContent value="appearance">
                                    <GeneralPanel 
                                        component={selectedComponent} 
                                        onPropertyChange={onPropertyChange} 
                                    />
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <ReportSettingsPanel 
                                pageSettings={pageSettings} 
                                onPageSettingChange={onPageSettingChange} 
                            />
                        )
                    }
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
