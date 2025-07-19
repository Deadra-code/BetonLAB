// src/features/Reporting/components/builder/property-panels/SpecificPanels.jsx
// Deskripsi: Berisi semua panel properti yang spesifik untuk setiap jenis komponen.
// Diperbarui sesuai rancangan terakhir.

import React from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Button } from '../../../../../components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Textarea } from '../../../../../components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../components/ui/collapsible";
import { ALL_PLACEHOLDERS } from '../../../../../utils/reporting/reportUtils';

// Panel yang sudah ada (Text, Columns, JMD, GenericTable, GenericChart, Signature)
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

// Panel-panel baru berdasarkan rancangan
export const HeaderPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Tata Letak</Label><Select value={properties.layout} onValueChange={v => onPropertyChange('layout', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Logo Kiri</SelectItem><SelectItem value="top">Logo Atas</SelectItem></SelectContent></Select></div>
        <div><Label>Ukuran Logo (px)</Label><Input type="number" value={properties.logoSize} onChange={e => onPropertyChange('logoSize', parseInt(e.target.value))} /></div>
        <div><Label>Ukuran Font Judul (pt)</Label><Input type="number" value={properties.companyNameSize} onChange={e => onPropertyChange('companyNameSize', parseInt(e.target.value))} /></div>
        <div><Label>Warna Font Judul</Label><Input type="color" value={properties.companyNameColor} onChange={e => onPropertyChange('companyNameColor', e.target.value)} className="p-1 h-10 w-full" /></div>
        <div><Label>Ukuran Font Subjudul (pt)</Label><Input type="number" value={properties.subtitleSize} onChange={e => onPropertyChange('subtitleSize', parseInt(e.target.value))} /></div>
        <div><Label>Warna Font Subjudul</Label><Input type="color" value={properties.subtitleColor} onChange={e => onPropertyChange('subtitleColor', e.target.value)} className="p-1 h-10 w-full" /></div>
    </div>
);

export const InfoBlockPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div className="flex items-center space-x-2"><Checkbox id="showBorder" checked={properties.showBorder} onCheckedChange={c => onPropertyChange('showBorder', c)} /><Label htmlFor="showBorder">Tampilkan Border</Label></div>
        <div><Label>Jumlah Kolom</Label><Select value={String(properties.columnCount)} onValueChange={v => onPropertyChange('columnCount', parseInt(v))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent></Select></div>
        <Collapsible defaultOpen><CollapsibleTrigger className="font-semibold text-sm w-full text-left">Styling Label</CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
                <div><Label>Ukuran Font (pt)</Label><Input type="number" value={properties.labelStyling?.fontSize} onChange={e => onPropertyChange('labelStyling.fontSize', parseInt(e.target.value))} /></div>
                <div><Label>Warna Font</Label><Input type="color" value={properties.labelStyling?.color} onChange={e => onPropertyChange('labelStyling.color', e.target.value)} className="p-1 h-10 w-full" /></div>
                <div className="flex items-center space-x-2"><Checkbox id="labelBold" checked={properties.labelStyling?.isBold} onCheckedChange={c => onPropertyChange('labelStyling.isBold', c)} /><Label htmlFor="labelBold">Teks Tebal</Label></div>
            </CollapsibleContent>
        </Collapsible>
        <Collapsible defaultOpen><CollapsibleTrigger className="font-semibold text-sm w-full text-left">Styling Nilai</CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
                <div><Label>Ukuran Font (pt)</Label><Input type="number" value={properties.valueStyling?.fontSize} onChange={e => onPropertyChange('valueStyling.fontSize', parseInt(e.target.value))} /></div>
                <div><Label>Warna Font</Label><Input type="color" value={properties.valueStyling?.color} onChange={e => onPropertyChange('valueStyling.color', e.target.value)} className="p-1 h-10 w-full" /></div>
                <div className="flex items-center space-x-2"><Checkbox id="valueBold" checked={properties.valueStyling?.isBold} onCheckedChange={c => onPropertyChange('valueStyling.isBold', c)} /><Label htmlFor="valueBold">Teks Tebal</Label></div>
            </CollapsibleContent>
        </Collapsible>
    </div>
);

export const RawStrengthTablePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Judul Tabel</Label><Input value={properties.title} onChange={e => onPropertyChange('title', e.target.value)} /></div>
        <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2"><Checkbox id="showId" checked={properties.showId} onCheckedChange={c => onPropertyChange('showId', c)} /><Label htmlFor="showId">Tampilkan ID Benda Uji</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showAge" checked={properties.showAge} onCheckedChange={c => onPropertyChange('showAge', c)} /><Label htmlFor="showAge">Tampilkan Umur</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showTestDate" checked={properties.showTestDate} onCheckedChange={c => onPropertyChange('showTestDate', c)} /><Label htmlFor="showTestDate">Tampilkan Tanggal Uji</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="showStrength" checked={properties.showStrength} onCheckedChange={c => onPropertyChange('showStrength', c)} /><Label htmlFor="showStrength">Tampilkan Kuat Tekan</Label></div>
        </div>
    </div>
);

