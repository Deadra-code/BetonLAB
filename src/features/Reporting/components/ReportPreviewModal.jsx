// src/features/Reporting/components/ReportPreviewModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, FileDown } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { ReportDocument, generatePdf } from '../../../utils/pdfGenerator.jsx';
import { useNotifier } from '../../../hooks/useNotifier';
import { CanvasComponent } from '../reportComponents.jsx';

// Komponen tersembunyi untuk merender grafik ke DOM
const ChartRenderer = ({ layout, reportData, apiReady }) => {
    // Pengecekan keamanan untuk memastikan layout adalah array
    if (!Array.isArray(layout)) {
        console.error("ChartRenderer menerima prop layout yang tidak valid:", layout);
        return null;
    }

    const componentsToRender = [];
    const findChartsRecursive = (nodes) => {
        if (!Array.isArray(nodes)) return; // Pengecekan keamanan

        for (const component of nodes) {
            if (['strength-chart', 'sqc-chart', 'combined-gradation-chart'].includes(component.id)) {
                componentsToRender.push(component);
            }
            if (component.children) {
                if (component.id.startsWith('columns-')) {
                    component.children.forEach(col => findChartsRecursive(col));
                } else {
                    findChartsRecursive(component.children);
                }
            }
        }
    };
    
    // Iterasi melalui setiap halaman dalam layout
    layout.forEach(page => {
        if (page) { // Pengecekan keamanan
            if (page.header) findChartsRecursive([page.header]);
            if (page.components) findChartsRecursive(page.components);
            if (page.footer) findChartsRecursive([page.footer]);
        }
    });

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            {componentsToRender.map(component => (
                <div key={component.instanceId} id={`chart-container-${component.instanceId}`} style={{ width: '800px', height: '400px', backgroundColor: 'white', padding: '1rem' }}>
                    <CanvasComponent component={component} reportData={reportData} apiReady={apiReady} />
                </div>
            ))}
        </div>
    );
};


export default function ReportPreviewModal({ isOpen, onOpenChange, reportData, settings, layout, pageSettings, apiReady }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { notify } = useNotifier();

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        try {
            // PERBAIKAN: Menggunakan props `layout` dan `pageSettings` secara langsung.
            await generatePdf({ layout, reportData, settings, pageSettings, notify });
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            notify.error(`Gagal membuat PDF: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Pratinjau & Unduh Laporan</DialogTitle>
                    <DialogDescription>
                        Ini adalah pratinjau dari dokumen PDF yang akan dihasilkan. Gunakan tombol di bawah untuk mengunduh.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow min-h-0 border bg-muted rounded-md">
                    {isOpen && reportData ? (
                        <>
                            {/* PERBAIKAN: Menggunakan prop `layout` secara langsung. */}
                            <ChartRenderer layout={layout} reportData={reportData} apiReady={apiReady} />
                            <PDFViewer width="100%" height="100%" showToolbar={true}>
                                <ReportDocument
                                    layout={layout}
                                    reportData={reportData}
                                    settings={settings}
                                    pageSettings={pageSettings}
                                />
                            </PDFViewer>
                        </>
                    ) : (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="ml-4">Memuat pratinjau...</p>
                        </div>
                    )}
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                    <Button onClick={handleGeneratePdf} disabled={isGenerating || !reportData}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Simpan sebagai PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
