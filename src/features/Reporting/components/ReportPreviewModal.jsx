import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Loader2, FileDown } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { generatePdf, ReportDocument } from '../../../utils/pdfGenerator'; // Impor yang benar

export default function ReportPreviewModal({ isOpen, onOpenChange, reportData, settings, layout, pageSettings }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        try {
            await generatePdf({ layout, reportData, settings, pageSettings });
        } catch (error) {
            console.error("Failed to generate PDF:", error);
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
                        <PDFViewer width="100%" height="100%" showToolbar={true}>
                            <ReportDocument
                                layout={layout}
                                reportData={reportData}
                                settings={settings}
                                pageSettings={pageSettings}
                            />
                        </PDFViewer>
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
