// src/features/Projects/JobMixDesign.jsx
// Deskripsi: Menambahkan penanganan error yang lebih baik untuk memberikan umpan balik
// yang jelas kepada pengguna jika perhitungan gagal karena formula yang tidak valid.

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import ResultCard from '../../components/ResultCard';
import { useActiveMaterialProperties } from '../../hooks/useActiveMaterialProperties';
import { defaultInputs, sniReferenceData } from '../../data/sniData';
import { Loader2, ChevronsRight, Droplet, Wind, Package, Component, Waves, Beaker, ArrowLeft, ArrowRight, Save, BarChart2, BookOpen } from 'lucide-react';
import { useNotifier } from '../../hooks/useNotifier';
import { calculateMixDesign } from '../../utils/concreteCalculator';
import { writeLog } from '../../api/electronAPI';
import { Stepper } from '../../components/ui/Stepper';
import ValidatedInput from '../../components/ui/ValidatedInput';
import HelpTooltip from '../../components/ui/HelpTooltip';
import AddMaterialDialog from '../MaterialTesting/AddMaterialDialog';
import ReferenceLibraryDialog from '../ReferenceLibrary/ReferenceLibraryDialog';
import { useFormulas } from '../../hooks/useFormulas';
import { CombinedGradationChart } from './components/CombinedGradationChart';

