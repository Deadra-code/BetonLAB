// Lokasi file: src/features/MaterialTesting/MaterialTestingManager.js
// Deskripsi: Rombak total untuk menciptakan dasbor manajemen material yang cerdas dan informatif.

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PlusCircle, Beaker, Component, Waves, Package, Combine, Trash2, Pencil, ClipboardList, XCircle, Copy, AlertTriangle, MoreVertical, Search, CheckCircle, HelpCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { useNotifier } from '../../hooks/useNotifier';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { useMaterials } from '../../hooks/useMaterials';
import { useMaterialTests } from '../../hooks/useMaterialTests';
import { useTestTemplates } from '../../hooks/useTestTemplates';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { cn } from '../../lib/utils';

import SieveAnalysisTest from './SieveAnalysisTest';
import SpecificGravityTest from './SpecificGravityTest';
import MoistureContentTest from './MoistureContentTest';
import SiltContentTest from './SiltContentTest';
import BulkDensityTest from './BulkDensityTest';
import LosAngelesAbrasionTest from './LosAngelesAbrasionTest';
import OrganicContentTest from './OrganicContentTest';
import AggregateBlending from './AggregateBlending';
import TestTemplateManager from './TestTemplateManager';
// PERBAIKAN: Mengubah impor dari named menjadi default
import AddMaterialDialog from './AddMaterialDialog';

// --- Helper Function untuk Status & Tooltip ---
const getMaterialStatus = (material, allMaterials) => {
    if (material.is_blend) {
        const componentIds = JSON.parse(material.blend_components_json || '[]').map(c => c.id);
        const allComponentsExist = componentIds.every(id => allMaterials.some(m => m.id === id));
        if (!allComponentsExist) {
            return { status: 'Tidak Valid', color: 'bg-red-500', message: 'Salah satu komponen campuran telah dihapus.' };
        }
        return { status: 'Campuran', color: 'bg-purple-500', message: 'Material hasil campuran.' };
    }

    const tests = {};
    if (material.active_tests) {
        material.active_tests.split('|||').forEach(pair => {
            const [type] = pair.split(':::');
            if (type) tests[type] = true;
        });
    }

    const requiredTests = {
        fine_aggregate: ['specific_gravity', 'sieve_analysis'],
        coarse_aggregate: ['specific_gravity', 'sieve_analysis', 'bulk_density'],
        cement: ['specific_gravity'],
    };

    const hasAllRequired = (requiredTests[material.material_type] || []).every(testKey => tests[testKey]);

    if (hasAllRequired) {
        return { status: 'Siap', color: 'bg-green-500', message: 'Semua data kunci untuk desain tersedia.' };
    }
    return { status: 'Kurang', color: 'bg-yellow-500', message: 'Data pengujian kunci belum lengkap/aktif.' };
};


