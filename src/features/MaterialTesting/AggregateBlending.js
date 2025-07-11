// Lokasi file: src/features/MaterialTesting/AggregateBlending.js
// Deskripsi: Perbaikan bug pada komponen Select untuk mencegah crash.

import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from '../../components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, Save } from 'lucide-react';
import * as api from '../../api/electronAPI';

// Helper function to get the active sieve analysis test for a material
const getActiveSieveTest = async (materialId) => {
    if (!materialId) return null;
    const tests = await api.getTestsForMaterial(materialId);
    const activeSieveTest = tests.find(t => t.test_type === 'sieve_analysis' && t.is_active_for_design);
    if (activeSieveTest) {
        return JSON.parse(activeSieveTest.result_data_json || '{}');
    }
    return null;
};

const sniBoundaries = {
    '100': { lower: 100, upper: 100 },
    '50': { lower: 100, upper: 100 },
    '40': { lower: 100, upper: 100 },
    '25': { lower: 100, upper: 100 },
    '20': { lower: 90, upper: 100 },
    '12.5': { lower: 100, upper: 100 },
    '10': { lower: 50, upper: 85 },
    '4.75': { lower: 30, upper: 59 },
    '2.36': { lower: 19, upper: 45 },
    '1.18': { lower: 12, upper: 35 },
    '0.60': { lower: 7, upper: 23 },
    '0.30': { lower: 4, upper: 15 },
    '0.15': { lower: 2, upper: 8 },
};

