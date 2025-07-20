// src/features/Formulas/FormulaAdvancedPage.jsx
// DESKRIPSI: Ini adalah UI "Mode Lanjutan" yang berisi editor kartu formula mentah.
// Kode ini dipindahkan dari versi lama FormulaManagerPage.jsx.

import React, { useState, useEffect } from 'react';
import { useFormulas } from '../../hooks/useFormulas';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Loader2, Save, HelpCircle, RotateCcw, Undo2, History, Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { useNotifier } from '../../hooks/useNotifier';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import * as api from '../../api/electronAPI';
import { useAuthStore } from '../../hooks/useAuth';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';

const isValidJson = (str) => {
    try { JSON.parse(str); return true; } catch (e) { return false; }
};

const JsonEditModal = ({ value, onSave, trigger }) => {
    const [localValue, setLocalValue] = useState(value);
    const [error, setError] = useState('');

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleSave = () => {
        if (isValidJson(localValue)) {
            onSave(localValue);
        } else {
            setError('Sintaks JSON tidak valid. Tidak dapat menyimpan.');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Edit JSON</DialogTitle></DialogHeader>
                <Textarea value={localValue} onChange={(e) => setLocalValue(e.target.value)} className="font-mono text-xs h-96" />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>Batal</Button>
                    <Button onClick={handleSave}>Simpan Perubahan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const JsonTableEditor = ({ jsonString, onChange, formulaKey }) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isValidJson(jsonString)) { setError('Sintaks JSON tidak valid.'); return; }
        setError('');
        try {
            const parsedData = JSON.parse(jsonString);
            const arrayData = Object.entries(parsedData).map(([key, value]) => ({ key, value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value) }));
            setData(arrayData);
        } catch (e) { setError("Gagal mem-parsing data JSON."); }
    }, [jsonString]);

    const handleValueChange = (index, newValue) => {
        const newData = [...data];
        newData[index].value = newValue;
        setData(newData);
        const newJsonObj = newData.reduce((acc, item) => {
            try { acc[item.key] = JSON.parse(item.value); } catch { acc[item.key] = item.value; }
            return acc;
        }, {});
        onChange(JSON.stringify(newJsonObj, null, 2));
    };
    
    return (
        <div className="border rounded-lg p-2 bg-muted/20">
            <Table>
                <TableHeader><TableRow><TableHead className="w-[120px]">Kunci</TableHead><TableHead>Nilai</TableHead></TableRow></TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell><Input value={row.key} disabled readOnly className="font-mono text-xs h-8 bg-white" /></TableCell>
                            <TableCell className="flex items-center gap-2">
                                {typeof row.value === 'string' && row.value.trim().startsWith('{') ? (
                                    <>
                                        <Textarea value={row.value} onChange={(e) => handleValueChange(index, e.target.value)} className="font-mono text-xs flex-grow" rows={4} />
                                        <JsonEditModal value={row.value} onSave={(newValue) => handleValueChange(index, newValue)} trigger={<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>} />
                                    </>
                                ) : (
                                    <Input value={row.value} onChange={(e) => handleValueChange(index, e.target.value)} className="font-mono text-xs h-8" type="text" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {error && <p className="text-xs text-destructive p-2">{error}</p>}
        </div>
    );
};

const FormulaCard = ({ formula, onSave, onReset, isSaving, onDirtyChange }) => {
    const [value, setValue] = useState(formula.formula_value);
    const [error, setError] = useState('');
    const { notify } = useNotifier();

    useEffect(() => {
        setValue(formula.formula_value);
    }, [formula]);

    const isDirty = value !== formula.formula_value;
    useEffect(() => {
        onDirtyChange(isDirty);
    }, [isDirty, onDirtyChange]);

    const handleValueChange = (newValue) => {
        setValue(newValue);
        if (formula.formula_type === 'json_table' && !isValidJson(newValue)) {
            setError('Sintaks JSON tidak valid.');
        } else {
            setError('');
        }
    };

    const handleSave = () => {
        if (error) { notify.error(`Tidak dapat menyimpan: ${error}`); return; }
        onSave(formula.id, value);
    };

    const handleReset = async () => {
        if (window.confirm(`Anda yakin ingin mengembalikan formula "${formula.formula_name}" ke nilai default?`)) {
            await onReset(formula.formula_key);
        }
    };
    
    const variables = JSON.parse(formula.variables || '[]');

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{formula.formula_name}</CardTitle>
                        <CardDescription>{formula.notes}</CardDescription>
                    </div>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild><Button variant="ghost" size="icon" className="flex-shrink-0"><HelpCircle className="h-5 w-5 text-muted-foreground" /></Button></TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs z-50">
                                <h4 className="font-bold mb-2">Panduan Penggunaan</h4>
                                {variables.length > 0 && <ul className="list-disc list-inside text-xs space-y-1">{variables.map(v => <li key={v.name}><strong>{v.name}</strong>: {v.desc}</li>)}</ul>}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <Label htmlFor={`formula-${formula.id}`} className="sr-only">Nilai Formula</Label>
                {formula.formula_type === 'expression' ? (
                    <Input id={`formula-${formula.id}`} value={value} onChange={(e) => handleValueChange(e.target.value)} disabled={!formula.is_editable} className="font-mono" />
                ) : (
                    <JsonTableEditor jsonString={value} onChange={handleValueChange} formulaKey={formula.formula_key} />
                )}
                {error && <Alert variant="destructive" className="mt-2 text-xs"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            </CardContent>
            {formula.is_editable && (
                <CardFooter className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleReset}><Undo2 className="mr-2 h-4 w-4" /> Default</Button>
                        <Button variant="ghost" size="sm" disabled><History className="mr-2 h-4 w-4" /> Riwayat</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => handleValueChange(formula.formula_value)} disabled={!isDirty}><RotateCcw className="mr-2 h-4 w-4" /> Batal</Button>
                        <Button onClick={handleSave} disabled={!isDirty || isSaving || !!error}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
};

export default function FormulaAdvancedPage({ apiReady }) {
    const { user } = useAuthStore();
    const { formulas, loading, updateFormula, refreshFormulas } = useFormulas(apiReady);
    const [isSaving, setIsSaving] = useState(null);
    const [dirtyCards, setDirtyCards] = useState({});

    const isAnyCardDirty = Object.values(dirtyCards).some(isDirty => isDirty);
    useBeforeUnload(isAnyCardDirty, "Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?");

    const handleDirtyChange = (formulaId, isDirty) => {
        setDirtyCards(prev => ({ ...prev, [formulaId]: isDirty }));
    };

    const handleSaveFormula = async (id, value) => {
        setIsSaving(id);
        await updateFormula({ id, formula_value: value, userId: user.id });
        setIsSaving(null);
    };

    const handleResetFormula = async (formulaKey) => {
        await api.resetFormulaToDefault(formulaKey);
        await refreshFormulas();
    };

    const formulaList = Object.values(formulas);
    const expressionFormulas = formulaList.filter(f => f.formula_type === 'expression' && f.is_editable);
    const tableFormulas = formulaList.filter(f => f.formula_type === 'json_table' && f.is_editable);
    const readOnlyFormulas = formulaList.filter(f => !f.is_editable);

    return (
        <Tabs defaultValue="expressions" className="flex-grow flex flex-col">
            <TabsList className="mb-4">
                <TabsTrigger value="expressions">Formula Ekspresi</TabsTrigger>
                <TabsTrigger value="tables">Tabel Data Perhitungan</TabsTrigger>
                <TabsTrigger value="readonly">Rumus Turunan (Read-Only)</TabsTrigger>
            </TabsList>
            <TabsContent value="expressions" className="overflow-y-auto p-1">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {expressionFormulas.map(formula => (
                        <FormulaCard key={formula.id} formula={formula} onSave={handleSaveFormula} onReset={handleResetFormula} isSaving={isSaving === formula.id} onDirtyChange={(isDirty) => handleDirtyChange(formula.id, isDirty)} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="tables" className="overflow-y-auto p-1">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {tableFormulas.map(formula => (
                        <FormulaCard key={formula.id} formula={formula} onSave={handleSaveFormula} onReset={handleResetFormula} isSaving={isSaving === formula.id} onDirtyChange={(isDirty) => handleDirtyChange(formula.id, isDirty)} />
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="readonly" className="overflow-y-auto p-1">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {readOnlyFormulas.map(formula => (
                        <FormulaCard key={formula.id} formula={formula} onSave={() => {}} onReset={() => {}} isSaving={false} onDirtyChange={() => {}} />
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
