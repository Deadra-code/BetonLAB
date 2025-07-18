// src/features/Reporting/components/builder/property-panels/GeneralPanel.jsx
// Deskripsi: Berisi UI untuk properti umum yang berlaku untuk hampir semua komponen,
// seperti margin, padding, latar, border, dan kondisi tampilan.

import React from 'react';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Button } from '../../../../../components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../../components/ui/collapsible";

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

const ConditionalRenderingPanel = ({ component, onPropertyChange }) => {
    const conditions = component.properties?.conditions || [];
    const availableFields = [
        { value: 'fcr', label: "f'cr Target (MPa)" },
        { value: 'wcRatio', label: 'FAS' },
        { value: 'cementContent', label: 'Kadar Semen (kg/m³)' },
        { value: 'waterContent', label: 'Kadar Air (kg/m³)' },
    ];

    const handleConditionChange = (index, field, value) => {
        const newConditions = [...conditions];
        newConditions[index][field] = value;
        onPropertyChange(component.instanceId, 'properties.conditions', newConditions);
    };

    const addCondition = () => {
        const newConditions = [...conditions, { field: 'fcr', operator: '>', value: '' }];
        onPropertyChange(component.instanceId, 'properties.conditions', newConditions);
    };

    const removeCondition = (index) => {
        const newConditions = conditions.filter((_, i) => i !== index);
        onPropertyChange(component.instanceId, 'properties.conditions', newConditions);
    };

    return (
        <Collapsible>
            <CollapsibleTrigger className="w-full font-semibold text-sm text-left">Kondisi Tampilan</CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-3">
                <p className="text-xs text-muted-foreground">Tampilkan komponen ini hanya jika kondisi berikut terpenuhi.</p>
                {conditions.map((cond, index) => (
                    <div key={index} className="flex items-center gap-1 p-2 border rounded-md">
                        <Select value={cond.field} onValueChange={v => handleConditionChange(index, 'field', v)}>
                            <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{availableFields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={cond.operator} onValueChange={v => handleConditionChange(index, 'operator', v)}>
                            <SelectTrigger className="w-[50px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value=">">&gt;</SelectItem><SelectItem value="<">&lt;</SelectItem><SelectItem value="==">=</SelectItem><SelectItem value="!=">≠</SelectItem></SelectContent>
                        </Select>
                        <Input className="h-8 text-xs" type="number" value={cond.value} onChange={e => handleConditionChange(index, 'value', e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCondition(index)}><X size={14} /></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={addCondition}><PlusCircle size={14} className="mr-2" /> Tambah Kondisi</Button>
            </CollapsibleContent>
        </Collapsible>
    );
};

const GeneralPanel = ({ component, onPropertyChange }) => {
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
            <ConditionalRenderingPanel component={component} onPropertyChange={onPropertyChange} />
        </div>
    );
};

export default GeneralPanel;
