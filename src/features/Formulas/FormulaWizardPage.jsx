// src/features/Formulas/FormulaWizardPage.jsx
// Deskripsi: Komponen utama untuk UI "Wizard Mode" yang baru.

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { FcrSettings } from './components/FcrSettings';
import { WcRatioSettings } from './components/WcRatioSettings';
import { WaterAirSettings } from './components/WaterAirSettings';
import { CoarseAggSettings } from './components/CoarseAggSettings';
import { LivePreviewPanel } from './components/LivePreviewPanel';
import { cn } from '../../lib/utils';

const navItems = [
    { id: 'fcr', label: "Kuat Tekan Target" },
    { id: 'wc_ratio', label: "Faktor Air/Semen" },
    { id: 'water_air', label: "Kebutuhan Air & Udara" },
    { id: 'coarse_agg', label: "Volume Agregat Kasar" },
];

export const FormulaWizardPage = ({ initialFormulas, onSaveAll, isSaving }) => {
    const [activeView, setActiveView] = useState('fcr');
    const [localFormulas, setLocalFormulas] = useState(initialFormulas);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLocalFormulas(initialFormulas);
        setIsDirty(false);
    }, [initialFormulas]);

    const handleFormulaChange = (key, value) => {
        setLocalFormulas(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                formula_value: value
            }
        }));
        setIsDirty(true);
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'fcr':
                return <FcrSettings formula={localFormulas.fcr_formula} onFormulaChange={handleFormulaChange} />;
            case 'wc_ratio':
                return <WcRatioSettings formula={localFormulas.wc_ratio_table} onFormulaChange={handleFormulaChange} />;
            case 'water_air':
                return <WaterAirSettings formula={localFormulas.water_air_table} onFormulaChange={handleFormulaChange} />;
            case 'coarse_agg':
                 return <CoarseAggSettings formula={localFormulas.coarse_agg_vol_table} onFormulaChange={handleFormulaChange} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-end mb-4 flex-shrink-0">
                <Button onClick={() => onSaveAll(localFormulas)} disabled={!isDirty || isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Semua Perubahan
                </Button>
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <aside className="lg:col-span-1 sticky top-6">
                    <nav className="flex flex-col space-y-1">
                        {navItems.map(item => (
                            <Button
                                key={item.id}
                                variant={activeView === item.id ? 'secondary' : 'ghost'}
                                onClick={() => setActiveView(item.id)}
                                className="justify-start"
                            >
                                {item.label}
                            </Button>
                        ))}
                    </nav>
                </aside>

                <main className="lg:col-span-2">
                    {renderActiveView()}
                </main>

                <aside className="lg:col-span-1">
                    <LivePreviewPanel formulas={localFormulas} />
                </aside>
            </div>
        </div>
    );
};
