// src/features/Reporting/components/builder/property-panels/SpecificPanels.jsx
// Deskripsi: Berisi semua panel properti yang spesifik untuk setiap jenis komponen.

import React from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Button } from '../../../../../components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Textarea } from '../../../../../components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../components/ui/collapsible";

export const TextPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Konten Teks</Label><Textarea value={properties.content || ''} onChange={e => onPropertyChange('content', e.target.value)} placeholder="Gunakan {{nama_proyek}}..." /></div>
        <div><Label>Jenis Font</Label><Select value={properties.fontFamily || 'Arial'} onValueChange={v => onPropertyChange('fontFamily', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Arial">Arial</SelectItem><SelectItem value="Helvetica">Helvetica</SelectItem><SelectItem value="Times New Roman">Times New Roman</SelectItem></SelectContent></Select></div>
        <div className="flex gap-2 items-end">
            <div className="flex-grow"><Label>Ukuran Font (pt)</Label><Input type="number" value={properties.fontSize || 12} onChange={e => onPropertyChange('fontSize', parseInt(e.target.value))} /></div>
            <div><Input type="color" value={properties.color || '#000000'} onChange={e => onPropertyChange('color', e.target.value)} className="p-1 h-10"/></div>
        </div>
        <div><Label>Gaya Teks</Label><div className="flex gap-1 mt-1"><Button variant={properties.isBold ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('isBold', !properties.isBold)}><Bold size={16}/></Button><Button variant={properties.isItalic ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('isItalic', !properties.isItalic)}><Italic size={16}/></Button><Button variant={properties.isUnderline ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('isUnderline', !properties.isUnderline)}><Underline size={16}/></Button></div></div>
        <div><Label>Perataan</Label><div className="flex gap-1 mt-1"><Button variant={properties.align === 'left' ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('align', 'left')}><AlignLeft size={16}/></Button><Button variant={properties.align === 'center' ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('align', 'center')}><AlignCenter size={16}/></Button><Button variant={properties.align === 'right' ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('align', 'right')}><AlignRight size={16}/></Button><Button variant={properties.align === 'justify' ? "secondary" : "outline"} size="icon" onClick={() => onPropertyChange('align', 'justify')}><AlignJustify size={16}/></Button></div></div>
    </div>
);

export const ColumnsPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div>
            <Label>Jumlah Kolom</Label>
            <Input type="number" min="1" max="4" value={properties.columnCount || 2} onChange={e => onPropertyChange('columnCount', parseInt(e.target.value))} />
            <p className="text-xs text-muted-foreground mt-1">Ubah antara 1 hingga 4 kolom.</p>
        </div>
    </div>
);

export const JmdTablePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Judul Tabel</Label><Input value={properties.title || ''} onChange={e => onPropertyChange('title', e.target.value)} /></div>
        <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2"><Checkbox id="show-ssd" checked={properties.showSsd ?? true} onCheckedChange={c => onPropertyChange('showSsd', c)} /><Label htmlFor="show-ssd">Tampilkan Tabel Proporsi SSD</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="show-corrected" checked={properties.showCorrected ?? true} onCheckedChange={c => onPropertyChange('showCorrected', c)} /><Label htmlFor="show-corrected">Tampilkan Tabel Proporsi Koreksi</Label></div>
        </div>
        <GenericTablePanel properties={properties} onPropertyChange={onPropertyChange} />
    </div>
);

export const GenericTablePanel = ({ properties, onPropertyChange }) => (
    <Collapsible>
        <CollapsibleTrigger className="font-semibold text-sm w-full text-left">Styling Tabel</CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
            <div><Label>Warna Latar Header</Label><Input type="color" value={properties.headerBgColor || '#E5E7EB'} onChange={e => onPropertyChange('headerBgColor', e.target.value)} className="p-1 h-10 w-full" /></div>
            <div><Label>Warna Teks Header</Label><Input type="color" value={properties.headerTextColor || '#111827'} onChange={e => onPropertyChange('headerTextColor', e.target.value)} className="p-1 h-10 w-full" /></div>
            <div><Label>Warna Border</Label><Input type="color" value={properties.borderColor || '#9CA3AF'} onChange={e => onPropertyChange('borderColor', e.target.value)} className="p-1 h-10 w-full" /></div>
            <div><Label>Tebal Border (px)</Label><Input type="number" value={properties.borderWidth ?? 1} onChange={e => onPropertyChange('borderWidth', parseInt(e.target.value))} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="zebra" checked={properties.isZebra ?? false} onCheckedChange={c => onPropertyChange('isZebra', c)} /><Label htmlFor="zebra">Gunakan Warna Baris Selang-seling</Label></div>
        </CollapsibleContent>
    </Collapsible>
);

