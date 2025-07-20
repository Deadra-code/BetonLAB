// src/features/Formulas/FormulaManagerPage.jsx
// DESKRIPSI: Implementasi "Manajemen Rumus Terpadu".
// Menggabungkan mode terpandu dan lanjutan menjadi satu dasbor yang intuitif dan komprehensif.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { produce } from 'immer';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Loader2, Save, History, RotateCcw, CheckCircle, Pencil } from 'lucide-react';
import { useFormulas } from '../../hooks/useFormulas';
import { useAuthStore } from '../../hooks/useAuth';
import { useNotifier } from '../../hooks/useNotifier';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';
import * as api from '../../api/electronAPI';
// PERBAIKAN FINAL: Menggunakan sintaks 'import * as' untuk interoperabilitas modul yang lebih baik
import * as defaultFormulasModule from '../../data/defaultFormulas';
const defaultFormulas = defaultFormulasModule.default;


// Impor komponen editor dari direktori components
import { FcrSettings } from './components/FcrSettings';
import { WcRatioSettings } from './components/WcRatioSettings';
import { WaterAirSettings } from './components/WaterAirSettings';
import { CoarseAggSettings } from './components/CoarseAggSettings';
import { LivePreviewPanel } from './components/LivePreviewPanel';
import { FormulaHistoryDialog } from './components/FormulaHistoryDialog';

// Helper untuk membandingkan formula dengan nilai default
const isFormulaModified = (formula) => {
    const defaultFormula = defaultFormulas.find(f => f.formula_key === formula.formula_key);
    if (!defaultFormula) return false; // Jika tidak ada default, anggap tidak dimodifikasi
    // Perbandingan harus menangani string JSON yang mungkin memiliki spasi berbeda
    if (formula.formula_type === 'json_table') {
        try {
            return JSON.stringify(JSON.parse(formula.formula_value)) !== JSON.stringify(JSON.parse(defaultFormula.formula_value));
        } catch (e) {
            return true; // Jika JSON tidak valid, anggap dimodifikasi
        }
    }
    return formula.formula_value.replace(/\s/g, '') !== defaultFormula.formula_value.replace(/\s/g, '');
};

