// src/features/Formulas/FormulaManagerPage.jsx
// DESKRIPSI: UI/UX ditingkatkan secara signifikan dengan menggunakan Tabs untuk mengorganisir formula,
// menyelesaikan masalah double scrollbar, dan mengganti editor JSON mentah
// dengan editor tabel interaktif yang lebih ramah pengguna.

import React, { useState, useEffect, useMemo } from 'react';
import { useFormulas } from '../../hooks/useFormulas';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Loader2, Save, HelpCircle, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { useNotifier } from '../../hooks/useNotifier';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Komponen baru untuk mengedit tabel JSON secara visual
const JsonTableEditor = ({ jsonString, onChange, formulaKey }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        try {
            const parsedData = JSON.parse(jsonString);
            // Mengubah objek menjadi array {key, value} untuk rendering
            const arrayData = Object.entries(parsedData).map(([key, value]) => ({
                key,
                value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
            }));
            setData(arrayData);
        } catch (e) {
            console.error("Error parsing JSON for table editor:", e);
            setData([]);
        }
    }, [jsonString]);

    const handleValueChange = (index, newValue) => {
        const newData = [...data];
        newData[index].value = newValue;
        setData(newData);
        
        // Mengubah kembali ke format objek JSON sebelum memanggil onChange
        const newJsonObj = newData.reduce((acc, item) => {
            try {
                // Coba parse value jika itu adalah objek/angka, jika tidak, simpan sebagai string
                acc[item.key] = JSON.parse(item.value);
            } catch {
                acc[item.key] = item.value;
            }
            return acc;
        }, {});
        onChange(JSON.stringify(newJsonObj, null, 2));
    };
    
    // Beberapa tabel memiliki kunci yang tetap (misalnya, ukuran agregat)
    const areKeysEditable = !['water_air_table', 'coarse_agg_vol_table'].includes(formulaKey);

    return (
        <div className="border rounded-lg p-2 bg-muted/20">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[120px]">Kunci</TableHead>
                        <TableHead>Nilai</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Input
                                    value={row.key}
                                    disabled={!areKeysEditable}
                                    readOnly
                                    onChange={() => {}}
                                    className="font-mono text-xs h-8 bg-white"
                                />
                            </TableCell>
                            <TableCell>
                                {typeof row.value === 'string' && row.value.includes('{') ? (
                                    <Textarea
                                        value={row.value}
                                        onChange={(e) => handleValueChange(index, e.target.value)}
                                        className="font-mono text-xs"
                                        rows={4}
                                    />
                                ) : (
                                    <Input
                                        value={row.value}
                                        onChange={(e) => handleValueChange(index, e.target.value)}
                                        className="font-mono text-xs h-8"
                                        type="text"
                                    />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};


const FormulaCard = ({ formula, onSave, isSaving }) => {
    const [value, setValue] = useState(formula.formula_value);
    const { notify } = useNotifier();

    useEffect(() => {
        setValue(formula.formula_value);
    }, [formula.formula_value]);

    const handleSave = () => {
        if (formula.formula_type === 'json_table') {
            try {
                JSON.parse(value);
            } catch (e) {
                notify.error(`Sintaks JSON tidak valid untuk "${formula.formula_name}". Perubahan dibatalkan.`);
                setValue(formula.formula_value);
                return;
            }
        }
        onSave(formula.id, value);
    };

    const variables = JSON.parse(formula.variables || '[]');
    const isDirty = value !== formula.formula_value;

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
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="flex-shrink-0">
                                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs z-50">
                                <h4 className="font-bold mb-2">Panduan Penggunaan</h4>
                                {variables.length > 0 && (
                                    <>
                                        <p className="text-xs mb-1">Variabel yang tersedia:</p>
                                        <ul className="list-disc list-inside text-xs space-y-1">
                                            {variables.map(v => <li key={v.name}><strong>{v.name}</strong>: {v.desc}</li>)}
                                        </ul>
                                    </>
                                )}
                                {formula.formula_type === 'json_table' && (
                                     <p className="text-xs mt-2">Format harus berupa JSON yang valid.</p>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <Label htmlFor={`formula-${formula.id}`} className="sr-only">Nilai Formula</Label>
                {formula.formula_type === 'expression' ? (
                    <Input
                        id={`formula-${formula.id}`}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={!formula.is_editable}
                        className="font-mono"
                    />
                ) : (
                    <JsonTableEditor 
                        jsonString={value} 
                        onChange={setValue}
                        formulaKey={formula.formula_key}
                    />
                )}
            </CardContent>
            {formula.is_editable ? (
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setValue(formula.formula_value)} disabled={!isDirty}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Batal
                    </Button>
                    <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan
                    </Button>
                </CardFooter>
            ) : null}
        </Card>
    );
};

export default function FormulaManagerPage({ apiReady }) {
    const { formulas, loading, updateFormula } = useFormulas(apiReady);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveFormula = async (id, value) => {
        setIsSaving(true);
        await updateFormula({ id, formula_value: value });
        setIsSaving(false);
    };

    const formulaList = Object.values(formulas);

    const expressionFormulas = formulaList.filter(f => f.formula_type === 'expression' && f.is_editable);
    const tableFormulas = formulaList.filter(f => f.formula_type === 'json_table' && f.is_editable);
    const readOnlyFormulas = formulaList.filter(f => !f.is_editable);

    if (loading && formulaList.length === 0) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold">Manajemen Rumus</h1>
                <p className="text-muted-foreground max-w-3xl mt-2">
                    Sesuaikan formula dan konstanta perhitungan yang digunakan di seluruh aplikasi. Perubahan yang disimpan di sini akan langsung memengaruhi semua perhitungan Job Mix Design baru.
                </p>
            </header>
            
            <Tabs defaultValue="expressions" className="flex-grow flex flex-col">
                <TabsList className="mb-4">
                    <TabsTrigger value="expressions">Formula Ekspresi</TabsTrigger>
                    <TabsTrigger value="tables">Tabel Data Perhitungan</TabsTrigger>
                    <TabsTrigger value="readonly">Rumus Turunan (Read-Only)</TabsTrigger>
                </TabsList>
                <TabsContent value="expressions" className="flex-grow overflow-y-auto p-1">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {expressionFormulas.map(formula => (
                            <FormulaCard key={formula.id} formula={formula} onSave={handleSaveFormula} isSaving={isSaving} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="tables" className="flex-grow overflow-y-auto p-1">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {tableFormulas.map(formula => (
                            <FormulaCard key={formula.id} formula={formula} onSave={handleSaveFormula} isSaving={isSaving} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="readonly" className="flex-grow overflow-y-auto p-1">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {readOnlyFormulas.map(formula => (
                            <FormulaCard key={formula.id} formula={formula} onSave={handleSaveFormula} isSaving={isSaving} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
