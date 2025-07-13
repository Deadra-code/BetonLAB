// Lokasi file: src/features/Reporting/AssetManager.jsx
// Deskripsi: Komponen UI baru untuk mengelola aset gambar laporan.

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2 } from 'lucide-react';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';

export default function AssetManager() {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { notify } = useNotifier();

    const fetchAssets = useCallback(async () => {
        setIsLoading(true);
        try {
            const assetList = await api.listReportAssets();
            setAssets(assetList);
        } catch (error) {
            notify.error('Gagal memuat aset.');
        } finally {
            setIsLoading(false);
        }
    }, [notify]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleUpload = async () => {
        const filePath = await api.openImageDialog();
        if (filePath) {
            try {
                await api.saveReportAsset(filePath);
                notify.success('Aset berhasil diunggah.');
                fetchAssets();
            } catch (error) {
                notify.error(`Gagal mengunggah: ${error.message}`);
            }
        }
    };

    const handleDelete = async (path) => {
        if (window.confirm('Anda yakin ingin menghapus aset ini secara permanen?')) {
            await api.deleteReportAsset(path);
            notify.success('Aset berhasil dihapus.');
            fetchAssets();
        }
    };

    const handleCopyPath = (path) => {
        navigator.clipboard.writeText(`file://${path}`);
        notify.info('Path gambar disalin ke clipboard.');
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex-shrink-0">
                <h3 className="font-semibold text-lg">Manajemen Aset</h3>
                <p className="text-sm text-muted-foreground mb-4">Unggah dan kelola gambar untuk laporan Anda.</p>
                <Button onClick={handleUpload} className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Unggah Aset Baru
                </Button>
            </div>
            <ScrollArea className="flex-grow mt-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : assets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        <ImageIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2">Belum ada aset.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assets.map(asset => (
                            <div key={asset.path} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                <span className="text-sm truncate" title={asset.name}>{asset.name}</span>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyPath(asset.path)}><Copy size={14} /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(asset.path)}><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
