import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PlusCircle, Beaker, Component, Waves, Package, FlaskConical, Microscope, Scale, ShieldCheck, Combine, Trash2, Pencil, ClipboardList, XCircle, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useNotifier } from '../../hooks/useNotifier';

import { useMaterials } from '../../hooks/useMaterials';
import { useMaterialTests } from '../../hooks/useMaterialTests';
import { useTestTemplates } from '../../hooks/useTestTemplates';

import SieveAnalysisTest from './SieveAnalysisTest';
import SpecificGravityTest from './SpecificGravityTest';
import MoistureContentTest from './MoistureContentTest';
import SiltContentTest from './SiltContentTest';
import BulkDensityTest from './BulkDensityTest';
import LosAngelesAbrasionTest from './LosAngelesAbrasionTest';
import OrganicContentTest from './OrganicContentTest';
import AggregateBlending from './AggregateBlending';
import TestTemplateManager from './TestTemplateManager';

// --- Edit/Add Material Form (No changes here) ---
const MaterialForm = ({ material, onSave, onCancel, children }) => {
    const [name, setName] = useState(material?.name || '');
    const [type, setType] = useState(material?.material_type || 'fine_aggregate');
    const [source, setSource] = useState(material?.source || '');
    const [isOpen, setIsOpen] = useState(false);
    const isEditing = !!material?.id;

    const handleSave = async () => {
        if (!name || !type) { alert("Nama dan Tipe material harus diisi."); return; }
        const payload = isEditing ? { id: material.id, name, source } : { name, material_type: type, source, is_blend: 0, blend_components_json: '[]' };
        const success = await onSave(payload);
        if (success) {
            if (!isEditing) { setName(''); setSource(''); }
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Material' : 'Tambah Material Baru'}</DialogTitle>
                    <DialogDescription>{isEditing ? 'Ubah nama atau sumber material.' : 'Masukkan detail untuk material baru.'}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label>Nama Material</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Pasir Lumajang"/>
                    <Label>Tipe Material</Label>
                    <Select value={type} onValueChange={setType} disabled={isEditing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fine_aggregate">Agregat Halus</SelectItem>
                            <SelectItem value="coarse_aggregate">Agregat Kasar</SelectItem>
                            <SelectItem value="cement">Semen</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label>Sumber</Label>
                    <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Opsional: Nama Quarry/Vendor"/>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// Komponen Utama
export default function MaterialTestingManager({ apiReady }) {
    const { materials, addMaterial, updateMaterial, deleteMaterial, materialError, refreshMaterials } = useMaterials(apiReady);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const { tests, addTest, setActiveTest } = useMaterialTests(selectedMaterial?.id);
    const { templates } = useTestTemplates(apiReady);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const { notify } = useNotifier();

    const handleSaveBlend = async (blendedMaterial) => {
        const success = await addMaterial(blendedMaterial);
        if (success) refreshMaterials();
        return success;
    };

    const handleDeleteMaterial = (id) => {
        deleteMaterial(id);
        if (selectedMaterial?.id === id) {
            setSelectedMaterial(null);
        }
    };
    
    // PEMANTAPAN: Fungsi untuk duplikasi material
    const handleDuplicateMaterial = (e, material) => {
        e.stopPropagation(); // Mencegah event klik menyeleksi material
        const newMaterial = {
            ...material,
            name: `${material.name} (Salinan)`,
        };
        delete newMaterial.id; // Hapus ID agar menjadi material baru
        delete newMaterial.active_tests; // Hapus properti yang tidak relevan
        delete newMaterial.is_active_for_design;

        addMaterial(newMaterial);
        notify.info(`Material "${material.name}" telah diduplikasi.`);
    };

    const handleSelectMaterial = (material) => {
        setSelectedMaterial(material);
        setActiveTemplate(null); // Reset template filter saat ganti material
    };

    const getIcon = (type, isBlend) => {
        if (isBlend) return <Combine className="mr-2 h-4 w-4 text-purple-500" />;
        const icons = { fine_aggregate: <Waves className="mr-2 h-4 w-4 text-yellow-500" />, coarse_aggregate: <Component className="mr-2 h-4 w-4 text-blue-500" />, cement: <Package className="mr-2 h-4 w-4 text-gray-500" />, };
        return icons[type] || null;
    }

    const testTabsComponent = useMemo(() => {
        if (!selectedMaterial) return null;
        
        if (selectedMaterial.is_blend) {
            const components = JSON.parse(selectedMaterial.blend_components_json || '[]' );
            const componentDetails = components.map(c => { const mat = materials.find(m => m.id === c.id); return `${c.ratio}% ${mat ? mat.name : 'Material Dihapus'}`; }).join(' + ');
            return ( <div className="mt-4 p-4 bg-muted/50 rounded-lg border"> <h3 className="font-semibold text-lg">Detail Material Campuran</h3> <p className="text-muted-foreground">Material ini adalah hasil campuran dan tidak dapat diuji secara langsung.</p> <p className="mt-2 font-medium">{componentDetails}</p> </div> )
        }

        const allPossibleTests = [
            { value: "sieve_analysis", label: "Analisis Saringan", icon: <FlaskConical className="mr-2 h-4 w-4"/>, component: <SieveAnalysisTest material={selectedMaterial} tests={tests.filter(t => t.test_type === 'sieve_analysis')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate'] },
            { value: "specific_gravity", label: "Berat Jenis", icon: <Scale className="mr-2 h-4 w-4"/>, component: <SpecificGravityTest tests={tests.filter(t => t.test_type === 'specific_gravity')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate', 'cement'] },
            { value: "moisture", label: "Kadar Air", icon: <Beaker className="mr-2 h-4 w-4"/>, component: <MoistureContentTest tests={tests.filter(t => t.test_type === 'moisture')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate'] },
            { value: "silt", label: "Kadar Lumpur", icon: <Microscope className="mr-2 h-4 w-4"/>, component: <SiltContentTest tests={tests.filter(t => t.test_type === 'silt')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate'] },
            { value: "bulk_density", label: "Berat Isi", icon: <ShieldCheck className="mr-2 h-4 w-4"/>, component: <BulkDensityTest tests={tests.filter(t => t.test_type === 'bulk_density')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate', 'coarse_aggregate'] },
            { value: "organic_content", label: "Kadar Organik", icon: <FlaskConical className="mr-2 h-4 w-4"/>, component: <OrganicContentTest tests={tests.filter(t => t.test_type === 'organic_content')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['fine_aggregate'] },
            { value: "los_angeles", label: "Abrasi Los Angeles", icon: <ShieldCheck className="mr-2 h-4 w-4"/>, component: <LosAngelesAbrasionTest tests={tests.filter(t => t.test_type === 'los_angeles')} onAddTest={addTest} onSetActive={setActiveTest} />, types: ['coarse_aggregate'] },
        ];
        
        let availableTests = allPossibleTests.filter(test => test.types.includes(selectedMaterial.material_type));
        
        if (activeTemplate) {
            const templateTests = JSON.parse(activeTemplate.tests_json || '[]');
            availableTests = availableTests.filter(test => templateTests.includes(test.value));
        }
        
        if (availableTests.length === 0) return <p className="text-muted-foreground mt-4">Tidak ada jenis pengujian yang tersedia untuk tipe material atau template ini.</p>

        return ( <Tabs defaultValue={availableTests[0].value} className="w-full mt-4"> <TabsList className="h-auto flex-wrap justify-start"> {availableTests.map(tab => <TabsTrigger key={tab.value} value={tab.value} className="flex items-center">{tab.icon}{tab.label}</TabsTrigger>)} </TabsList> {availableTests.map(tab => <TabsContent key={tab.value} value={tab.value} className="mt-4">{tab.component}</TabsContent>)} </Tabs> )
    }, [selectedMaterial, tests, materials, addTest, setActiveTest, activeTemplate]);


    return (
        <div className="flex h-full bg-muted/20">
            <aside className="w-80 border-r p-4 overflow-y-auto bg-card flex flex-col">
                <h2 className="text-lg font-bold mb-4 px-2">Pustaka Material</h2>
                <div className="px-2 mb-4 space-y-2">
                    <MaterialForm onSave={addMaterial}>
                        <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Tambah Material</Button>
                    </MaterialForm>
                    <AggregateBlending materials={materials} onSave={handleSaveBlend} apiReady={apiReady} />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full"><ClipboardList className="mr-2 h-4 w-4" /> Kelola Template</Button>
                        </DialogTrigger>
                        <TestTemplateManager apiReady={apiReady} />
                    </Dialog>
                    {materialError && <p className="text-sm text-destructive mt-2">{materialError}</p>}
                </div>
                <div className="flex-grow space-y-1">
                    {materials.map(mat => (
                        <div key={mat.id} onClick={() => handleSelectMaterial(mat)} className={`group p-2 rounded-md cursor-pointer flex justify-between items-center text-sm font-medium ${selectedMaterial?.id === mat.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
                            <div className="flex items-center">
                                {getIcon(mat.material_type, mat.is_blend)} {mat.name}
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100">
                                {/* PEMANTAPAN: Tombol Duplikasi Material */}
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDuplicateMaterial(e, mat)}>
                                    <Copy size={14}/>
                                </Button>
                                <MaterialForm material={mat} onSave={updateMaterial}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}><Pencil size={14}/></Button>
                                </MaterialForm>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 size={14}/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Hapus Material?</AlertDialogTitle><AlertDialogDescription>Aksi ini akan menghapus "{mat.name}" dan semua data pengujian terkait secara permanen.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteMaterial(mat.id)}>Hapus</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
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
                                {activeTemplate && (
                                    <Button variant="ghost" size="sm" onClick={() => setActiveTemplate(null)}>
                                        <XCircle className="mr-2 h-4 w-4" /> Hapus Filter Template
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Terapkan Template</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {templates.filter(t => t.material_type === selectedMaterial.material_type).map(template => (
                                            <DropdownMenuItem key={template.id} onSelect={() => setActiveTemplate(template)}>
                                                {template.template_name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        {testTabsComponent}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground text-center">Pilih material dari daftar untuk melihat detail.<br/>Jika daftar kosong, tambahkan material baru atau buat campuran.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
