// Lokasi file: src/features/Projects/JobMixDesign.js

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ResultCard from '../../components/ResultCard';
import { useActiveMaterialProperties } from '../../hooks/useActiveMaterialProperties';
import { defaultInputs, sniReferenceData } from '../../data/sniData';
import { Loader2, ChevronsRight, Droplet, Wind, Package, Component, Waves, Beaker, ArrowLeft, ArrowRight, Save, BarChart2, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { useNotifier } from '../../hooks/useNotifier';
import { calculateMixDesign } from '../../utils/concreteCalculator';
import { writeLog } from '../../api/electronAPI';
import { Stepper } from '../../components/ui/Stepper';
import ValidatedInput from '../../components/ui/ValidatedInput';
import { Switch } from '../../components/ui/switch';
import HelpTooltip from '../../components/ui/HelpTooltip';
import AddMaterialDialog from '../MaterialTesting/AddMaterialDialog';
import ReferenceLibraryDialog from '../ReferenceLibrary/ReferenceLibraryDialog';

const DataOriginLabel = ({ date }) => {
    if (!date) return null;
    const formattedDate = new Date(date).toLocaleDateString('id-ID');
    return (
        <span className="text-xs text-muted-foreground ml-2">(dari uji tgl: {formattedDate})</span>
    );
};

const CombinedGradationChart = ({ fineAggregate, coarseAggregate, mixProportions, chartRef }) => {
    const chartData = useMemo(() => {
        if (!fineAggregate || !coarseAggregate || !mixProportions) return [];
        
        const fineSieve = fineAggregate.properties.sieve_table;
        const coarseSieve = coarseAggregate.properties.sieve_table;
        if (!fineSieve || !coarseSieve) return [];

        const totalWeight = mixProportions.fineAggrWeightSSD + mixProportions.coarseAggrWeightSSD;
        const fineRatio = mixProportions.fineAggrWeightSSD / totalWeight;
        const coarseRatio = mixProportions.coarseAggrWeightSSD / totalWeight;

        const allSieveSizes = [...new Set([...Object.keys(fineSieve), ...Object.keys(coarseSieve)])]
            .map(s => parseFloat(s)).sort((a, b) => b - a);

        return allSieveSizes.map(size => {
            const finePassing = fineSieve[String(size)]?.passingPercent || 0;
            const coarsePassing = coarseSieve[String(size)]?.passingPercent || 0;
            return {
                size: size,
                'Gabungan': (finePassing * fineRatio) + (coarsePassing * coarseRatio),
            };
        });
    }, [fineAggregate, coarseAggregate, mixProportions]);

    if (chartData.length === 0) {
        return <p className="text-sm text-muted-foreground">Data saringan tidak lengkap untuk menampilkan grafik.</p>;
    }

    return (
        <div ref={chartRef} className="bg-white p-4">
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="size" type="number" scale="log" domain={[0.1, 100]} reversed ticks={[0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 10, 20, 40, 100]} label={{ value: "Ukuran Saringan (mm)", position: "insideBottom", offset: -15 }} />
                    <YAxis domain={[0, 100]} label={{ value: '% Lolos', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="Gabungan" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


export default function JobMixDesign({ trial, onSave, apiReady, chartRef }) {
    const [inputs, setInputs] = useState(defaultInputs);
    const [results, setResults] = useState(null);
    const { activeProperties, loading: propsLoading, refresh } = useActiveMaterialProperties(apiReady);
    const { notify } = useNotifier();
    const [step, setStep] = useState(1);
    const [isDirty, setIsDirty] = useState(false);
    const [useAdmixture, setUseAdmixture] = useState(false);
    const [mismatches, setMismatches] = useState({});

    useEffect(() => {
        if (trial) {
            const designInput = (trial.design_input && Object.keys(trial.design_input).length > 0) ? trial.design_input : defaultInputs;
            const sanitizedInputs = Object.entries(designInput).reduce((acc, [key, value]) => {
                if (key === 'admixture' && (typeof value !== 'object' || value === null)) { acc[key] = { name: '', waterReduction: '' }; } 
                else { acc[key] = value !== null && value !== undefined ? value : ''; }
                return acc;
            }, {});
            setInputs(sanitizedInputs);
            setResults(trial.design_result && Object.keys(trial.design_result).length > 0 ? trial.design_result : null);
            const hasAdmixture = !!(sanitizedInputs.admixture?.name || (sanitizedInputs.admixture?.waterReduction && parseFloat(sanitizedInputs.admixture.waterReduction) > 0));
            setUseAdmixture(hasAdmixture);
            setIsDirty(false);
        }
    }, [trial]);

    useEffect(() => { if (apiReady) refresh(); }, [apiReady, refresh]);

    useEffect(() => {
        const checkConsistency = () => {
            const newMismatches = {};
            const { selectedFineId, selectedCoarseId, finenessModulus, dryRoddedWeightCoarse } = inputs;

            if (selectedFineId) {
                const fineAggr = activeProperties.fineAggregates.find(m => m.id === selectedFineId);
                if (fineAggr && Math.abs(parseFloat(finenessModulus) - fineAggr.properties.fm) > 0.01) {
                    newMismatches.finenessModulus = `Nilai di form (${finenessModulus}) tidak cocok dengan data material (${fineAggr.properties.fm.toFixed(2)}). Klik untuk sinkronisasi.`;
                }
            }

            if (selectedCoarseId) {
                const coarseAggr = activeProperties.coarseAggregates.find(m => m.id === selectedCoarseId);
                if (coarseAggr && Math.abs(parseFloat(dryRoddedWeightCoarse) - coarseAggr.properties.bulk_density) > 0.01) {
                    newMismatches.dryRoddedWeightCoarse = `Nilai di form (${dryRoddedWeightCoarse}) tidak cocok dengan data material (${coarseAggr.properties.bulk_density}). Klik untuk sinkronisasi.`;
                }
            }
            setMismatches(newMismatches);
        };
        checkConsistency();
    }, [inputs, activeProperties]);

    const handleInputChange = (field, value) => { setInputs(prev => ({ ...prev, [field]: value })); setIsDirty(true); };
    
    const handleAdmixtureToggle = (checked) => {
        setUseAdmixture(checked);
        setIsDirty(true);
        if (!checked) {
            handleInputChange('admixture', { name: '', waterReduction: '' });
        }
    };

    const handleMaterialSelect = (type, materialIdStr) => {
        const materialId = materialIdStr ? parseInt(materialIdStr) : null;
        let selectedMaterialProps = {};
        let materialKey = '';
        
        if (type === 'cement') {
            materialKey = 'selectedCementId';
            const mat = activeProperties.cements.find(m => m.id === materialId);
            if (mat) { selectedMaterialProps.sgCement = mat.properties.sg; }
        } else if (type === 'fine_aggregate') {
            materialKey = 'selectedFineId';
            const mat = activeProperties.fineAggregates.find(m => m.id === materialId);
            if (mat) { selectedMaterialProps = { sgFine: mat.properties.sg, absorptionFine: mat.properties.absorption, moistureFine: mat.properties.moisture, finenessModulus: mat.properties.fm.toFixed(2), }; }
        } else if (type === 'coarse_aggregate') {
            materialKey = 'selectedCoarseId';
            const mat = activeProperties.coarseAggregates.find(m => m.id === materialId);
            if(mat) { selectedMaterialProps = { sgCoarse: mat.properties.sg, absorptionCoarse: mat.properties.absorption, moistureCoarse: mat.properties.moisture, dryRoddedWeightCoarse: mat.properties.bulk_density, }; }
        }
        const sanitizedProps = Object.entries(selectedMaterialProps).reduce((acc, [key, value]) => { acc[key] = String(value); return acc; }, {});

        setInputs(prev => ({ ...prev, [materialKey]: materialId, ...sanitizedProps }));
        setIsDirty(true);
    };
    
    const handleCalculate = () => {
        try {
            const newResults = calculateMixDesign(inputs);
            setResults(newResults);
            setStep(3);
            notify.success("Perhitungan berhasil diselesaikan.");
            writeLog('info', `Calculation successful for trial: ${trial.trial_name}`);
            handleSaveDesign(newResults);
        } catch (e) {
            notify.error(e.message || "Perhitungan gagal. Periksa kembali semua input.");
            writeLog('error', `Calculation failed for trial: ${trial.trial_name}. Error: ${e.message}`);
        }
    };

    const handleSaveDesign = (currentResults = results) => {
        if (!trial || !currentResults) return;
        const numericInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
            if (key === 'admixture') { acc[key] = value; }
            else { const num = parseFloat(value); acc[key] = isNaN(num) ? value : num; }
            return acc;
        }, {});
        onSave({ ...trial, design_input: numericInputs, design_result: currentResults });
        setIsDirty(false);
    };

    const validation = useMemo(() => {
        const fc = parseFloat(inputs.fc);
        const stdDev = parseFloat(inputs.stdDev);
        const slump = parseFloat(inputs.slump);
        return {
            fc: fc > 0,
            stdDev: stdDev >= 0,
            slump: slump > 0,
            isStep1Valid: fc > 0 && stdDev >= 0 && slump > 0,
            isStep2Valid: inputs.selectedCementId && inputs.selectedFineId && inputs.selectedCoarseId,
        };
    }, [inputs]);

    const handleSyncProperty = (propName) => {
        let newValue = '';
        if (propName === 'finenessModulus' && inputs.selectedFineId) {
            const fineAggr = activeProperties.fineAggregates.find(m => m.id === inputs.selectedFineId);
            if (fineAggr) newValue = fineAggr.properties.fm.toFixed(2);
        }
        if (propName === 'dryRoddedWeightCoarse' && inputs.selectedCoarseId) {
            const coarseAggr = activeProperties.coarseAggregates.find(m => m.id === inputs.selectedCoarseId);
            if (coarseAggr) newValue = coarseAggr.properties.bulk_density;
        }
        
        if (newValue !== '') {
            handleInputChange(propName, String(newValue));
            notify.info(`Nilai ${propName} disinkronkan.`);
        }
    };

    if (propsLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    const steps = ["Parameter Desain", "Pemilihan Material & Properti", "Hasil & Simpan"];

    return (
        <div className="space-y-6">
            <Stepper steps={steps} currentStep={step} />

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 1: Parameter Desain</CardTitle>
                        <CardDescription>Masukkan parameter dasar untuk rencana campuran beton Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <ValidatedInput id="fc" label="Kuat Tekan (f'c)" unit="MPa" value={inputs.fc} onChange={e => handleInputChange('fc', e.target.value)} isValid={validation.fc} errorText="Nilai harus lebih dari 0" />
                                <HelpTooltip content={sniReferenceData.fc.content} />
                            </div>
                            <div className="flex items-center">
                                <ValidatedInput id="stdDev" label="Deviasi Standar (S)" unit="MPa" value={inputs.stdDev} onChange={e => handleInputChange('stdDev', e.target.value)} isValid={validation.stdDev} errorText="Nilai tidak boleh negatif" />
                                <HelpTooltip content={sniReferenceData.stdDev.content} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <ValidatedInput id="slump" label="Slump" unit="mm" value={inputs.slump} onChange={e => handleInputChange('slump', e.target.value)} isValid={validation.slump} errorText="Nilai harus lebih dari 0" />
                            <HelpTooltip content={sniReferenceData.slump.content} />
                            <ReferenceLibraryDialog trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                </Button>
                            } />
                        </div>
                        <div>
                            <div className="flex items-center">
                                <Label>Ukuran Agregat Maksimum</Label>
                                <HelpTooltip content={sniReferenceData.maxAggrSize.content} />
                                <ReferenceLibraryDialog trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                                        <BookOpen className="h-4 w-4 text-blue-500" />
                                    </Button>
                                } />
                            </div>
                            <Select onValueChange={val => handleInputChange('maxAggrSize', val)} value={String(inputs.maxAggrSize) || ''}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10 mm</SelectItem><SelectItem value="12.5">12.5 mm</SelectItem><SelectItem value="20">20 mm</SelectItem><SelectItem value="25">25 mm</SelectItem><SelectItem value="40">40 mm</SelectItem><SelectItem value="50">50 mm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 2: Pemilihan Material & Properti</CardTitle>
                        <CardDescription>Pilih material dari pustaka dan konfirmasi properti yang akan digunakan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label>Semen</Label>
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={val => handleMaterialSelect('cement', val)} value={String(inputs.selectedCementId) || ''}><SelectTrigger><SelectValue placeholder="Pilih Semen..."/></SelectTrigger><SelectContent>{activeProperties.cements.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}</SelectContent></Select>
                                    <AddMaterialDialog onMaterialAdded={refresh} />
                                </div>
                            </div>
                            <div>
                                <Label>Agregat Halus</Label>
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={val => handleMaterialSelect('fine_aggregate', val)} value={String(inputs.selectedFineId) || ''}><SelectTrigger><SelectValue placeholder="Pilih Agregat Halus..."/></SelectTrigger><SelectContent>{activeProperties.fineAggregates.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}</SelectContent></Select>
                                    <AddMaterialDialog onMaterialAdded={refresh} />
                                </div>
                            </div>
                            <div>
                                <Label>Agregat Kasar</Label>
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={val => handleMaterialSelect('coarse_aggregate', val)} value={String(inputs.selectedCoarseId) || ''}><SelectTrigger><SelectValue placeholder="Pilih Agregat Kasar..."/></SelectTrigger><SelectContent>{activeProperties.coarseAggregates.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}</SelectContent></Select>
                                    <AddMaterialDialog onMaterialAdded={refresh} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 border-l pl-6">
                            <h4 className="font-semibold">Properti Manual</h4>
                            <p className="text-xs text-muted-foreground">Nilai di bawah ini akan digunakan dalam perhitungan. Jika ada peringatan, nilai tidak cocok dengan data material aktif.</p>
                            
                            <ValidatedInput 
                                label="Modulus Kehalusan Pasir (FM)" 
                                value={inputs.finenessModulus} 
                                onChange={e => handleInputChange('finenessModulus', e.target.value)}
                                warningText={mismatches.finenessModulus}
                                onSync={() => handleSyncProperty('finenessModulus')}
                            />
                            <ValidatedInput 
                                label="Berat Isi Ag. Kasar (kg/m³)" 
                                value={inputs.dryRoddedWeightCoarse} 
                                onChange={e => handleInputChange('dryRoddedWeightCoarse', e.target.value)}
                                warningText={mismatches.dryRoddedWeightCoarse}
                                onSync={() => handleSyncProperty('dryRoddedWeightCoarse')}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 3: Hasil Perhitungan Job Mix</CardTitle>
                        <CardDescription>Berikut adalah hasil perhitungan proporsi campuran berdasarkan input Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!results ? (
                            <div className="text-center py-12 text-muted-foreground"><Beaker className="mx-auto h-12 w-12 mb-4" /><p>Hasil perhitungan akan ditampilkan di sini setelah Anda menekan tombol "Hitung".</p></div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-3 text-base">Parameter Kunci</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><ResultCard title="Kuat Tekan Target (f'cr)" data={results.fcr.toFixed(2)} unit="MPa" icon={<ChevronsRight size={22}/>} /><ResultCard title="Faktor Air/Semen (FAS)" data={results.wcRatio.toFixed(2)} unit="" icon={<Droplet size={22}/>} /></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3 text-base">Proporsi per 1 m³ (Terkoreksi)</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><ResultCard title="Semen" data={results.cementContent.toFixed(2)} unit="kg" icon={<Package size={22}/>} /><ResultCard title="Air Koreksi" data={results.correctedWater.toFixed(2)} unit="kg" icon={<Droplet size={22}/>} /><ResultCard title="Ag. Kasar Lembab" data={results.correctedCoarseWeight.toFixed(2)} unit="kg" icon={<Component size={22}/>} /><ResultCard title="Ag. Halus Lembab" data={results.correctedFineWeight.toFixed(2)} unit="kg" icon={<Waves size={22}/>} /></div>
                                </div>
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5"/>Kurva Gradasi Gabungan</CardTitle><CardDescription>Visualisasi gradasi gabungan berdasarkan proporsi berat SSD.</CardDescription></CardHeader>
                                    <CardContent>
                                        <CombinedGradationChart chartRef={chartRef} fineAggregate={activeProperties.fineAggregates.find(m => m.id === parseInt(inputs.selectedFineId))} coarseAggregate={activeProperties.coarseAggregates.find(m => m.id === parseInt(inputs.selectedCoarseId))} mixProportions={results} />
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between items-center mt-6">
                <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Button>
                <div className="flex items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600 flex items-center"><AlertTriangle className="mr-1 h-4 w-4" /> Perubahan belum disimpan</span>}
                    {step < 3 && (<Button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && !validation.isStep1Valid) || (step === 2 && !validation.isStep2Valid)}>Berikutnya <ArrowRight className="ml-2 h-4 w-4" /></Button>)}
                    {step === 2 && (<Button onClick={handleCalculate} disabled={!validation.isStep2Valid || !trial}><Beaker className="mr-2 h-4 w-4" /> Hitung</Button>)}
                    {step === 3 && (<Button onClick={() => handleSaveDesign()} disabled={!results || !trial}>{isDirty ? <Save className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />} {isDirty ? 'Simpan Perubahan' : 'Tersimpan'}</Button>)}
                </div>
            </div>
        </div>
    );
}
