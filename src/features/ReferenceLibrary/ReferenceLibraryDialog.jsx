// Lokasi file: src/features/ReferenceLibrary/ReferenceLibraryDialog.jsx
// Deskripsi: Komponen dialog modal untuk menampilkan Pustaka Referensi secara kontekstual.

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { useReferenceDocuments } from '../../hooks/useReferenceDocuments';
import { FileText, Eye, Loader2 } from 'lucide-react';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import { ScrollArea } from '../../components/ui/scroll-area';

export default function ReferenceLibraryDialog({ trigger }) {
    const [isOpen, setIsOpen] = useState(false);
    // Hook hanya akan aktif dan mengambil data ketika dialog dibuka (isOpen = true)
    const { documents, loading } = useReferenceDocuments(isOpen);
    const { notify } = useNotifier();

    const handleViewDocument = async (path) => {
        const result = await api.openPath(path);
        if (!result.success) {
            notify.error(`Gagal membuka file: ${result.error}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Pustaka Referensi Cepat</DialogTitle>
                    <DialogDescription>
                        Cari dan lihat dokumen standar tanpa meninggalkan halaman kerja Anda.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-96">
                        <div className="space-y-3 pr-4">
                            {loading && <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                            {!loading && documents.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground">Pustaka referensi kosong.</p>
                                </div>
                            )}
                            {documents.map(doc => (
                                <div key={doc.id} className="bg-muted/50 p-3 rounded-lg border flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">{doc.title}</p>
                                            <p className="text-sm text-muted-foreground">{doc.document_number || 'Tanpa Nomor'}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.file_path)}>
                                        <Eye className="mr-2 h-4 w-4" /> Lihat
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