export default function JobMixDesign({ trial, onSave, apiReady, chartRef }) {
    const [inputs, setInputs] = useState(defaultInputs);
    const [results, setResults] = useState(null);
    const { activeProperties, loading: propsLoading, refresh } = useActiveMaterialProperties(apiReady);
    const { notify } = useNotifier();
    const [step, setStep] = useState(1);
    const [isDirty, setIsDirty] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { formulas, loading: formulasLoading } = useFormulas(apiReady);

    useEffect(() => {
        if (trial) {
            const designInput = (trial.design_input && Object.keys(trial.design_input).length > 0) ? trial.design_input : defaultInputs;
            const sanitizedInputs = Object.entries(designInput).reduce((acc, [key, value]) => {
                if (key === 'admixture' && (typeof value !== 'object' || value === null)) { acc[key] = { name: '', waterReduction: 0 }; } 
                else { acc[key] = value !== null && value !== undefined ? value : ''; }
                return acc;
            }, {});
            setInputs(sanitizedInputs);
            setResults(trial.design_result && Object.keys(trial.design_result).length > 0 ? trial.design_result : null);
            setIsDirty(false);
        }
    }, [trial]);

    useEffect(() => { if (apiReady) refresh(); }, [apiReady, refresh]);

    const handleInputChange = (field, value) => { setInputs(prev => ({ ...prev, [field]: value })); setIsDirty(true); };
    
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
            if (mat) { 
                selectedMaterialProps = { 
                    sgFine: mat.properties.sg, 
                    absorptionFine: mat.properties.absorption, 
                    moistureFine: mat.properties.moisture, 
                    finenessModulus: mat.properties.fm.toFixed(2), 
                }; 
            }
        } else if (type === 'coarse_aggregate') {
            materialKey = 'selectedCoarseId';
            const mat = activeProperties.coarseAggregates.find(m => m.id === materialId);
            if(mat) { 
                selectedMaterialProps = { 
                    sgCoarse: mat.properties.sg, 
                    absorptionCoarse: mat.properties.absorption, 
                    moistureCoarse: mat.properties.moisture, 
                    dryRoddedWeightCoarse: mat.properties.bulk_density, 
                }; 
            }
        }
        
        const sanitizedProps = Object.entries(selectedMaterialProps).reduce((acc, [key, value]) => { acc[key] = String(value); return acc; }, {});

        setInputs(prev => ({ ...prev, [materialKey]: materialId, ...sanitizedProps }));
        setIsDirty(true);
        notify.success(`Properti untuk ${type.replace(/_/g, ' ')} telah diperbarui.`);
    };
    
    const handleSaveInputsOnly = async () => {
        if (!trial || !isDirty) return;
        setIsSaving(true);
        const numericInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
            if (key === 'admixture') { acc[key] = value; }
            else { const num = parseFloat(value); acc[key] = isNaN(num) ? value : num; }
            return acc;
        }, {});
        await onSave({ ...trial, design_input: numericInputs, design_result: results });
        setIsDirty(false);
        setIsSaving(false);
        notify.success("Perubahan pada input berhasil disimpan.");
    };

    const handleCalculate = async () => {
        if (formulasLoading || Object.keys(formulas).length === 0) {
            notify.error("Data formula belum siap. Mohon tunggu sebentar.");
            return;
        }

        setIsCalculating(true);
        await new Promise(res => setTimeout(res, 300)); 
        try {
            const newResults = calculateMixDesign(inputs, formulas);
            setResults(newResults);
            setStep(3);
            notify.success("Perhitungan berhasil diselesaikan.");
            writeLog('info', `Calculation successful for trial: ${trial.trial_name}`);
            const numericInputs = Object.entries(inputs).reduce((acc, [key, value]) => {
                if (key === 'admixture') { acc[key] = value; }
                else { const num = parseFloat(value); acc[key] = isNaN(num) ? value : num; }
                return acc;
            }, {});
            await onSave({ ...trial, design_input: numericInputs, design_result: newResults });
            setIsDirty(false);
        } catch (e) {
            // === UMPAN BALIK ERROR (Langkah 2 Fase 3) ===
            const errorMessage = `Perhitungan gagal: ${e.message}. Periksa formula terkait di halaman Manajemen Rumus.`;
            notify.error(errorMessage);
            writeLog('error', `Calculation failed for trial: ${trial.trial_name}. Error: ${e.message}`);
        } finally {
            setIsCalculating(false);
        }
    };

    const validation = useMemo(() => {
        const fc = parseFloat(inputs.fc);
        const stdDev = parseFloat(inputs.stdDev);
        const slump = parseFloat(inputs.slump);
        return {
            isStep1Valid: fc > 0 && stdDev >= 0 && slump > 0,
            isStep2Valid: inputs.selectedCementId && inputs.selectedFineId && inputs.selectedCoarseId,
        };
    }, [inputs]);

    const handleStepClick = (targetStep) => {
        if (targetStep < step) {
            setStep(targetStep);
            return;
        }
        if (targetStep === 2 && validation.isStep1Valid) {
            setStep(2);
        }
        if (targetStep === 3 && validation.isStep1Valid && validation.isStep2Valid && results) {
            setStep(3);
        }
    };

    if (propsLoading || formulasLoading) return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    const steps = ["Parameter Desain", "Properti Material", "Hasil Campuran"];

    // ... (Sisa komponen JSX tetap sama)
    return (
        <div className="space-y-6">
            <Stepper 
                steps={steps} 
                currentStep={step} 
                onStepClick={handleStepClick}
                disabledSteps={[
                    ...(step === 1 ? [2, 3] : []),
                    ...(step === 2 && !results ? [3] : [])
                ]}
            />

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 1: Parameter Desain</CardTitle>
                        <CardDescription>Masukkan parameter dasar untuk rencana campuran beton Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <ValidatedInput id="fc" label="Kuat Tekan (f'c)" unit="MPa" value={inputs.fc} onChange={e => handleInputChange('fc', e.target.value)} isValid={parseFloat(inputs.fc) > 0} errorText="Nilai harus lebih dari 0" />
                                <HelpTooltip content={sniReferenceData.fc.content} />
                            </div>
                            <div className="flex items-center">
                                <ValidatedInput id="stdDev" label="Deviasi Standar (S)" unit="MPa" value={inputs.stdDev} onChange={e => handleInputChange('stdDev', e.target.value)} isValid={parseFloat(inputs.stdDev) >= 0} errorText="Nilai tidak boleh negatif" />
                                <HelpTooltip content={sniReferenceData.stdDev.content} />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <ValidatedInput id="slump" label="Slump" unit="mm" value={inputs.slump} onChange={e => handleInputChange('slump', e.target.value)} isValid={parseFloat(inputs.slump) > 0} errorText="Nilai harus lebih dari 0" />
                            <HelpTooltip content={sniReferenceData.slump.content} />
                            <ReferenceLibraryDialog trigger={<Button variant="ghost" size="icon" className="h-8 w-8 ml-1"><BookOpen className="h-4 w-4 text-blue-500" /></Button>} />
                        </div>
                        <div>
                            <div className="flex items-center"><Label>Ukuran Agregat Maksimum</Label><HelpTooltip content={sniReferenceData.maxAggrSize.content} /></div>
                            <Select onValueChange={val => handleInputChange('maxAggrSize', val)} value={String(inputs.maxAggrSize) || ''}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent><SelectItem value="10">10 mm</SelectItem><SelectItem value="12.5">12.5 mm</SelectItem><SelectItem value="20">20 mm</SelectItem><SelectItem value="25">25 mm</SelectItem><SelectItem value="40">40 mm</SelectItem><SelectItem value="50">50 mm</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 2: Properti Material</CardTitle>
                        <CardDescription>Pilih material dari pustaka. Properti akan terisi otomatis dan dapat diubah jika perlu.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                                    <Select onValueChange={val => handleMaterialSelect('fine_aggregate', val)} value={String(inputs.selectedFineId) || 'manual'}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Agregat Halus..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">-- Input Manual --</SelectItem>
                                            {activeProperties.fineAggregates.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <AddMaterialDialog onMaterialAdded={refresh} />
                                </div>
                            </div>
                            <div>
                                <Label>Agregat Kasar</Label>
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={val => handleMaterialSelect('coarse_aggregate', val)} value={String(inputs.selectedCoarseId) || 'manual'}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Agregat Kasar..."/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">-- Input Manual --</SelectItem>
                                            {activeProperties.coarseAggregates.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <AddMaterialDialog onMaterialAdded={refresh} />
                                </div>
                            </div>
                        </div>
                        
                        {(inputs.selectedFineId === null || inputs.selectedCoarseId === null) && (
                            <div className="space-y-4 border-l pl-6">
                                <p className="text-sm font-semibold text-muted-foreground">Properti Manual</p>
                                {inputs.selectedFineId === null && (
                                    <>
                                        <ValidatedInput label="Modulus Kehalusan Pasir (FM)" value={inputs.finenessModulus} onChange={e => handleInputChange('finenessModulus', e.target.value)} />
                                        <ValidatedInput label="Kadar Air Ag. Halus (%)" value={inputs.moistureFine} onChange={e => handleInputChange('moistureFine', e.target.value)} />
                                        <ValidatedInput label="Penyerapan Ag. Halus (%)" value={inputs.absorptionFine} onChange={e => handleInputChange('absorptionFine', e.target.value)} />
                                    </>
                                )}
                                {inputs.selectedCoarseId === null && (
                                     <>
                                        <ValidatedInput label="Berat Isi Ag. Kasar (kg/m³)" value={inputs.dryRoddedWeightCoarse} onChange={e => handleInputChange('dryRoddedWeightCoarse', e.target.value)} />
                                        <ValidatedInput label="Kadar Air Ag. Kasar (%)" value={inputs.moistureCoarse} onChange={e => handleInputChange('moistureCoarse', e.target.value)} />
                                        <ValidatedInput label="Penyerapan Ag. Kasar (%)" value={inputs.absorptionCoarse} onChange={e => handleInputChange('absorptionCoarse', e.target.value)} />
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 3: Hasil Rencana Campuran</CardTitle>
                        <CardDescription>Berikut adalah hasil perhitungan proporsi campuran berdasarkan input Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!results ? (
                            <div className="text-center py-12 text-muted-foreground"><Beaker className="mx-auto h-12 w-12 mb-4" /><p>Hasil perhitungan akan ditampilkan di sini. Kembali ke langkah sebelumnya untuk menghitung.</p></div>
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
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <Button variant="outline" onClick={handleSaveInputsOnly} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    )}
                    {step === 1 && <Button onClick={() => setStep(2)} disabled={!validation.isStep1Valid}>Berikutnya <ArrowRight className="ml-2 h-4 w-4" /></Button>}
                    {step === 2 && (
                        <Button onClick={handleCalculate} disabled={!validation.isStep2Valid || isCalculating}>
                            {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Beaker className="mr-2 h-4 w-4" />}
                            Hitung & Simpan
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