const AggregateBlending = ({ materials, onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [components, setComponents] = useState([
        { id: null, ratio: 50, sieveData: null },
        { id: null, ratio: 50, sieveData: null },
        { id: null, ratio: 0, sieveData: null },
    ]);
    const [blendedName, setBlendedName] = useState('');
    const [blendedType, setBlendedType] = useState('coarse_aggregate');

    const availableAggregates = useMemo(() => {
        return materials.filter(m => m.material_type.includes('aggregate') && !m.is_blend);
    }, [materials]);
    
    const handleComponentChange = async (index, materialIdStr) => {
        // PERBAIKAN: Cek untuk nilai 'none' sebagai penanda untuk reset
        const materialId = (materialIdStr && materialIdStr !== 'none') ? parseInt(materialIdStr) : null;

        if (!materialId) {
            const newComponents = [...components];
            newComponents[index] = { id: null, ratio: index === 2 ? 0 : 50, sieveData: null };
            setComponents(newComponents);
            return;
        }

        const sieveData = await getActiveSieveTest(materialId);
        if (!sieveData) {
            alert('Material yang dipilih tidak memiliki data Analisis Saringan yang aktif.');
            return;
        }
        const newComponents = [...components];
        newComponents[index].id = materialId;
        newComponents[index].sieveData = sieveData.table;
        setComponents(newComponents);
    };

    const handleRatioChange = (index, newRatioStr) => {
        const newRatio = Math.max(0, Math.min(100, parseInt(newRatioStr) || 0));
        const newComponents = [...components];
        
        let otherRatiosSum = 0;
        for (let i = 0; i < newComponents.length; i++) {
            if (i !== index) {
                otherRatiosSum += newComponents[i].ratio;
            }
        }

        const cappedNewRatio = Math.min(newRatio, 100 - otherRatiosSum + newComponents[index].ratio);
        newComponents[index].ratio = cappedNewRatio;

        const currentTotal = newComponents.reduce((sum, c) => sum + c.ratio, 0);
        if (currentTotal > 100) {
            const overflow = currentTotal - 100;
            const otherActiveComponents = newComponents.filter((c, i) => i !== index && c.ratio > 0);
            if (otherActiveComponents.length > 0) {
                const reductionPerComponent = overflow / otherActiveComponents.length;
                otherActiveComponents.forEach(c => {
                    const compIndex = newComponents.findIndex(comp => comp.id === c.id);
                    newComponents[compIndex].ratio = Math.max(0, c.ratio - reductionPerComponent);
                });
            }
        }
        setComponents(newComponents);
    };

    const chartData = useMemo(() => {
        const validComponents = components.filter(c => c.sieveData);
        if (validComponents.length === 0) return [];

        const allSieveSizes = Object.keys(sniBoundaries).map(s => parseFloat(s)).sort((a,b) => b-a);
        const totalRatio = validComponents.reduce((sum, c) => sum + c.ratio, 0);
        if (totalRatio === 0) return [];

        return allSieveSizes.map(size => {
            let combinedPassing = 0;
            validComponents.forEach(comp => {
                const passing = comp.sieveData[String(size)]?.passingPercent || 0;
                const ratio = comp.ratio / totalRatio;
                combinedPassing += passing * ratio;
            });
            const boundary = sniBoundaries[String(size)];
            return {
                size: size,
                'Gabungan': combinedPassing,
                'Batas Atas SNI': boundary?.upper,
                'Batas Bawah SNI': boundary?.lower,
            };
        });
    }, [components]);

    const handleSaveBlend = async () => {
        if (!blendedName) { alert("Nama material campuran harus diisi."); return; }
        const activeComponents = components.filter(c => c.id !== null);
        if (activeComponents.length < 2) { alert("Pilih setidaknya dua komponen."); return; }
        const totalRatio = activeComponents.reduce((sum, c) => sum + c.ratio, 0);
        if (Math.abs(totalRatio - 100) > 1) { alert("Total proporsi harus 100%."); return; }
        
        const blend_components = activeComponents.map(c => ({ id: c.id, ratio: c.ratio }));
        const newMaterial = { name: blendedName, material_type: blendedType, source: "Campuran Internal", is_blend: 1, blend_components_json: JSON.stringify(blend_components) };
        
        const success = await onSave(newMaterial);
        if (success) {
            setIsOpen(false);
            setComponents([{ id: null, ratio: 50, sieveData: null }, { id: null, ratio: 50, sieveData: null }, { id: null, ratio: 0, sieveData: null }]);
            setBlendedName('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Buat Campuran Agregat
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Manajemen Campuran Agregat (Blending)</DialogTitle>
                    <DialogDescription>Pilih hingga tiga agregat, atur proporsinya, dan simpan sebagai material baru.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 overflow-y-auto max-h-[75vh]">
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="font-semibold">Komponen Campuran</h3>
                        {components.map((comp, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                <h4 className="font-medium mb-2">Komponen #{index + 1}</h4>
                                <Select onValueChange={(val) => handleComponentChange(index, val)} value={comp.id?.toString() || ''}>
                                    <SelectTrigger><SelectValue placeholder="Pilih Agregat..." /></SelectTrigger>
                                    <SelectContent>
                                        {/* PERBAIKAN: Menggunakan nilai 'none' yang valid */}
                                        <SelectItem value="none">-- Kosong --</SelectItem>
                                        {availableAggregates.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Label className="mt-3 block">Proporsi: {comp.ratio}%</Label>
                                <Input type="range" min="0" max="100" value={comp.ratio} onChange={e => handleRatioChange(index, e.target.value)} className="w-full mt-1" disabled={!comp.id} />
                            </div>
                        ))}
                        
                        <div className="pt-4 border-t">
                             <h3 className="font-semibold">Simpan Hasil Campuran</h3>
                             <div className="space-y-2 mt-2">
                                <Label htmlFor="blend-name">Nama Material Campuran Baru</Label>
                                <Input id="blend-name" value={blendedName} onChange={e => setBlendedName(e.target.value)} placeholder="Contoh: Agregat Kasar Gabungan A"/>
                                <Label htmlFor="blend-type">Tipe Material Hasil</Label>
                                <Select value={blendedType} onValueChange={setBlendedType}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="coarse_aggregate">Agregat Kasar</SelectItem>
                                        <SelectItem value="fine_aggregate">Agregat Halus</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="font-semibold text-center mb-2">Kurva Gradasi Gabungan</h3>
                        <div className="h-96 w-full bg-background p-4 rounded-lg border">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                                    <XAxis dataKey="size" type="number" scale="log" domain={[0.1, 100]} reversed={true} label={{ value: "Ukuran Saringan (mm) - Skala Log", position: "insideBottom", offset: -15 }} ticks={[0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 10, 20, 40, 100]} />
                                    <YAxis domain={[0, 100]} label={{ value: '% Lolos', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value) => `${value ? value.toFixed(2) : '0.00'}%`} />
                                    <Legend verticalAlign="top" />
                                    <Line type="monotone" dataKey="Gabungan" stroke="#16a34a" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="Batas Atas SNI" stroke="#ef4444" strokeDasharray="5 5" name="Batas Atas" dot={false} />
                                    <Line type="monotone" dataKey="Batas Bawah SNI" stroke="#ef4444" strokeDasharray="5 5" name="Batas Bawah" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                    <Button type="button" onClick={handleSaveBlend}><Save className="mr-2 h-4 w-4"/> Simpan Material Campuran</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AggregateBlending;