export const GenericChartPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Judul Grafik</Label><Input value={properties.title || ''} onChange={e => onPropertyChange('title', e.target.value)} /></div>
        <div><Label>Sub-judul</Label><Input value={properties.subtitle || ''} onChange={e => onPropertyChange('subtitle', e.target.value)} /></div>
        <div className="flex items-center space-x-2"><Checkbox id="showLegend" checked={properties.showLegend ?? true} onCheckedChange={c => onPropertyChange('showLegend', c)} /><Label htmlFor="showLegend">Tampilkan Legenda</Label></div>
        <div className="flex items-center space-x-2"><Checkbox id="showGrid" checked={properties.showGrid ?? true} onCheckedChange={c => onPropertyChange('showGrid', c)} /><Label htmlFor="showGrid">Tampilkan Grid Latar</Label></div>
        <div className="flex items-center space-x-2"><Checkbox id="showDataLabels" checked={properties.showDataLabels ?? false} onCheckedChange={c => onPropertyChange('showDataLabels', c)} /><Label htmlFor="showDataLabels">Tampilkan Label Nilai</Label></div>
        <div><Label>Warna Garis Utama</Label><Input type="color" value={properties.lineColor || '#16a34a'} onChange={e => onPropertyChange('lineColor', e.target.value)} className="p-1 h-10 w-full" /></div>
        <Collapsible><CollapsibleTrigger className="font-semibold text-sm w-full text-left">Styling Sumbu</CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
                <div><Label>Ukuran Font Sumbu (px)</Label><Input type="number" value={properties.axisFontSize || 10} onChange={e => onPropertyChange('axisFontSize', parseInt(e.target.value))} /></div>
                <div><Label>Warna Teks Sumbu</Label><Input type="color" value={properties.axisColor || '#666666'} onChange={e => onPropertyChange('axisColor', e.target.value)} className="p-1 h-10 w-full" /></div>
            </CollapsibleContent>
        </Collapsible>
    </div>
);

export const SignaturePanel = ({ properties, onPropertyChange }) => {
    const sigCols = Array.from({ length: properties.columnCount || 2 }, (_, i) => i);
    return (
        <div className="space-y-3">
            <div><Label>Ukuran Font Global (pt)</Label><Input type="number" value={properties.fontSize || 10} onChange={e => onPropertyChange('fontSize', parseInt(e.target.value))} /></div>
            <div><Label>Spasi Vertikal (px)</Label><Input type="number" value={properties.verticalSpacing || 48} onChange={e => onPropertyChange('verticalSpacing', parseInt(e.target.value))} /></div>
            <hr/>
            <div><Label>Jumlah Kolom</Label><Input type="number" min="1" max="4" value={properties.columnCount || 2} onChange={e => onPropertyChange('columnCount', parseInt(e.target.value))} /></div>
            {sigCols.map(i => (
                <div key={i} className="p-2 border rounded-md space-y-2">
                    <h4 className="font-medium text-sm">Kolom #{i + 1}</h4>
                    <div><Label>Label</Label><Input value={properties[`label${i+1}`] || ''} onChange={e => onPropertyChange(`label${i+1}`, e.target.value)} /></div>
                    <div><Label>Nama</Label><Input value={properties[`name${i+1}`] || ''} onChange={e => onPropertyChange(`name${i+1}`, e.target.value)} /></div>
                    <div><Label>Jabatan</Label><Input value={properties[`position${i+1}`] || ''} onChange={e => onPropertyChange(`position${i+1}`, e.target.value)} /></div>
                </div>
            ))}
        </div>
    );
};

export const CustomTablePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div className="flex items-center space-x-2"><Checkbox id="isHeaderFirstRow" checked={properties.isHeaderFirstRow ?? true} onCheckedChange={c => onPropertyChange('isHeaderFirstRow', c)} /><Label htmlFor="isHeaderFirstRow">Baris pertama adalah Header</Label></div>
        <hr/>
        <p className="text-xs text-muted-foreground">Gunakan tab "Tampilan" untuk mengatur gaya tabel.</p>
    </div>
);
