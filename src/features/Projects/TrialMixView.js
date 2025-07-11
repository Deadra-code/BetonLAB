// Lokasi file: src/features/Projects/TrialMixView.js

import React, { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import JobMixDesign from './JobMixDesign';
import CompressiveStrengthTest from './CompressiveStrengthTest';
import { Beaker, FileText, Notebook, TrendingUp, FileSignature } from 'lucide-react'; // BARU: Mengganti FileArchive dengan FileSignature
import { useTrials } from '../../hooks/useTrials';
import Breadcrumb from '../../components/ui/breadcrumb';
import { NotesTab } from './NotesTab';
import QualityControlChart from './QualityControlChart';
import { useConcreteTests } from '../../hooks/useConcreteTests';
import { Button } from '../../components/ui/button';

// PERUBAHAN: Menerima prop onNavigateToReportBuilder
export default function TrialMixView({ trial, onBack, apiReady, onNavigateToReportBuilder }) {
    const strengthChartRef = useRef(null);
    const sqcChartRef = useRef(null);
    const gradationChartRef = useRef(null);

    const { updateTrial } = useTrials(trial?.project_id);
    const { tests } = useConcreteTests(trial?.id);

    const breadcrumbPaths = [
        { label: 'Manajemen Proyek', onClick: onBack },
        { label: trial.projectName, onClick: onBack },
        { label: trial.trial_name },
    ];

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
            <header className="p-6 border-b bg-card space-y-3">
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">{trial.trial_name}</h2>
                    {/* PERUBAHAN: Mengganti ReportingHubDialog dengan Button biasa */}
                    <Button 
                        variant="outline" 
                        onClick={() => onNavigateToReportBuilder({ 
                            project: { id: trial.project_id, projectName: trial.projectName }, 
                            trial: trial 
                        })}
                    >
                        <FileSignature className="mr-2 h-4 w-4" /> Buat Laporan Trial
                    </Button>
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
                    <JobMixDesign trial={trial} onSave={updateTrial} apiReady={apiReady} chartRef={gradationChartRef} />
                </TabsContent>
                <TabsContent value="testing" className="p-6 flex-grow">
                    <CompressiveStrengthTest trial={trial} chartRef={strengthChartRef} />
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