// --- Komponen Baru: Material List Item ---
const MaterialListItem = ({ material, allMaterials, onSelect, isSelected, onUpdate, onDelete, onDuplicate }) => {
    const { status, color, message } = getMaterialStatus(material, allMaterials);

    const icons = {
        fine_aggregate: <Waves className="h-5 w-5 text-yellow-500" />,
        coarse_aggregate: <Component className="h-5 w-5 text-blue-500" />,
        cement: <Package className="h-5 w-5 text-gray-500" />,
    };
    const icon = material.is_blend ? <Combine className="h-5 w-5 text-purple-500" /> : icons[material.material_type];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={() => onSelect(material)}
                        className={cn(
                            "flex items-center p-2 rounded-md cursor-pointer group",
                            isSelected ? 'bg-primary/10' : 'hover:bg-accent'
                        )}
                    >
                        <div className="flex items-center flex-grow truncate">
                            {icon}
                            <span className="ml-3 text-sm font-medium truncate" title={material.name}>{material.name}</span>
                        </div>
                        <div className="flex items-center flex-shrink-0">
                             <Badge className={cn("mr-2", color)}>{status}</Badge>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"><MoreVertical size={14}/></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <AddMaterialDialog material={material} onMaterialAdded={onUpdate} isEditing={true}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Pencil size={14} className="mr-2"/> Edit</DropdownMenuItem>
                                    </AddMaterialDialog>
                                    <DropdownMenuItem onSelect={() => onDuplicate(material)}><Copy size={14} className="mr-2"/> Duplikat</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <SecureDeleteDialog
                                        trigger={<div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive"><Trash2 size={14} className="mr-2"/> Hapus</div>}
                                        title="Hapus Material?"
                                        description={`Aksi ini akan menghapus "${material.name}" dan semua data pengujian terkait secara permanen.`}
                                        confirmationText="HAPUS"
                                        onConfirm={() => onDelete(material.id)}
                                    />
                                </DropdownMenuContent>
                             </DropdownMenu>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>{message}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


// --- Komponen Utama (Dirombak Total) ---
export default function MaterialTestingManager({ apiReady }) {
    const { materials, addMaterial, updateMaterial, deleteMaterial, setMaterialStatus, refreshMaterials } = useMaterials(apiReady);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const { tests, addTest, setActiveTest } = useMaterialTests(selectedMaterial?.id);
    const { templates } = useTestTemplates(apiReady);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const { notify } = useNotifier();
    
    // State baru untuk filter dan pencarian
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleSaveBlend = async (blendedMaterial) => {
        const success = await addMaterial(blendedMaterial);
        if (success) refreshMaterials();
        return success;
    };

    const handleDeleteMaterial = async (id) => {
        await deleteMaterial(id);
        if (selectedMaterial?.id === id) {
            setSelectedMaterial(null);
        }
    };
    
    const handleDuplicateMaterial = (material) => {
        const newMaterial = { ...material, name: `${material.name} (Salinan)` };
        delete newMaterial.id;
        delete newMaterial.active_tests;
        addMaterial(newMaterial);
    };

    const handleSelectMaterial = (material) => {
        setSelectedMaterial(material);
        setActiveTemplate(null);
    };

    // Logika untuk memfilter dan mencari material
    const filteredMaterials = useMemo(() => {
        return materials
            .filter(m => filter === 'all' || m.material_type === filter)
            .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [materials, filter, searchQuery]);


    const testTabsComponent = useMemo(() => {
        if (!selectedMaterial) return null;
        
        if (selectedMaterial.is_blend) {
            const components = JSON.parse(selectedMaterial.blend_components_json || '[]' );
            const componentDetails = components.map(c => { const mat = materials.find(m => m.id === c.id); return `${c.ratio}% ${mat ? mat.name : 'Material Dihapus'}`; }).join(' + ');
            return ( <div className="mt-4 p-4 bg-muted/50 rounded-lg border"> <h3 className="font-semibold text-lg">Detail Material Campuran</h3> <p className="text-muted-foreground">Material ini adalah hasil campuran dan tidak dapat diuji secara langsung.</p> <p className="mt-2 font-medium">{componentDetails}</p> </div> )
        }

        const allPossibleTests = [
            { value: "sieve_analysis", label: "Analisis Saringan", component: <SieveAnalysisTest material={selectedMaterial} tests={tests.filter(t => t.test_type === 'sieve_analysis')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate'] },
            { value: "specific_gravity", label: "Berat Jenis", component: <SpecificGravityTest tests={tests.filter(t => t.test_type === 'specific_gravity')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate', 'cement'] },
            { value: "moisture", label: "Kadar Air", component: <MoistureContentTest tests={tests.filter(t => t.test_type === 'moisture')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate'] },
            { value: "silt", label: "Kadar Lumpur", component: <SiltContentTest tests={tests.filter(t => t.test_type === 'silt')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate'] },
            { value: "bulk_density", label: "Berat Isi", component: <BulkDensityTest tests={tests.filter(t => t.test_type === 'bulk_density')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['coarse_aggregate'] },
            { value: "organic_content", label: "Kadar Organik", component: <OrganicContentTest tests={tests.filter(t => t.test_type === 'organic_content')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate'] },
            { value: "los_angeles", label: "Abrasi Los Angeles", component: <LosAngelesAbrasionTest tests={tests.filter(t => t.test_type === 'los_angeles')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['coarse_aggregate'] },
        ];
        
        let availableTests = allPossibleTests.filter(test => test.types.includes(selectedMaterial.material_type));
        
        if (activeTemplate) {
            const templateTests = JSON.parse(activeTemplate.tests_json || '[]').map(t => t.id);
            availableTests = availableTests.filter(test => templateTests.includes(test.value));
        }
        
        if (availableTests.length === 0) return <div className="text-center py-10 border-2 border-dashed rounded-lg mt-4"><ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" /><h4 className="mt-4 text-lg font-semibold">Tidak Ada Jenis Pengujian</h4></div>;

        return ( <Tabs defaultValue={availableTests[0].value} className="w-full mt-4"> <TabsList className="h-auto flex-wrap justify-start"> {availableTests.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)} </TabsList> {availableTests.map(tab => <TabsContent key={tab.value} value={tab.value} className="mt-4">{tab.component}</TabsContent>)} </Tabs> )
    }, [selectedMaterial, tests, materials, addTest, setActiveTest, activeTemplate]);


    return (
        <div className="flex h-full bg-muted/20">
            <aside className="w-[400px] border-r p-4 overflow-y-auto bg-card flex flex-col">
                <h2 className="text-lg font-bold mb-4 px-2 flex-shrink-0">Pustaka Material</h2>
                
                {/* --- PERBAIKAN: Kontrol Aksi & Filter --- */}
                <div className="px-2 mb-4 space-y-3 flex-shrink-0">
                    <div className="flex gap-2">
                        <AddMaterialDialog onMaterialAdded={refreshMaterials}>
                             <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Tambah</Button>
                        </AddMaterialDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" className="w-full">Aksi Lainnya <MoreVertical className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AggregateBlending materials={materials} onSave={handleSaveBlend} apiReady={apiReady}>
                                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Combine className="mr-2 h-4 w-4"/> Buat Campuran Agregat</DropdownMenuItem>
                                </AggregateBlending>
                                <Dialog>
                                    <DialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}><ClipboardList className="mr-2 h-4 w-4"/> Kelola Template</DropdownMenuItem></DialogTrigger>
                                    <TestTemplateManager apiReady={apiReady} />
                                </Dialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari material..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex gap-1 bg-muted p-1 rounded-md">
                        <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'secondary' : 'ghost'} className="flex-1 h-8 text-xs">Semua</Button>
                        <Button onClick={() => setFilter('cement')} variant={filter === 'cement' ? 'secondary' : 'ghost'} className="flex-1 h-8 text-xs">Semen</Button>
                        <Button onClick={() => setFilter('fine_aggregate')} variant={filter === 'fine_aggregate' ? 'secondary' : 'ghost'} className="flex-1 h-8 text-xs">Ag. Halus</Button>
                        <Button onClick={() => setFilter('coarse_aggregate')} variant={filter === 'coarse_aggregate' ? 'secondary' : 'ghost'} className="flex-1 h-8 text-xs">Ag. Kasar</Button>
                    </div>
                </div>

                <ScrollArea className="flex-grow space-y-1 pr-2">
                    {filteredMaterials.map(mat => (
                        <MaterialListItem 
                            key={mat.id}
                            material={mat}
                            allMaterials={materials}
                            onSelect={handleSelectMaterial}
                            isSelected={selectedMaterial?.id === mat.id}
                            onUpdate={refreshMaterials}
                            onDelete={handleDeleteMaterial}
                            onDuplicate={handleDuplicateMaterial}
                        />
                    ))}
                </ScrollArea>
            </aside>

            <main className="flex-grow p-6 overflow-y-auto">
                {selectedMaterial ? (
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">{selectedMaterial.name}</h1>
                                <p className="text-muted-foreground">{selectedMaterial.source || 'Sumber tidak diketahui'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeTemplate && (<Button variant="ghost" size="sm" onClick={() => setActiveTemplate(null)}><XCircle className="mr-2 h-4 w-4" /> Hapus Filter Template</Button>)}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline">Terapkan Template</Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {templates.filter(t => t.material_type === selectedMaterial.material_type).map(template => (
                                            <DropdownMenuItem key={template.id} onSelect={() => setActiveTemplate(template)}>{template.template_name}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {testTabsComponent}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Package size={64} className="mb-4" />
                        <h3 className="text-xl font-semibold">Pustaka Material</h3>
                        <p className="max-w-md">Pilih material dari daftar di samping untuk melihat dan mengelola data pengujiannya. Gunakan filter dan pencarian untuk menemukan material dengan cepat.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
