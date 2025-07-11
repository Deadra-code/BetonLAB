import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, Package, Waves, Component, Beaker } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { cn } from '../../lib/utils';

// Form untuk menambah/mengedit material
const MaterialForm = ({ material, onSave, onCancel }) => {
    const [formData, setFormData] = useState(material || {
        material_type: 'cement',
        name: '',
        properties: { sg: 3.15, absorption: 0, moisture: 0, dryRoddedWeight: 0 }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePropertyChange = (field, value) => {
        setFormData(prev => ({ ...prev, properties: { ...prev.properties, [field]: parseFloat(value) || 0 } }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const type = formData.material_type;

    return (
        <div>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Tipe</Label>
                    <Select value={formData.material_type} onValueChange={(v) => handleChange('material_type', v)} disabled={!!material}>
                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cement">Semen</SelectItem>
                            <SelectItem value="fine_aggregate">Agregat Halus</SelectItem>
                            <SelectItem value="coarse_aggregate">Agregat Kasar</SelectItem>
                            <SelectItem value="admixture">Admixture</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nama</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3" />
                </div>
                
                {/* Properti Spesifik per Tipe */}
                <h4 className="col-span-4 font-semibold text-sm mt-4 border-b pb-1">Properti</h4>
                
                {(type === 'cement' || type.includes('aggregate')) && (
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sg" className="text-right">Berat Jenis (SSD)</Label>
                        <Input id="sg" type="number" value={formData.properties.sg} onChange={(e) => handlePropertyChange('sg', e.target.value)} className="col-span-3" />
                    </div>
                )}
                {type.includes('aggregate') && (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="absorption" className="text-right">Penyerapan (%)</Label>
                            <Input id="absorption" type="number" value={formData.properties.absorption} onChange={(e) => handlePropertyChange('absorption', e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="moisture" className="text-right">Kadar Air (%)</Label>
                            <Input id="moisture" type="number" value={formData.properties.moisture} onChange={(e) => handlePropertyChange('moisture', e.target.value)} className="col-span-3" />
                        </div>
                    </>
                )}
                {type === 'coarse_aggregate' && (
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dryRoddedWeight" className="text-right">Berat Isi (kg/m³)</Label>
                        <Input id="dryRoddedWeight" type="number" value={formData.properties.dryRoddedWeight} onChange={(e) => handlePropertyChange('dryRoddedWeight', e.target.value)} className="col-span-3" />
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={onCancel}>Batal</Button>
                <Button type="button" onClick={handleSubmit}>Simpan</Button>
            </DialogFooter>
        </div>
    );
};


// Komponen Utama Material Manager
const MaterialManager = ({ materials, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);

    const handleAddNew = () => {
        setEditingMaterial(null);
        setIsModalOpen(true);
    };

    const handleEdit = (material) => {
        setEditingMaterial(material);
        setIsModalOpen(true);
    };
    
    const handleSave = async (materialData) => {
        if (editingMaterial) {
            await onUpdate({ ...editingMaterial, ...materialData });
        } else {
            await onAdd(materialData);
        }
        setIsModalOpen(false);
        setEditingMaterial(null);
    };

    const renderIcon = (type) => {
        switch(type) {
            case 'cement': return <Package className="h-5 w-5 text-gray-500" />;
            case 'fine_aggregate': return <Waves className="h-5 w-5 text-yellow-500" />;
            case 'coarse_aggregate': return <Component className="h-5 w-5 text-indigo-500" />;
            case 'admixture': return <Beaker className="h-5 w-5 text-green-500" />;
            default: return null;
        }
    }

    const materialGroups = materials.reduce((acc, mat) => {
        (acc[mat.material_type] = acc[mat.material_type] || []).push(mat);
        return acc;
    }, {});

    const groupTitles = {
        cement: 'Semen',
        coarse_aggregate: 'Agregat Kasar (Kerikil)',
        fine_aggregate: 'Agregat Halus (Pasir)',
        admixture: 'Admixture'
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Pustaka Material</h2>
                <Button onClick={handleAddNew}><PlusCircle size={18} className="mr-2" /> Tambah Material</Button>
            </header>
            
            <div className="flex-grow overflow-y-auto pr-4">
                {Object.keys(groupTitles).map(groupKey => (
                    materialGroups[groupKey] && (
                        <div key={groupKey} className="mb-8">
                            <h3 className="text-lg font-semibold border-b pb-2 mb-3">{groupTitles[groupKey]}</h3>
                            <div className="space-y-2">
                                {materialGroups[groupKey].map(material => (
                                    <div key={material.id} className="bg-card p-3 rounded-lg border flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {renderIcon(material.material_type)}
                                            <span className="font-medium">{material.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(material)}><Edit size={16} /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(material.id)}><Trash2 size={16} /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMaterial ? 'Edit Material' : 'Tambah Material Baru'}</DialogTitle>
                        <DialogDescription>
                            Masukkan detail untuk material. Tipe tidak dapat diubah setelah dibuat.
                        </DialogDescription>
                    </DialogHeader>
                    <MaterialForm 
                        material={editingMaterial} 
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MaterialManager;
