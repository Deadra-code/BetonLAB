import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Loader2, Beaker, Upload, Image as ImageIcon, X } from 'lucide-react';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';

// Form untuk menambah data uji baru
const TestForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [colorResult, setColorResult] = useState('lebih_muda');
    const [imagePath, setImagePath] = useState(null); // Path file asli
    const [imageBase64, setImageBase64] = useState(null); // Untuk preview
    const { notify } = useNotifier();

    const conclusion = {
        'lebih_muda': 'Memenuhi syarat',
        'setara': 'Memenuhi syarat',
        'lebih_tua': 'Tidak memenuhi syarat, perlu uji lanjut',
    };

    const resetForm = () => {
        setColorResult('lebih_muda');
        setImagePath(null);
        setImageBase64(null);
        setTestDate(new Date().toISOString().split('T')[0]);
    };

    const handleImageUpload = async () => {
        const selectedPath = await api.openImageDialog();
        if (selectedPath) {
            setImagePath(selectedPath);
            const base64 = await api.readFileAsBase64(selectedPath);
            setImageBase64(base64);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        let savedImagePath = null;
        try {
            if (imagePath) {
                savedImagePath = await api.saveTestImageFile(imagePath);
            }
            await onSave({
                test_type: 'organic_content',
                test_date: testDate,
                input_data_json: JSON.stringify({ color_comparison: colorResult }),
                result_data_json: JSON.stringify({ conclusion: conclusion[colorResult] }),
                image_path: savedImagePath, // Kirim path yang sudah disimpan
            });
            setIsOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save Organic Content test:", error);
            notify.error("Gagal menyimpan pengujian.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
                <Button>Uji Baru</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Pengujian Kadar Organik Baru</DialogTitle>
                    <DialogDescription>
                        Pilih hasil perbandingan warna dan unggah foto jika ada.
                    </DialogDescription>
                </DialogHeader>
                {/* PERBAIKAN: Menambahkan max-h-[70vh] dan overflow-y-auto untuk membuat konten dapat di-scroll */}
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div>
                        <Label>Tanggal Uji</Label>
                        <Input type="date" value={testDate} onChange={e => setTestDate(e.target.value)} />
                    </div>
                    <div>
                        <Label>Hasil Perbandingan Warna</Label>
                        <Select value={colorResult} onValueChange={setColorResult}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lebih_muda">Warna lebih muda dari standar</SelectItem>
                                <SelectItem value="setara">Warna setara standar No. 3</SelectItem>
                                <SelectItem value="lebih_tua">Warna lebih tua dari standar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Foto Hasil Uji (Opsional)</Label>
                        {imageBase64 ? (
                            <div className="mt-2 relative">
                                <img src={`data:image/png;base64,${imageBase64}`} alt="Preview" className="w-full h-auto rounded-md border" />
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => { setImagePath(null); setImageBase64(null); }}>
                                    <X size={16} />
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" className="w-full mt-2" onClick={handleImageUpload}>
                                <Upload size={16} className="mr-2" /> Unggah Foto
                            </Button>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold">Kesimpulan</h4>
                        <p>{conclusion[colorResult]}</p>
                    </div>
                </div>
                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Simpan Hasil
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Komponen untuk menampilkan gambar di dialog
const ImageViewer = ({ trigger, imagePath }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [base64, setBase64] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadImage = async () => {
        if (imagePath && !base64) {
            setLoading(true);
            const data = await api.readFileAsBase64(imagePath);
            setBase64(data);
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={loadImage}>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Foto Hasil Pengujian</DialogTitle>
                </DialogHeader>
                <div className="py-4 flex justify-center items-center min-h-[300px]">
                    {loading && <Loader2 className="h-8 w-8 animate-spin" />}
                    {!loading && base64 && <img src={`data:image/png;base64,${base64}`} alt="Hasil Uji" className="max-w-full max-h-[70vh] rounded-md" />}
                    {!loading && !base64 && <p>Gagal memuat gambar.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Komponen utama
export default function OrganicContentTest({ tests, onAddTest, onSetActive }) {
    return (
        <div className="p-4 border rounded-lg mt-4 bg-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Riwayat Pengujian Kadar Organik</h3>
                <TestForm onSave={onAddTest} />
            </div>
            {tests.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Beaker className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h4 className="mt-4 text-lg font-semibold">Belum Ada Data Pengujian</h4>
                    <p className="text-muted-foreground text-sm">Klik "Uji Baru" untuk menambahkan data pengujian kadar organik pertama Anda.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal Uji</TableHead>
                            <TableHead>Hasil</TableHead>
                            <TableHead>Kesimpulan</TableHead>
                            <TableHead>Foto</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                            <TableRow key={test.id}>
                                <TableCell>{new Date(test.test_date).toLocaleDateString()}</TableCell>
                                <TableCell>{test.input_data.color_comparison?.replace(/_/g, ' ')}</TableCell>
                                <TableCell>{test.result_data.conclusion}</TableCell>
                                <TableCell>
                                    {test.image_path ? (
                                        <ImageViewer imagePath={test.image_path} trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><ImageIcon size={16} /></Button>
                                        } />
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell>{test.is_active_for_design ? <span className="text-green-600 font-bold">Aktif</span> : 'Non-aktif'}</TableCell>
                                <TableCell>
                                    <Button onClick={() => onSetActive({ testType: 'organic_content', testId: test.id })}
                                            disabled={!!test.is_active_for_design} variant="outline">
                                        Jadikan Aktif
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
