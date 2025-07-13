// Lokasi file: src/features/ReferenceLibrary/ReferenceLibraryManager.js
// Deskripsi: Disesuaikan untuk menggunakan hook yang telah diperbarui.

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from '../../components/ui/dialog';
import { useReferenceDocuments } from '../../hooks/useReferenceDocuments';
import { PlusCircle, Trash2, FileText, Upload, Eye } from 'lucide-react';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';

const AddDocumentForm = ({ onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [docNumber, setDocNumber] = useState('');
    const [filePath, setFilePath] = useState('');
    const [fileName, setFileName] = useState('');
    const { notify } = useNotifier();

    const handleFileSelect = async () => {
        const selectedPath = await api.openPdfDialog();
        if (selectedPath) {
            setFilePath(selectedPath);
            setFileName(selectedPath.split('\\').pop().split('/').pop());
        }
    };

    const handleSave = async () => {
        if (!title || !filePath) {
            notify.error("Judul dan file PDF harus diisi.");
            return;
        }
        
        try {
            const savedPath = await api.saveReferencePdf(filePath);
            await onSave({
                title,
                document_number: docNumber,
                file_path: savedPath,
            });
            setIsOpen(false);
            setTitle('');
            setDocNumber('');
            setFilePath('');
            setFileName('');
        } catch (error) {
            notify.error("Gagal menyimpan file referensi.");
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Dokumen</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Dokumen Referensi Baru</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="doc-title">Judul Dokumen</Label>
                    <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Tata Cara Pembuatan Rencana Campuran Beton Normal" />
                    <Label htmlFor="doc-number">Nomor Dokumen (Opsional)</Label>
                    <Input id="doc-number" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="Contoh: SNI 03-2834-2000" />
                    <Label>File PDF</Label>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleFileSelect}><Upload className="mr-2 h-4 w-4" /> Pilih File</Button>
                        {fileName && <span className="text-sm text-muted-foreground truncate">{fileName}</span>}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ReferenceLibraryManager({ apiReady }) {
    // PERUBAHAN: Memanggil hook dengan flag 'true' secara eksplisit karena ini adalah halaman utama.
    const { documents, loading, addDocument, deleteDocument } = useReferenceDocuments(apiReady);
    const { notify } = useNotifier();

    const handleViewDocument = async (path) => {
        const result = await api.openPath(path);
        if (!result.success) {
            notify.error(`Gagal membuka file: ${result.error}`);
        }
    };

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Pustaka Referensi</h1>
                <AddDocumentForm onSave={addDocument} />
            </header>
            
            <div className="flex-grow overflow-y-auto pr-4">
                {loading && <p>Memuat dokumen...</p>}
                {!loading && documents.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg">
                        <FileText className="mx-auto h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Pustaka Kosong</h3>
                        <p className="text-muted-foreground text-sm">Klik "Tambah Dokumen" untuk mengunggah file SNI pertama Anda.</p>
                    </div>
                )}
                <div className="space-y-3">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-card p-4 rounded-lg border flex items-center justify-between hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <FileText className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold">{doc.title}</p>
                                    <p className="text-sm text-muted-foreground">{doc.document_number || 'Tanpa Nomor'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.file_path)}>
                                    <Eye className="mr-2 h-4 w-4" /> Lihat
                                </Button>
                                <SecureDeleteDialog
                                    trigger={<Button variant="destructive" size="icon" className="h-9 w-9"><Trash2 size={16} /></Button>}
                                    title="Hapus Dokumen?"
                                    description={`Aksi ini akan menghapus dokumen "${doc.title}" secara permanen dari aplikasi dan dari disk. Aksi ini tidak dapat dibatalkan.`}
                                    confirmationText="HAPUS"
                                    onConfirm={() => deleteDocument(doc.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
