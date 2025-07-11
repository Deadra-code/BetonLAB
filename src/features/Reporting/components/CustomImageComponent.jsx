// Lokasi file: src/features/Reporting/components/CustomImageComponent.jsx
// Deskripsi: Komponen untuk menampilkan gambar kustom dengan opsi bingkai.

import React from 'react';
import * as api from '../../../api/electronAPI';
import { Button } from '../../../components/ui/button';
import { Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';

const CustomImageComponent = ({ properties, onPropertyChange, instanceId }) => {
    const { src, hasFrame } = properties || {};

    const handleImageUpload = async () => {
        const filePath = await api.openImageDialog();
        if (filePath) {
            const base64 = await api.readFileAsBase64(filePath);
            if (base64) {
                onPropertyChange(instanceId, 'src', `data:image/png;base64,${base64}`);
            }
        }
    };

    if (!src) {
        return (
            <div className="p-4 text-center text-muted-foreground border-2 border-dashed flex flex-col items-center justify-center h-40">
                <p className="mb-2">Komponen Gambar</p>
                <Button onClick={handleImageUpload} size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Unggah Gambar
                </Button>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt="Gambar Kustom"
            className={cn("w-full h-auto", hasFrame && "border-4 p-1 border-gray-200")}
        />
    );
};

export default CustomImageComponent;
