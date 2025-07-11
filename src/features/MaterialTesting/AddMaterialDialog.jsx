// Lokasi file: src/features/MaterialTesting/AddMaterialDialog.jsx
// Deskripsi: Dialog modal untuk menambah material baru secara cepat.

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PlusCircle } from 'lucide-react';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';

export default function AddMaterialDialog({ onMaterialAdded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('fine_aggregate');
    const [source, setSource] = useState('');
    const { notify } = useNotifier();

    const handleSave = async () => {
        if (!name || !type) {
            notify.error("Nama dan Tipe material harus diisi.");
            return;
        }
        try {
            const newMaterial = await api.addMaterial({ name, material_type: type, source, is_blend: 0, blend_components_json: '[]' });
            notify.success(`Material "${name}" berhasil ditambahkan.`);
            onMaterialAdded(newMaterial); // Panggil callback untuk memberitahu parent
            setIsOpen(false);
            setName('');
            setSource('');
        } catch (error) {
            notify.error(`Gagal menyimpan material: ${error.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Material Baru</DialogTitle>
                    <DialogDescription>Masukkan detail untuk material baru secara cepat.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label>Nama Material</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Pasir Lumajang"/>
                    <Label>Tipe Material</Label>
                    <Select value={type} onValueChange={setType}>
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
}
