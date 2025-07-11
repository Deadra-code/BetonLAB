import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { useTestTemplates } from '../../hooks/useTestTemplates';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Trash2, PlusCircle } from 'lucide-react';

const availableTests = {
    fine_aggregate: [
        { id: 'sieve_analysis', label: 'Analisis Saringan' },
        { id: 'specific_gravity', label: 'Berat Jenis & Penyerapan' },
        { id: 'moisture', label: 'Kadar Air' },
        { id: 'silt', label: 'Kadar Lumpur' },
        { id: 'bulk_density', label: 'Berat Isi' },
        { id: 'organic_content', label: 'Kadar Organik' },
    ],
    coarse_aggregate: [
        { id: 'sieve_analysis', label: 'Analisis Saringan' },
        { id: 'specific_gravity', label: 'Berat Jenis & Penyerapan' },
        { id: 'moisture', label: 'Kadar Air' },
        { id: 'silt', label: 'Kadar Lumpur' },
        { id: 'bulk_density', label: 'Berat Isi' },
        { id: 'los_angeles', label: 'Abrasi Los Angeles' },
    ],
};

export default function TestTemplateManager({ apiReady }) {
    const { templates, addTemplate, deleteTemplate, loading } = useTestTemplates(apiReady);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateType, setNewTemplateType] = useState('fine_aggregate');
    const [selectedTests, setSelectedTests] = useState([]);

    const handleTestSelection = (testId) => {
        setSelectedTests(prev => 
            prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
        );
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName || selectedTests.length === 0) {
            alert("Nama template dan minimal satu jenis pengujian harus dipilih.");
            return;
        }
        await addTemplate({
            template_name: newTemplateName,
            material_type: newTemplateType,
            tests: selectedTests,
        });
        setNewTemplateName('');
        setSelectedTests([]);
    };

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Kelola Template Pengujian</DialogTitle>
                <DialogDescription>
                    Buat, lihat, dan hapus template untuk mempercepat alur kerja pengujian material.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                {/* Bagian Membuat Template Baru */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Buat Template Baru</h3>
                    <div>
                        <Label htmlFor="template-name">Nama Template</Label>
                        <Input id="template-name" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Contoh: Uji Agregat Halus Lengkap" />
                    </div>
                    <div>
                        <Label>Tipe Material</Label>
                        <Select value={newTemplateType} onValueChange={setNewTemplateType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fine_aggregate">Agregat Halus</SelectItem>
                                <SelectItem value="coarse_aggregate">Agregat Kasar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Pilih Pengujian untuk Disertakan</Label>
                        <div className="space-y-2 mt-2 p-3 border rounded-md">
                            {availableTests[newTemplateType].map(test => (
                                <div key={test.id} className="flex items-center space-x-2">
                                    <Checkbox id={`cb-${test.id}`} checked={selectedTests.includes(test.id)} onCheckedChange={() => handleTestSelection(test.id)} />
                                    <Label htmlFor={`cb-${test.id}`} className="font-normal">{test.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button onClick={handleSaveTemplate}><PlusCircle className="mr-2 h-4 w-4" /> Simpan Template</Button>
                </div>

                {/* Bagian Daftar Template */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Daftar Template Tersimpan</h3>
                    <ScrollArea className="h-72">
                        <div className="space-y-2 pr-4">
                            {loading && <p>Memuat...</p>}
                            {templates.length === 0 && !loading && <p className="text-sm text-muted-foreground">Belum ada template yang dibuat.</p>}
                            {templates.map(template => (
                                <div key={template.id} className="flex justify-between items-center p-3 border rounded-md">
                                    <div>
                                        <p className="font-medium">{template.template_name}</p>
                                        <p className="text-xs text-muted-foreground">{template.material_type === 'fine_aggregate' ? 'Ag. Halus' : 'Ag. Kasar'} ({template.tests.length} pengujian)</p>
                                    </div>
                                    <Button variant="destructive" size="icon" onClick={() => deleteTemplate(template.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Tutup</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}