export const DynamicPlaceholderPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Placeholder</Label><Select value={properties.placeholder} onValueChange={v => onPropertyChange('placeholder', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ALL_PLACEHOLDERS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Label Awalan</Label><Input value={properties.label} onChange={e => onPropertyChange('label', e.target.value)} /></div>
        <div><Label>Sufiks</Label><Input value={properties.suffix} onChange={e => onPropertyChange('suffix', e.target.value)} /></div>
        <p className="text-xs text-muted-foreground pt-2">Gunakan tab "Tampilan" untuk mengatur gaya teks.</p>
    </div>
);

export const ImagePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Lebar Maksimum (%)</Label><Input type="number" min="1" max="100" value={properties.maxWidth} onChange={e => onPropertyChange('maxWidth', parseInt(e.target.value))} /></div>
        <div><Label>Perataan</Label><Select value={properties.align} onValueChange={v => onPropertyChange('align', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Kiri</SelectItem><SelectItem value="center">Tengah</SelectItem><SelectItem value="right">Kanan</SelectItem></SelectContent></Select></div>
        <div><Label>Opasitas (%)</Label><Input type="range" min="0" max="100" value={properties.opacity} onChange={e => onPropertyChange('opacity', parseInt(e.target.value))} /></div>
        <div className="flex items-center space-x-2"><Checkbox id="hasFrame" checked={properties.hasFrame} onCheckedChange={c => onPropertyChange('hasFrame', c)} /><Label htmlFor="hasFrame">Tampilkan Bingkai</Label></div>
    </div>
);

export const QrCodePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Konten QR</Label><Textarea value={properties.content} onChange={e => onPropertyChange('content', e.target.value)} placeholder="Masukkan URL atau teks..." /></div>
        <div><Label>Ukuran (px)</Label><Input type="number" value={properties.size} onChange={e => onPropertyChange('size', parseInt(e.target.value))} /></div>
        <div><Label>Perataan</Label><Select value={properties.align} onValueChange={v => onPropertyChange('align', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Kiri</SelectItem><SelectItem value="center">Tengah</SelectItem><SelectItem value="right">Kanan</SelectItem></SelectContent></Select></div>
    </div>
);

export const LocationDatePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Kota</Label><Input value={properties.city} onChange={e => onPropertyChange('city', e.target.value)} /></div>
        <div><Label>Format Tanggal</Label><Select value={properties.dateFormat} onValueChange={v => onPropertyChange('dateFormat', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="long">Panjang (19 Juli 2025)</SelectItem><SelectItem value="short">Pendek (19/07/2025)</SelectItem></SelectContent></Select></div>
        <div><Label>Awalan</Label><Input value={properties.prefix} onChange={e => onPropertyChange('prefix', e.target.value)} placeholder="Contoh: Ditetapkan di" /></div>
        <p className="text-xs text-muted-foreground pt-2">Gunakan tab "Tampilan" untuk mengatur gaya teks.</p>
    </div>
);

export const CustomTablePanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Jumlah Baris</Label><Input type="number" min="1" value={properties.rowCount} onChange={e => onPropertyChange('rowCount', parseInt(e.target.value))} /></div>
        <div><Label>Jumlah Kolom</Label><Input type="number" min="1" value={properties.colCount} onChange={e => onPropertyChange('colCount', parseInt(e.target.value))} /></div>
        <div className="flex items-center space-x-2"><Checkbox id="isHeaderFirstRow" checked={properties.isHeaderFirstRow} onCheckedChange={c => onPropertyChange('isHeaderFirstRow', c)} /><Label htmlFor="isHeaderFirstRow">Baris pertama adalah Header</Label></div>
        <p className="text-xs text-muted-foreground pt-2">Gunakan tab "Tampilan" untuk mengatur gaya tabel. Isi tabel dapat diubah langsung di kanvas.</p>
    </div>
);

export const LineSpacerPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Ketebalan (px)</Label><Input type="number" value={properties.thickness} onChange={e => onPropertyChange('thickness', parseInt(e.target.value))} /></div>
        <div><Label>Warna</Label><Input type="color" value={properties.color} onChange={e => onPropertyChange('color', e.target.value)} className="p-1 h-10 w-full" /></div>
        <div><Label>Gaya</Label><Select value={properties.style} onValueChange={v => onPropertyChange('style', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solid">Solid</SelectItem><SelectItem value="dashed">Dashed</SelectItem><SelectItem value="dotted">Dotted</SelectItem></SelectContent></Select></div>
        <div><Label>Lebar (%)</Label><Input type="number" min="1" max="100" value={properties.width} onChange={e => onPropertyChange('width', parseInt(e.target.value))} /></div>
    </div>
);

export const VerticalSpacerPanel = ({ properties, onPropertyChange }) => (
    <div><Label>Tinggi (px)</Label><Input type="number" value={properties.height} onChange={e => onPropertyChange('height', parseInt(e.target.value))} /></div>
);

export const FooterPanel = ({ properties, onPropertyChange }) => (
    <div className="space-y-4">
        <div><Label>Teks Kiri</Label><Input value={properties.leftText} onChange={e => onPropertyChange('leftText', e.target.value)} /></div>
        <div><Label>Teks Tengah</Label><Input value={properties.centerText} onChange={e => onPropertyChange('centerText', e.target.value)} /></div>
        <div><Label>Teks Kanan</Label><Input value={properties.rightText} onChange={e => onPropertyChange('rightText', e.target.value)} /></div>
        <div><Label>Ukuran Font (pt)</Label><Input type="number" value={properties.fontSize} onChange={e => onPropertyChange('fontSize', parseInt(e.target.value))} /></div>
        <div><Label>Warna Font</Label><Input type="color" value={properties.color} onChange={e => onPropertyChange('color', e.target.value)} className="p-1 h-10 w-full" /></div>
        <div className="flex items-center space-x-2"><Checkbox id="showBorder" checked={properties.showBorder} onCheckedChange={c => onPropertyChange('showBorder', c)} /><Label htmlFor="showBorder">Tampilkan Garis Atas</Label></div>
    </div>
);
