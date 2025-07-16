// Lokasi file: src/features/Reporting/components/builder/PropertyInspector.jsx
// Deskripsi: Fase 1 Diterapkan - Menambahkan kontrol untuk properti umum dan komponen grafik.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Button } from '../../../../components/ui/button';
import { Settings2, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline, Library } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import AssetManager from '../../AssetManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../components/ui/collapsible";

// Helper untuk input grup (misal: Margin, Padding)
const FourFieldInput = ({ label, values = {}, onChange, placeholders = ["Atas", "Kanan", "Bawah", "Kiri"] }) => (
    <div>
        <Label>{label}</Label>
        <div className="grid grid-cols-4 gap-1 mt-1">
            <Input type="number" placeholder={placeholders[0]} value={values.top || 0} onChange={e => onChange({ ...values, top: parseInt(e.target.value) || 0 })} />
            <Input type="number" placeholder={placeholders[1]} value={values.right || 0} onChange={e => onChange({ ...values, right: parseInt(e.target.value) || 0 })} />
            <Input type="number" placeholder={placeholders[2]} value={values.bottom || 0} onChange={e => onChange({ ...values, bottom: parseInt(e.target.value) || 0 })} />
            <Input type="number" placeholder={placeholders[3]} value={values.left || 0} onChange={e => onChange({ ...values, left: parseInt(e.target.value) || 0 })} />
        </div>
    </div>
);

