// Lokasi file: src/features/MaterialTesting/AddMaterialDialog.jsx
// Deskripsi: Menambahkan state loading untuk umpan balik visual saat menyimpan.

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react'; // Impor Loader2
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';

// --- PERBAIKAN: Dialog ini sekarang menjadi komponen default export ---
export default function AddMaterialDialog({ onMaterialAdded, material, isEditing = false, children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('fine_aggregate');
    const [source, setSource] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State untuk loading
    const { notify } = useNotifier();

    // Mengisi form jika dalam mode edit
    React.useEffect(() => {
        if (isEditing && material) {
            setName(material.name);
            setType(material.material_type);
            setSource(material.source || '');
        }
    }, [isEditing, material]);

    const handleSave = async () => {
        if (!name || !type) {
            notify.error("Nama dan Tipe material harus diisi.");
            return;
        }
        setIsLoading(true); // Mulai loading
        try {
            if (isEditing) {
                await api.updateMaterial({ ...material, name, source });
                notify.success(`Material "${name}" berhasil diperbarui.`);
            } else {
                await api.addMaterial({ name, material_type: type, source, is_blend: 0, blend_components_json: '[]' });
                notify.success(`Material "${name}" berhasil ditambahkan.`);
            }
            onMaterialAdded(); // Panggil callback untuk refresh
            setIsOpen(false);
            // Reset form hanya jika bukan mode edit
            if (!isEditing) {
                setName('');
                setSource('');
                setType('fine_aggregate');
            }
        } catch (error) {
            notify.error(`Gagal menyimpan: ${error.message}`);
        } finally {
            setIsLoading(false); // Hentikan loading
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {/* 'children' digunakan agar tombol pemicu bisa fleksibel */}
                {children || <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Material</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Material' : 'Tambah Material Baru'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Perbarui detail untuk material ini.' : 'Masukkan detail untuk material baru secara cepat.'}
                    </DialogDescription>
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
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Simpan Perubahan' : 'Simpan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
