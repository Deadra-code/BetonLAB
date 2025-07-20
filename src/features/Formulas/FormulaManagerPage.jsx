// src/features/Formulas/FormulaManagerPage.jsx
// DESKRIPSI: Dirombak untuk menjadi pengontrol antara "Wizard Mode" (default)
// dan "Advanced Mode" (tampilan kartu lama).

import React, { useState } from 'react';
import { useFormulas } from '../../hooks/useFormulas';
import { Button } from '../../components/ui/button';
import { Loader2, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import { FormulaWizardPage } from './FormulaWizardPage';
import FormulaAdvancedPage from './FormulaAdvancedPage'; // Komponen lama di-refactor

export default function FormulaManagerPage({ apiReady }) {
    const { user } = useAuthStore();
    const { formulas, loading, updateFormula, refreshFormulas } = useFormulas(apiReady);
    const [mode, setMode] = useState('wizard'); // 'wizard' or 'advanced'
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveAll = async (updatedFormulas) => {
        setIsSaving(true);
        const updatePromises = Object.values(updatedFormulas).map(formula => {
            const originalFormula = Object.values(formulas).find(f => f.id === formula.id);
            if (originalFormula && originalFormula.formula_value !== formula.formula_value) {
                return updateFormula({ id: formula.id, formula_value: formula.formula_value, userId: user.id });
            }
            return Promise.resolve();
        });
        await Promise.all(updatePromises);
        await refreshFormulas();
        setIsSaving(false);
    };

    if (loading && Object.keys(formulas).length === 0) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="mb-6 flex-shrink-0 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Manajemen Rumus</h1>
                    <p className="text-muted-foreground max-w-3xl mt-2">
                        {mode === 'wizard'
                            ? 'Gunakan asisten untuk mengubah parameter perhitungan dengan mudah.'
                            : 'Edit langsung ekspresi dan tabel data JSON untuk kustomisasi penuh.'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => setMode(m => m === 'wizard' ? 'advanced' : 'wizard')}>
                    {mode === 'wizard' ? (
                        <><SlidersHorizontal className="mr-2 h-4 w-4" /> Mode Lanjutan</>
                    ) : (
                        <><ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Asisten</>
                    )}
                </Button>
            </header>

            <div className="flex-grow overflow-y-auto">
                {mode === 'wizard' ? (
                    <FormulaWizardPage 
                        initialFormulas={formulas} 
                        onSaveAll={handleSaveAll}
                        isSaving={isSaving}
                    />
                ) : (
                    <FormulaAdvancedPage 
                        apiReady={apiReady} 
                    />
                )}
            </div>
        </div>
    );
}
