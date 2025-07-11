import React from 'react';
import { Info, Beaker } from 'lucide-react';
import { sniReferenceData } from '../../data/sniData';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from '../../components/ui/button';

const FormField = ({ id, label, children, unit, helpText, warning, onInfoClick }) => (
    <div className="mb-4 grid w-full items-center gap-1.5">
        <div className="flex items-center">
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            {onInfoClick && (
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={onInfoClick}>
                    <Info size={14} className="text-blue-500" />
                </Button>
            )}
        </div>
        <div className="flex items-center space-x-2">
            {children}
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {warning && <p className="text-xs text-yellow-500">{warning}</p>}
        {helpText && !warning && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
);

// --- BARU: Komponen untuk memilih material ---
const MaterialSelect = ({ label, materialType, materials, selectedId, onSelect, onManualInputChange, manualValue, unit, disabled }) => {
    const filteredMaterials = materials.filter(m => m.material_type === materialType);
    
    return (
        <div className="mb-4 grid w-full items-center gap-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            <Select value={selectedId || 'manual'} onValueChange={(val) => onSelect(materialType, val === 'manual' ? null : parseInt(val))} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="manual">-- Input Manual --</SelectItem>
                    {filteredMaterials.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {selectedId === null && (
                 <div className="flex items-center space-x-2 mt-2">
                    <Input type="number" value={manualValue} onChange={onManualInputChange} placeholder="Nilai manual" />
                    {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
                 </div>
            )}
        </div>
    );
};


const MixDesignForm = ({ inputs, setInputs, validationWarnings, setInfoPopupContent, materials, onMaterialSelect }) => {
    
    const handleInputChange = (field, value) => {
        const path = field.split('.');
        if (path.length > 1) {
            setInputs(prev => ({ ...prev, [path[0]]: { ...prev[path[0]], [path[1]]: value } }));
        } else {
            setInputs(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSelectChange = (field, value) => {
        handleInputChange(field, value);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">1. Parameter Desain</h3>
            <FormField id="fc" label="Kuat Tekan (f'c)" unit="MPa" warning={validationWarnings.fc}>
                <Input type="number" id="fc" value={inputs.fc} onChange={e => handleInputChange('fc', e.target.value)} />
            </FormField>
            <FormField id="stdDev" label="Deviasi Standar (S)" unit="MPa">
                <Input type="number" id="stdDev" value={inputs.stdDev} onChange={e => handleInputChange('stdDev', e.target.value)} />
            </FormField>
            <FormField id="slump" label="Slump" unit="mm" helpText="Contoh: 80-100 mm" warning={validationWarnings.slump} onInfoClick={() => setInfoPopupContent(sniReferenceData.slump)}>
                <Input type="number" id="slump" value={inputs.slump} onChange={e => handleInputChange('slump', e.target.value)} />
            </FormField>
            <FormField id="maxAggrSize" label="Ukuran Agregat Maksimum" onInfoClick={() => setInfoPopupContent(sniReferenceData.maxAggrSize)}>
                <Select value={inputs.maxAggrSize} onValueChange={value => handleSelectChange('maxAggrSize', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 mm</SelectItem>
                        <SelectItem value="12.5">12.5 mm</SelectItem>
                        <SelectItem value="20">20 mm</SelectItem>
                        <SelectItem value="25">25 mm</SelectItem>
                        <SelectItem value="40">40 mm</SelectItem>
                        <SelectItem value="50">50 mm</SelectItem>
                    </SelectContent>
                </Select>
            </FormField>
            <FormField id="finenessModulus" label="Modulus Kehalusan Pasir (FM)">
                 <Select value={inputs.finenessModulus} onValueChange={value => handleSelectChange('finenessModulus', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2.40">2.40</SelectItem>
                        <SelectItem value="2.60">2.60</SelectItem>
                        <SelectItem value="2.80">2.80</SelectItem>
                        <SelectItem value="3.00">3.00</SelectItem>
                    </SelectContent>
                </Select>
            </FormField>
            
            <h3 className="text-lg font-semibold my-4 mt-6 border-b pb-2">2. Properti Material</h3>
            
            {/* --- PERUBAHAN: Menggunakan MaterialSelect --- */}
            <MaterialSelect label="Semen" materialType="cement" materials={materials} selectedId={inputs.selectedCementId} onSelect={onMaterialSelect} 
                onManualInputChange={e => handleInputChange('sgCement', e.target.value)} manualValue={inputs.sgCement} />
            
            <MaterialSelect label="Agregat Kasar (Kerikil)" materialType="coarse_aggregate" materials={materials} selectedId={inputs.selectedCoarseId} onSelect={onMaterialSelect} disabled={true} />
            {inputs.selectedCoarseId === null && (
                 <div className="pl-4 border-l-2 ml-2 mb-4">
                    <FormField label="BJ Ag. Kasar (SSD)"><Input type="number" value={inputs.sgCoarse} onChange={e => handleInputChange('sgCoarse', e.target.value)} /></FormField>
                    <FormField label="Berat Isi Ag. Kasar" unit="kg/m³"><Input type="number" value={inputs.dryRoddedWeightCoarse} onChange={e => handleInputChange('dryRoddedWeightCoarse', e.target.value)} /></FormField>
                    <FormField label="Kadar Air Ag. Kasar" unit="%"><Input type="number" value={inputs.moistureCoarse} onChange={e => handleInputChange('moistureCoarse', e.target.value)} /></FormField>
                    <FormField label="Penyerapan Ag. Kasar" unit="%"><Input type="number" value={inputs.absorptionCoarse} onChange={e => handleInputChange('absorptionCoarse', e.target.value)} /></FormField>
                 </div>
            )}

            <MaterialSelect label="Agregat Halus (Pasir)" materialType="fine_aggregate" materials={materials} selectedId={inputs.selectedFineId} onSelect={onMaterialSelect} disabled={true} />
             {inputs.selectedFineId === null && (
                 <div className="pl-4 border-l-2 ml-2 mb-4">
                    <FormField label="BJ Ag. Halus (SSD)"><Input type="number" value={inputs.sgFine} onChange={e => handleInputChange('sgFine', e.target.value)} /></FormField>
                    <FormField label="Kadar Air Ag. Halus" unit="%"><Input type="number" value={inputs.moistureFine} onChange={e => handleInputChange('moistureFine', e.target.value)} /></FormField>
                    <FormField label="Penyerapan Ag. Halus" unit="%"><Input type="number" value={inputs.absorptionFine} onChange={e => handleInputChange('absorptionFine', e.target.value)} /></FormField>
                 </div>
            )}

            <h3 className="text-lg font-semibold my-4 mt-6 border-b pb-2 flex items-center"><Beaker size={20} className="mr-2"/>3. Bahan Tambah (Admixture)</h3>
            <FormField id="admixtureName" label="Nama Admixture"><Input type="text" id="admixtureName" value={inputs.admixture.name} onChange={e => handleInputChange('admixture.name', e.target.value)} /></FormField>
            <FormField id="admixtureDosage" label="Dosis" unit="% dari berat semen"><Input type="number" id="admixtureDosage" value={inputs.admixture.dosage} onChange={e => handleInputChange('admixture.dosage', e.target.value)} /></FormField>
            <FormField id="waterReduction" label="Pengurangan Air" unit="%" helpText="Persentase pengurangan air."><Input type="number" id="waterReduction" value={inputs.admixture.waterReduction} onChange={e => handleInputChange('admixture.waterReduction', e.target.value)} /></FormField>
        </div>
    );
};

export default MixDesignForm;
