// Lokasi file: src/features/Reporting/components/CustomImageComponent.jsx
// Deskripsi: Komponen gambar dengan kontrol ukuran dan posisi.

import React from 'react';
import * as api from '../../../api/electronAPI';
import { Button } from '../../../components/ui/button';
import { Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';

const CustomImageComponent = ({ properties, onPropertyChange, instanceId }) => {
    // Ekstrak properti dengan nilai default
    const {
        src,
        hasFrame,
        maxWidth = 100, // dalam persen
        align = 'center' // left, center, right
    } = properties || {};

    const handleImageUpload = async () => {
        const filePath = await api.openImageDialog();
        if (filePath) {
            const base64 = await api.readFileAsBase64(filePath);
            if (base64) {
                onPropertyChange(instanceId, 'src', `data:image/png;base64,${base64}`);
            }
        }
    };

    // Wadah untuk mengatur perataan
    const wrapperStyle = {
        display: 'flex',
        justifyContent: align,
    };

    // Gaya untuk gambar itu sendiri
    const imageStyle = {
        maxWidth: `${maxWidth}%`,
        height: 'auto',
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
        <div style={wrapperStyle}>
            <img
                src={src}
                alt="Gambar Kustom"
                style={imageStyle}
                className={cn(hasFrame && "border-4 p-1 border-gray-200")}
            />
        </div>
    );
};

export default CustomImageComponent;