// Panel Properti Umum
const GeneralPropertiesPanel = ({ component, onPropertyChange }) => {
    const { properties = {} } = component;
    const appearance = properties.appearance || {};
    const handleChange = (prop, value) => onPropertyChange(component.instanceId, `properties.appearance.${prop}`, value);

    return (
        <div className="space-y-4 p-4">
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full font-semibold text-sm text-left">Margin (px)</CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                    <FourFieldInput values={appearance.margin} onChange={val => handleChange('margin', val)} />
                </CollapsibleContent>
            </Collapsible>
             <Collapsible>
                <CollapsibleTrigger className="w-full font-semibold text-sm text-left">Padding (px)</CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                    <FourFieldInput values={appearance.padding} onChange={val => handleChange('padding', val)} />
                </CollapsibleContent>
            </Collapsible>
            <Collapsible>
                <CollapsibleTrigger className="w-full font-semibold text-sm text-left">Latar & Border</CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-3">
                    <div><Label>Warna Latar</Label><Input type="color" value={appearance.backgroundColor || '#ffffff'} onChange={e => handleChange('backgroundColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                    <div><Label>Tebal Border (px)</Label><Input type="number" value={appearance.borderWidth || 0} onChange={e => handleChange('borderWidth', parseInt(e.target.value))} /></div>
                    <div><Label>Warna Border</Label><Input type="color" value={appearance.borderColor || '#000000'} onChange={e => handleChange('borderColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                    <div><Label>Radius Sudut (px)</Label><Input type="number" value={appearance.borderRadius || 0} onChange={e => handleChange('borderRadius', parseInt(e.target.value))} /></div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};


// Panel untuk mengatur properti komponen yang dipilih
const ComponentPropertiesPanel = ({ component, onPropertyChange, reportData }) => {
    if (!component) return null;
    const { properties = {} } = component;
    const handleChange = (propName, value) => onPropertyChange(component.instanceId, `properties.${propName}`, value);

    const renderSpecificProperties = () => {
        switch (component.id) {
            case 'custom-text':
                return (
                    <div className="space-y-4">
                        <div><Label>Konten Teks</Label><Textarea value={properties.content || ''} onChange={e => handleChange('content', e.target.value)} placeholder="Gunakan {{nama_proyek}}..." /></div>
                        <div><Label>Jenis Font</Label><Select value={properties.fontFamily || 'Arial'} onValueChange={v => handleChange('fontFamily', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Arial">Arial</SelectItem><SelectItem value="Helvetica">Helvetica</SelectItem><SelectItem value="Times New Roman">Times New Roman</SelectItem></SelectContent></Select></div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-grow"><Label>Ukuran Font (pt)</Label><Input type="number" value={properties.fontSize || 12} onChange={e => handleChange('fontSize', parseInt(e.target.value))} /></div>
                            <div><Input type="color" value={properties.color || '#000000'} onChange={e => handleChange('color', e.target.value)} className="p-1 h-10"/></div>
                        </div>
                        <div><Label>Gaya Teks</Label><div className="flex gap-1 mt-1"><Button variant={properties.isBold ? "secondary" : "outline"} size="icon" onClick={() => handleChange('isBold', !properties.isBold)}><Bold size={16}/></Button><Button variant={properties.isItalic ? "secondary" : "outline"} size="icon" onClick={() => handleChange('isItalic', !properties.isItalic)}><Italic size={16}/></Button><Button variant={properties.isUnderline ? "secondary" : "outline"} size="icon" onClick={() => handleChange('isUnderline', !properties.isUnderline)}><Underline size={16}/></Button></div></div>
                        <div><Label>Perataan</Label><div className="flex gap-1 mt-1"><Button variant={properties.align === 'left' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'left')}><AlignLeft size={16}/></Button><Button variant={properties.align === 'center' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'center')}><AlignCenter size={16}/></Button><Button variant={properties.align === 'right' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'right')}><AlignRight size={16}/></Button><Button variant={properties.align === 'justify' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'justify')}><AlignJustify size={16}/></Button></div></div>
                    </div>
                );
            case 'jmd-table':
            case 'material-properties-table':
            case 'raw-strength-table':
            case 'strength-summary-table':
                return (
                     <div className="space-y-4">
                        <div><Label>Judul Tabel</Label><Input value={properties.title || ''} onChange={e => handleChange('title', e.target.value)} /></div>
                        <Collapsible><CollapsibleTrigger className="font-semibold text-sm w-full text-left">Styling Tabel</CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 pt-2">
                                <div><Label>Warna Latar Header</Label><Input type="color" value={properties.headerBgColor || '#E5E7EB'} onChange={e => handleChange('headerBgColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                                <div><Label>Warna Teks Header</Label><Input type="color" value={properties.headerTextColor || '#111827'} onChange={e => handleChange('headerTextColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                                <div><Label>Warna Border</Label><Input type="color" value={properties.borderColor || '#9CA3AF'} onChange={e => handleChange('borderColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                                <div><Label>Tebal Border (px)</Label><Input type="number" value={properties.borderWidth ?? 1} onChange={e => handleChange('borderWidth', parseInt(e.target.value))} /></div>
                                <div className="flex items-center space-x-2"><Checkbox id="zebra" checked={properties.isZebra ?? false} onCheckedChange={c => handleChange('isZebra', c)} /><Label htmlFor="zebra">Gunakan Warna Baris Selang-seling</Label></div>
                            </CollapsibleContent>
                        </Collapsible>
                     </div>
                );
            case 'strength-chart':
            case 'sqc-chart':
            case 'combined-gradation-chart':
                 return (
                     <div className="space-y-4">
                        <div><Label>Judul Grafik</Label><Input value={properties.title || ''} onChange={e => handleChange('title', e.target.value)} /></div>
                        <div><Label>Sub-judul</Label><Input value={properties.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)} /></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showLegend" checked={properties.showLegend ?? true} onCheckedChange={c => handleChange('showLegend', c)} /><Label htmlFor="showLegend">Tampilkan Legenda</Label></div>
                        <div className="flex items-center space-x-2"><Checkbox id="showGrid" checked={properties.showGrid ?? true} onCheckedChange={c => handleChange('showGrid', c)} /><Label htmlFor="showGrid">Tampilkan Grid Latar</Label></div>
                        {/* PENERAPAN LANGKAH 1.3 */}
                        <div className="flex items-center space-x-2"><Checkbox id="showDataLabels" checked={properties.showDataLabels ?? false} onCheckedChange={c => handleChange('showDataLabels', c)} /><Label htmlFor="showDataLabels">Tampilkan Label Nilai</Label></div>
                        <div><Label>Warna Garis Utama</Label><Input type="color" value={properties.lineColor || '#16a34a'} onChange={e => handleChange('lineColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                        <Collapsible><CollapsibleTrigger className="font-semibold text-sm w-full text-left">Styling Sumbu</CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 pt-2">
                                <div><Label>Ukuran Font Sumbu (px)</Label><Input type="number" value={properties.axisFontSize || 10} onChange={e => handleChange('axisFontSize', parseInt(e.target.value))} /></div>
                                <div><Label>Warna Teks Sumbu</Label><Input type="color" value={properties.axisColor || '#666666'} onChange={e => handleChange('axisColor', e.target.value)} className="p-1 h-10 w-full" /></div>
                            </CollapsibleContent>
                        </Collapsible>
                     </div>
                 );
            case 'signature-block':
                const sigCols = Array.from({ length: properties.columnCount || 2 }, (_, i) => i);
                return (
                    <div className="space-y-3">
                        {/* PENERAPAN LANGKAH 1.2 */}
                        <div><Label>Ukuran Font Global (pt)</Label><Input type="number" value={properties.fontSize || 10} onChange={e => handleChange('fontSize', parseInt(e.target.value))} /></div>
                        <div><Label>Spasi Vertikal (px)</Label><Input type="number" value={properties.verticalSpacing || 48} onChange={e => handleChange('verticalSpacing', parseInt(e.target.value))} /></div>
                        <hr/>
                        <div><Label>Jumlah Kolom</Label><Input type="number" min="1" max="4" value={properties.columnCount || 2} onChange={e => handleChange('columnCount', parseInt(e.target.value))} /></div>
                        {sigCols.map(i => (
                            <div key={i} className="p-2 border rounded-md space-y-2">
                                <h4 className="font-medium text-sm">Kolom #{i + 1}</h4>
                                <div><Label>Label</Label><Input value={properties[`label${i+1}`] || ''} onChange={e => handleChange(`label${i+1}`, e.target.value)} /></div>
                                <div><Label>Nama</Label><Input value={properties[`name${i+1}`] || ''} onChange={e => handleChange(`name${i+1}`, e.target.value)} /></div>
                                <div><Label>Jabatan</Label><Input value={properties[`position${i+1}`] || ''} onChange={e => handleChange(`position${i+1}`, e.target.value)} /></div>
                            </div>
                        ))}
                    </div>
                );
            case 'custom-table':
                return(
                    <div className="space-y-4">
                        {/* PENERAPAN LANGKAH 1.2 */}
                        <div className="flex items-center space-x-2"><Checkbox id="isHeaderFirstRow" checked={properties.isHeaderFirstRow ?? true} onCheckedChange={c => handleChange('isHeaderFirstRow', c)} /><Label htmlFor="isHeaderFirstRow">Baris pertama adalah Header</Label></div>
                        <hr/>
                        {/* Kontrol lain untuk tabel kustom bisa ditambahkan di sini */}
                        <p className="text-xs text-muted-foreground">Gunakan tab "Tampilan" untuk mengatur gaya tabel.</p>
                    </div>
                );
            default:
                return <p className="text-sm text-muted-foreground">Tidak ada properti spesifik untuk komponen ini.</p>;
        }
    };

    return (
        <div className="p-4">
            <h4 className="font-bold mb-4 border-b pb-2">{component.name}</h4>
            {renderSpecificProperties()}
        </div>
    );
};

const ReportSettingsPanel = ({ pageSettings, onPageSettingChange }) => (
    <div className="p-4 space-y-4">
        <div className="flex items-center text-lg font-semibold"><Settings2 className="mr-2 h-5 w-5" />Pengaturan Laporan</div>
        <p className="text-sm text-muted-foreground">Atur properti global untuk seluruh halaman laporan Anda.</p>
        <div className="space-y-2"><Label>Ukuran Kertas</Label><Select value={pageSettings.size} onValueChange={v => onPageSettingChange('size', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a4">A4</SelectItem><SelectItem value="letter">Letter</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>Orientasi</Label><Select value={pageSettings.orientation} onValueChange={v => onPageSettingChange('orientation', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="portrait">Potret</SelectItem><SelectItem value="landscape">Lanskap</SelectItem></SelectContent></Select></div>
    </div>
);

export default function PropertyInspector({ selectedComponent, onPropertyChange, reportData, pageSettings, onPageSettingChange }) {
    return (
        <Card className="w-80 flex-shrink-0 flex flex-col">
            <CardHeader className="flex-shrink-0"><CardTitle className="text-lg">Properti</CardTitle></CardHeader>
            <CardContent className="flex-grow p-0 min-h-0">
                <ScrollArea className="h-full">
                    {selectedComponent ? 
                        <Tabs defaultValue="specific" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="specific">Properti</TabsTrigger>
                                <TabsTrigger value="appearance">Tampilan</TabsTrigger>
                            </TabsList>
                            <TabsContent value="specific">
                                <ComponentPropertiesPanel component={selectedComponent} onPropertyChange={onPropertyChange} reportData={reportData} />
                            </TabsContent>
                            <TabsContent value="appearance">
                                <GeneralPropertiesPanel component={selectedComponent} onPropertyChange={onPropertyChange} />
                            </TabsContent>
                        </Tabs>
                        : 
                        <ReportSettingsPanel pageSettings={pageSettings} onPageSettingChange={onPageSettingChange} />
                    }
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
