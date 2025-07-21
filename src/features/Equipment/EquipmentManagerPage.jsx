// Lokasi file: src/features/Equipment/EquipmentManagerPage.jsx
// Deskripsi: Menambahkan kolom "Digunakan pada" untuk menampilkan di mana saja
// sebuah alat telah digunakan, mengimplementasikan bagian dari Rancangan Efisiensi #4.

import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useEquipment } from '../../hooks/useEquipment';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import * as api from '../../api/electronAPI'; // Impor API untuk mengambil data penggunaan

const EquipmentForm = ({ onSave, equipment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({});

    React.useEffect(() => {
        if (isOpen) {
            setFormData(equipment || {
                name: '',
                serial_number: '',
                last_calibrated_date: '',
                next_calibration_date: '',
                status: 'Terkalibrasi',
                notes: ''
            });
        }
    }, [isOpen, equipment]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const success = await onSave(formData);
        if (success) setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {equipment ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={16} /></Button>
                ) : (
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Alat</Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{equipment ? 'Edit Peralatan' : 'Tambah Peralatan Baru'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label>Nama Alat</Label>
                    <Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                    <Label>Nomor Seri</Label>
                    <Input value={formData.serial_number || ''} onChange={(e) => handleChange('serial_number', e.target.value)} />
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Terkalibrasi">Terkalibrasi</SelectItem>
                            <SelectItem value="Perlu Kalibrasi">Perlu Kalibrasi</SelectItem>
                            <SelectItem value="Rusak">Rusak</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label>Kalibrasi Terakhir</Label>
                    <Input type="date" value={formData.last_calibrated_date || ''} onChange={(e) => handleChange('last_calibrated_date', e.target.value)} />
                    <Label>Kalibrasi Berikutnya</Label>
                    <Input type="date" value={formData.next_calibration_date || ''} onChange={(e) => handleChange('next_calibration_date', e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function EquipmentManagerPage({ apiReady }) {
    const { equipment, loading, addEquipment, updateEquipment, deleteEquipment } = useEquipment(apiReady);
    const [usageData, setUsageData] = useState({});

    // Ambil semua data trial untuk mencari penggunaan alat
    React.useEffect(() => {
        if (apiReady) {
            api.getAllTrials().then(allTrials => {
                const usage = {};
                const testPromises = allTrials.map(trial => 
                    api.getTestsForTrial(trial.id).then(tests => {
                        tests.forEach(test => {
                            const inputData = JSON.parse(test.input_data_json || '{}');
                            if (inputData.equipment_id) {
                                if (!usage[inputData.equipment_id]) {
                                    usage[inputData.equipment_id] = [];
                                }
                                usage[inputData.equipment_id].push(`${trial.projectName} / ${trial.trial_name}`);
                            }
                        });
                    })
                );
                Promise.all(testPromises).then(() => setUsageData(usage));
            });
        }
    }, [apiReady, equipment]); // Refresh saat equipment berubah

    const getStatusBadge = (item) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const nextCalDate = new Date(item.next_calibration_date);
        nextCalDate.setHours(0,0,0,0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (item.status === 'Rusak') return <Badge variant="destructive">Rusak</Badge>;
        if (nextCalDate < today) return <Badge variant="destructive">Kalibrasi Terlewat</Badge>;
        if (nextCalDate <= thirtyDaysFromNow) return <Badge variant="warning">Segera Kalibrasi</Badge>;
        return <Badge variant="success">Terkalibrasi</Badge>;
    };

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen Peralatan</h1>
                <EquipmentForm onSave={addEquipment} />
            </header>
            
            <div className="flex-grow overflow-y-auto border rounded-lg">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Alat</TableHead>
                                <TableHead>Status Kalibrasi</TableHead>
                                <TableHead>Kalibrasi Berikutnya</TableHead>
                                <TableHead>Digunakan Pada</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipment.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}<br/><span className="text-xs text-muted-foreground">{item.serial_number}</span></TableCell>
                                    <TableCell>{getStatusBadge(item)}</TableCell>
                                    <TableCell>{new Date(item.next_calibration_date).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {(usageData[item.id] || []).length > 0 
                                            ? `${(usageData[item.id] || []).length} pengujian`
                                            : 'Belum digunakan'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EquipmentForm onSave={updateEquipment} equipment={item} />
                                        <SecureDeleteDialog
                                            trigger={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 size={16} /></Button>}
                                            title="Hapus Peralatan?"
                                            description={`Anda yakin ingin menghapus "${item.name}"?`}
                                            confirmationText="HAPUS"
                                            onConfirm={() => deleteEquipment(item.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
