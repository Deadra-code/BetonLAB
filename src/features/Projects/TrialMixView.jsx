// ========================================================================
// Lokasi file: src/features/Projects/TrialMixView.jsx
// Implementasi: Rancangan #5 - "Satu-Klik" Laporan Komposisi Awal
// Deskripsi: Menambahkan tombol "Cetak Komposisi Awal" yang memicu
// pembuatan PDF sederhana dan cepat untuk dikirim ke rekanan.
// ========================================================================
import React, { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import JobMixDesign from './JobMixDesign.jsx';
import CompressiveStrengthTest from './CompressiveStrengthTest.jsx';
import { Beaker, FileText, Notebook, TrendingUp, FileSignature, Target, Droplets, Book, Printer } from 'lucide-react';
import { useTrials } from '../../hooks/useTrials.js';
import Breadcrumb from '../../components/ui/breadcrumb.jsx';
import { NotesTab } from './NotesTab.jsx';
import QualityControlChart from './QualityControlChart.jsx';
import { useConcreteTests } from '../../hooks/useConcreteTests.js';
import { Button } from '../../components/ui/button';
import { generateInitialCompositionPdf } from '../../utils/pdfGenerator.jsx'; // Impor fungsi baru
import { useSettings } from '../../hooks/useSettings.js'; // Impor untuk mendapatkan data lab
import { useNotifier } from '../../hooks/useNotifier.js'; // Impor untuk notifikasi

const InfoHeaderCard = ({ label, value, unit, icon }) => (
    <div className="flex items-center p-3 bg-muted/50 rounded-lg">
        <div className="mr-4 text-primary">
            {icon}
        </div>
        <div>
            <span className="text-xs text-muted-foreground">{label}</span>
            <p className="text-base font-bold">{value || '-'} <span className="text-sm font-normal text-muted-foreground">{unit}</span></p>
        </div>
    </div>
);

export default function TrialMixView({ trial, onBack, apiReady, onNavigateToReportBuilder, onNavigateToReception }) {
    const strengthChartRef = useRef(null);
    const sqcChartRef = useRef(null);
    const gradationChartRef = useRef(null);

    const { updateTrial } = useTrials(trial?.project_id);
    const { tests } = useConcreteTests(trial?.id);
    const { settings } = useSettings(apiReady); // Dapatkan settings untuk info lab
    const { notify } = useNotifier();

    const breadcrumbPaths = [
        { label: 'Manajemen Proyek', onClick: onBack },
        { label: trial.projectName, onClick: onBack },
        { label: trial.trial_name },
    ];

    // --- FUNGSI BARU untuk Laporan Cepat ---
    const handleQuickReport = async () => {
        if (!trial.design_result) {
            notify.error("Data hasil perhitungan JMD tidak tersedia.");
            return;
        }
        try {
            await generateInitialCompositionPdf({ trial, settings });
            notify.success("Laporan Komposisi Awal berhasil dibuat.");
        } catch (error) {
            notify.error(`Gagal membuat PDF: ${error.message}`);
        }
    };

    if (!trial) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-background">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Tidak Ada Trial Mix yang Dipilih</h3>
                <p className="text-muted-foreground">Silakan kembali dan pilih sebuah trial mix.</p>
            </div>
        );
    }
    return (
        <div className="h-full flex flex-col bg-background">
            <header className="p-6 border-b bg-card space-y-4">
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">{trial.trial_name}</h2>
                    <div className="flex gap-2">
                        {/* Tombol Laporan Cepat Baru */}
                        <Button variant="outline" onClick={handleQuickReport}>
                            <Printer className="mr-2 h-4 w-4" /> Cetak Komposisi Awal
                        </Button>
                        <Button 
                            onClick={() => onNavigateToReportBuilder({ 
                                project: { id: trial.project_id, projectName: trial.projectName }, 
                                trial: trial 
                            })}
                        >
                            <FileSignature className="mr-2 h-4 w-4" /> Buat Laporan Lengkap
                        </Button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <InfoHeaderCard label="f'c Rencana" value={trial.design_input?.fc} unit="MPa" icon={<Book size={24} />} />
                    <InfoHeaderCard label="f'cr Target" value={trial.design_result?.fcr?.toFixed(2)} unit="MPa" icon={<Target size={24} />} />
                    <InfoHeaderCard label="FAS Hasil" value={trial.design_result?.wcRatio?.toFixed(2)} unit="" icon={<Droplets size={24} />} />
                </div>
            </header>
            
            <Tabs defaultValue="design" className="w-full flex-grow flex flex-col">
                <div className="border-b">
                    <TabsList className="m-4">
                        <TabsTrigger value="design"><Beaker className="mr-2 h-4 w-4" />Rencana Campuran</TabsTrigger>
                        <TabsTrigger value="testing"><FileText className="mr-2 h-4 w-4" />Manajemen Benda Uji</TabsTrigger>
                        <TabsTrigger value="quality_control"><TrendingUp className="mr-2 h-4 w-4" />Kontrol Kualitas</TabsTrigger>
                        <TabsTrigger value="notes"><Notebook className="mr-2 h-4 w-4" />Catatan</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="design" className="p-6 flex-grow">
                    <JobMixDesign trial={trial} onSave={updateTrial} apiReady={apiReady} chartRef={gradationChartRef} onNavigateToReception={onNavigateToReception} />
                </TabsContent>
                <TabsContent value="testing" className="p-6 flex-grow">
                    <CompressiveStrengthTest trial={trial} chartRef={strengthChartRef} apiReady={apiReady} />
                </TabsContent>
                <TabsContent value="quality_control" className="p-6 flex-grow">
                    <QualityControlChart tests={tests} targetStrength={trial?.design_result?.fcr} chartRef={sqcChartRef} />
                </TabsContent>
                <TabsContent value="notes" className="flex-grow">
                    <NotesTab trial={trial} onSave={updateTrial} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