// Komponen Navigasi di Kolom Kiri
const NavigationPanel = ({ formulaGroups, refs }) => {
    const scrollToRef = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="space-y-4">
            {formulaGroups.map(group => (
                <Card key={group.title}>
                    <CardHeader>
                        <CardTitle className="text-base">{group.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {group.formulas.map(formula => {
                            const isModified = isFormulaModified(formula);
                            return (
                                <Button
                                    key={formula.id}
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                    onClick={() => scrollToRef(refs[formula.formula_key])}
                                >
                                    {isModified ? (
                                        <Pencil className="mr-2 h-4 w-4 text-yellow-500" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    )}
                                    {formula.formula_name}
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// Komponen untuk formula Read-Only
const ReadOnlyFormulaCard = ({ formula }) => (
    <Card className="bg-muted/30">
        <CardHeader>
            <CardTitle className="text-lg">{formula.formula_name}</CardTitle>
            <CardDescription>{formula.notes}</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm font-semibold mb-2">Ekspresi Rumus:</p>
            <pre className="whitespace-pre-wrap bg-background p-3 rounded-md text-sm font-mono border">
                <code>{formula.formula_value}</code>
            </pre>
        </CardContent>
    </Card>
);

export default function FormulaManagerPage({ apiReady }) {
    const { user } = useAuthStore();
    const { formulas, loading, updateFormula, refreshFormulas } = useFormulas(apiReady);
    const [localFormulas, setLocalFormulas] = useState(formulas);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const { notify } = useNotifier();

    // Refs untuk scrolling
    const formulaRefs = useRef({});

    useEffect(() => {
        setLocalFormulas(formulas);
        setIsDirty(false);
    }, [formulas]);

    useBeforeUnload(isDirty, "Anda memiliki perubahan formula yang belum disimpan. Yakin ingin keluar?");

    const handleFormulaChange = (key, value) => {
        setLocalFormulas(produce(draft => {
            if(draft[key]) {
                draft[key].formula_value = value;
            }
        }));
        setIsDirty(true);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        const updatePromises = Object.values(localFormulas).map(formula => {
            const originalFormula = formulas[formula.formula_key];
            if (originalFormula && originalFormula.formula_value !== formula.formula_value) {
                return updateFormula({ id: formula.id, formula_value: formula.formula_value, userId: user.id });
            }
            return Promise.resolve();
        });

        await Promise.all(updatePromises);
        await refreshFormulas();
        setIsSaving(false);
        setIsDirty(false);
        notify.success("Semua perubahan formula berhasil disimpan.");
    };
    
    const handleResetFormula = async (formulaKey) => {
        if (window.confirm(`Anda yakin ingin mengembalikan formula ini ke nilai default SNI? Perubahan yang belum disimpan akan hilang.`)) {
            try {
                await api.resetFormulaToDefault({ formulaKey, userId: user.id });
                await refreshFormulas();
                notify.success("Formula berhasil dikembalikan ke default.");
            } catch (error) {
                notify.error(`Gagal mereset: ${error.message}`);
            }
        }
    };

    const formulaGroups = useMemo(() => {
        const allFormulas = Object.values(localFormulas);
        if (allFormulas.length === 0) return [];

        // Inisialisasi refs
        allFormulas.forEach(f => {
            if (!formulaRefs.current[f.formula_key]) {
                formulaRefs.current[f.formula_key] = React.createRef();
            }
        });

        return [
            {
                title: 'Parameter Perhitungan Utama',
                formulas: allFormulas.filter(f => f.formula_key === 'fcr_formula' && f.is_editable)
            },
            {
                title: 'Tabel Data SNI',
                formulas: allFormulas.filter(f => f.formula_type === 'json_table' && f.is_editable)
            },
            {
                title: 'Rumus Turunan',
                formulas: allFormulas.filter(f => !f.is_editable)
            }
        ];
    }, [localFormulas]);

    const renderEditableComponent = (formula) => {
        switch (formula.formula_key) {
            case 'fcr_formula':
                return <FcrSettings formula={formula} onFormulaChange={handleFormulaChange} />;
            case 'wc_ratio_table':
                return <WcRatioSettings formula={formula} onFormulaChange={handleFormulaChange} />;
            case 'water_air_table':
                return <WaterAirSettings formula={formula} onFormulaChange={handleFormulaChange} />;
            case 'coarse_agg_vol_table':
                return <CoarseAggSettings formula={formula} onFormulaChange={handleFormulaChange} />;
            default:
                return null;
        }
    };

    if (loading && Object.keys(localFormulas).length === 0) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="mb-6 flex-shrink-0 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Rumus & Perhitungan</h1>
                    <p className="text-muted-foreground max-w-3xl mt-2">
                        Sesuaikan parameter, konstanta, dan tabel data yang digunakan dalam semua perhitungan mix design sesuai standar laboratorium Anda.
                    </p>
                </div>
                <Button onClick={handleSaveAll} disabled={!isDirty || isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Semua Perubahan
                </Button>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-8 items-start min-h-0">
                {/* Kolom Kiri: Navigasi */}
                <aside className="lg:col-span-1 lg:sticky top-6">
                    <NavigationPanel formulaGroups={formulaGroups} refs={formulaRefs.current} />
                </aside>

                {/* Kolom Tengah: Konten Utama */}
                <ScrollArea className="lg:col-span-2 h-[calc(100vh-220px)]">
                    <main className="space-y-8 pr-4">
                        {formulaGroups.map(group => (
                            <section key={group.title}>
                                <h2 className="text-2xl font-semibold border-b pb-2 mb-6">{group.title}</h2>
                                <div className={group.title === 'Rumus Turunan' ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : "space-y-6"}>
                                    {group.formulas.map(formula => (
                                        <div key={formula.id} ref={formulaRefs.current[formula.formula_key]}>
                                            {formula.is_editable ? (
                                                <div className="relative group">
                                                    {renderEditableComponent(formula)}
                                                    <div className="absolute top-4 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <FormulaHistoryDialog
                                                            formulaId={formula.id}
                                                            formulaName={formula.formula_name}
                                                            trigger={<Button variant="ghost" size="sm"><History className="mr-2 h-4 w-4" /> Riwayat</Button>}
                                                        />
                                                        <Button variant="ghost" size="sm" onClick={() => handleResetFormula(formula.formula_key)}>
                                                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <ReadOnlyFormulaCard formula={formula} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </main>
                </ScrollArea>

                {/* Kolom Kanan: Umpan Balik */}
                <aside className="lg:col-span-1 lg:sticky top-6">
                    <LivePreviewPanel formulas={localFormulas} />
                </aside>
            </div>
        </div>
    );
}
