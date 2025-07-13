// Lokasi file: src/features/Reporting/components/builder/PropertyInspector.jsx
// Deskripsi: Komponen modular untuk panel Properti. Versi ini lengkap dengan editor untuk semua komponen.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Button } from '../../../../components/ui/button';
import { Settings2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Library } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import AssetManager from '../../AssetManager';

// Panel untuk mengatur properti komponen yang dipilih
const ComponentPropertiesPanel = ({ component, onPropertyChange, reportData }) => {
    if (!component) return null;
    const { properties = {} } = component;
    const handleChange = (propName, value) => onPropertyChange(component.instanceId, propName, value);

    const renderProperties = () => {
        switch (component.id) {
            case 'custom-text':
                return (
                    <div className="space-y-4">
                        <div><Label htmlFor="content">Teks Konten</Label><Textarea id="content" value={properties.content || ''} onChange={(e) => handleChange('content', e.target.value)} placeholder="Gunakan {{nama_proyek}} untuk variabel..." /></div>
                        <div><Label>Gaya Teks</Label>
                            <div className="flex gap-1 mt-1">
                                <Button variant={properties.isBold ? "secondary" : "outline"} size="icon" onClick={() => handleChange('isBold', !properties.isBold)}><Bold size={16}/></Button>
                                <Button variant={properties.isItalic ? "secondary" : "outline"} size="icon" onClick={() => handleChange('isItalic', !properties.isItalic)}><Italic size={16}/></Button>
                                <Button variant={properties.isUnderline ? "secondary" : "outline"} size="icon" onClick={() => handleChange('isUnderline', !properties.isUnderline)}><Underline size={16}/></Button>
                            </div>
                        </div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-grow"><Label htmlFor="fontSize">Ukuran Font (pt)</Label><Input id="fontSize" type="number" value={properties.fontSize || 12} onChange={(e) => handleChange('fontSize', parseInt(e.target.value))} /></div>
                            <div><Input id="color" type="color" value={properties.color || '#000000'} onChange={(e) => handleChange('color', e.target.value)} className="p-1 h-10"/></div>
                        </div>
                        <div><Label>Perataan</Label>
                            <div className="flex gap-1 mt-1">
                                <Button variant={properties.align === 'left' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'left')}><AlignLeft size={16}/></Button>
                                <Button variant={properties.align === 'center' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'center')}><AlignCenter size={16}/></Button>
                                <Button variant={properties.align === 'right' ? "secondary" : "outline"} size="icon" onClick={() => handleChange('align', 'right')}><AlignRight size={16}/></Button>
                            </div>
                        </div>
                    </div>
                );
            case 'custom-image':
                 return (
                        <div className="space-y-4">
                            <h4 className="font-semibold">Opsi Gambar</h4>
                            <Dialog>
                                <DialogTrigger asChild><Button variant="outline" className="w-full"><Library className="mr-2 h-4 w-4"/> Pilih dari Aset</Button></DialogTrigger>
                                <DialogContent className="max-w-4xl h-[70vh] flex flex-col"><DialogHeader><DialogTitle>Pilih Aset Gambar</DialogTitle></DialogHeader><AssetManager onAssetSelect={(path) => handleChange('src', `file://${path}`)} isDialogMode={true} /></DialogContent>
                            </Dialog>
                            <div><Label>Lebar Maksimum (%)</Label><Input type="number" min="10" max="100" value={properties.maxWidth || 100} onChange={(e) => handleChange('maxWidth', parseInt(e.target.value))} /></div>
                            <div><Label>Perataan</Label>
                                <Select value={properties.align || 'center'} onValueChange={(val) => handleChange('align', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="left">Kiri</SelectItem><SelectItem value="center">Tengah</SelectItem><SelectItem value="right">Kanan</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2"><Checkbox id="hasFrame" checked={properties.hasFrame ?? false} onCheckedChange={(checked) => handleChange('hasFrame', checked)} /><Label htmlFor="hasFrame">Tampilkan Bingkai</Label></div>
                        </div>
                    );
            case 'signature-block':
                return (
                    <div className="space-y-3">
                        <div><Label>Label Kiri</Label><Input value={properties.label1 || 'Disiapkan oleh,'} onChange={e => handleChange('label1', e.target.value)} /></div>
                        <div><Label>Nama Kiri</Label><Input value={properties.name1 || '(_________________)'} onChange={e => handleChange('name1', e.target.value)} /></div>
                        <div><Label>Jabatan Kiri</Label><Input value={properties.position1 || 'Teknisi Lab'} onChange={e => handleChange('position1', e.target.value)} /></div>
                        <hr className="my-4" />
                        <div><Label>Label Kanan</Label><Input value={properties.label2 || 'Disetujui oleh,'} onChange={e => handleChange('label2', e.target.value)} /></div>
                        <div><Label>Nama Kanan</Label><Input value={properties.name2 || '(_________________)'} onChange={e => handleChange('name2', e.target.value)} /></div>
                        <div><Label>Jabatan Kanan</Label><Input value={properties.position2 || 'Penyelia'} onChange={e => handleChange('position2', e.target.value)} /></div>
                    </div>
                );
            case 'vertical-spacer':
                return (
                    <div><Label>Tinggi Spasi (px)</Label><Input type="number" value={properties.height || 20} onChange={e => handleChange('height', parseInt(e.target.value))} /></div>
                );
            case 'custom-table':
                const cells = properties.cells || {};
                const rowCount = properties.rowCount || 2;
                const colCount = properties.colCount || 2;
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div><Label>Baris</Label><Input type="number" value={rowCount} onChange={e => handleChange('rowCount', parseInt(e.target.value) || 1)} /></div>
                            <div><Label>Kolom</Label><Input type="number" value={colCount} onChange={e => handleChange('colCount', parseInt(e.target.value) || 1)} /></div>
                        </div>
                        <Label>Konten Sel</Label>
                        <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${colCount}, 1fr)`}}>
                            {Array.from({length: rowCount}).map((_, r) => 
                                Array.from({length: colCount}).map((_, c) => (
                                    <Input key={`${r}-${c}`} placeholder={`Sel ${r+1}-${c+1}`} value={cells[`${r}-${c}`] || ''} 
                                           onChange={e => handleChange('cells', {...cells, [`${r}-${c}`]: e.target.value})} />
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'script-block':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="script-content">Skrip JavaScript</Label>
                        <p className="text-xs text-muted-foreground">Gunakan `return` untuk menampilkan hasil. Variabel `trial` tersedia.</p>
                        <Textarea id="script-content" value={properties.script || ''} onChange={(e) => handleChange('script', e.target.value)} rows={15} className="font-mono text-xs" placeholder="Contoh: return `FAS: ${trial.design_result.wcRatio.toFixed(2)}`;"/>
                    </div>
                );
            case 'trial-loop':
                const trials = reportData?.trials || [];
                return (
                    <div>
                        <Label>Pilih Trial untuk Diulang</Label>
                        <p className="text-xs text-muted-foreground mb-2">Kosongkan untuk mengulang semua trial di proyek.</p>
                        <ScrollArea className="h-40 border rounded-md p-2">
                            {trials.map(trial => (
                                <div key={trial.id} className="flex items-center space-x-2">
                                    <Checkbox id={`trial-${trial.id}`} checked={(properties.selectedTrials || []).includes(trial.id)} onCheckedChange={(checked) => { const currentSelection = properties.selectedTrials || []; const newSelection = checked ? [...currentSelection, trial.id] : currentSelection.filter(id => id !== trial.id); handleChange('selectedTrials', newSelection); }}/>
                                    <Label htmlFor={`trial-${trial.id}`} className="font-normal">{trial.trial_name}</Label>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                );
            default:
                return <p className="text-sm text-muted-foreground">Tidak ada properti yang dapat diubah untuk komponen ini.</p>;
        }
    };

    return (
        <div className="p-4">
            <h4 className="font-bold mb-2">{component.name}</h4>
            {renderProperties()}
        </div>
    );
};

const ReportSettingsPanel = ({ pageSettings, onPageSettingChange }) => (
    <div className="p-4 space-y-4">
        <div className="flex items-center text-lg font-semibold"><Settings2 className="mr-2 h-5 w-5" />Pengaturan Laporan</div>
        <p className="text-sm text-muted-foreground">Atur properti global untuk seluruh halaman laporan Anda.</p>
        <div className="space-y-2"><Label htmlFor="page-size">Ukuran Kertas</Label><Select value={pageSettings.size} onValueChange={(v) => onPageSettingChange('size', v)}><SelectTrigger id="page-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a4">A4</SelectItem><SelectItem value="letter">Letter</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="page-orientation">Orientasi</Label><Select value={pageSettings.orientation} onValueChange={(v) => onPageSettingChange('orientation', v)}><SelectTrigger id="page-orientation"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="portrait">Potret</SelectItem><SelectItem value="landscape">Lanskap</SelectItem></SelectContent></Select></div>
    </div>
);

export default function PropertyInspector({ selectedComponent, onPropertyChange, reportData, pageSettings, onPageSettingChange }) {
    return (
        <Card className="w-80 flex-shrink-0 flex flex-col">
            <CardHeader className="flex-shrink-0"><CardTitle className="text-lg">Properti</CardTitle></CardHeader>
            <CardContent className="flex-grow p-0 min-h-0">
                <ScrollArea className="h-full">
                    {selectedComponent ? 
                        <ComponentPropertiesPanel component={selectedComponent} onPropertyChange={onPropertyChange} reportData={reportData} /> : 
                        <ReportSettingsPanel pageSettings={pageSettings} onPageSettingChange={onPageSettingChange} />
                    }
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
