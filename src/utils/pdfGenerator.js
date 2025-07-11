// Lokasi file: src/utils/pdfGenerator.js
// Deskripsi: Memperbarui fungsi generator untuk menerima pengaturan halaman dinamis.

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as api from '../api/electronAPI';
import { toPng } from 'html-to-image';

const PAGE_DIMENSIONS = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
};

const renderChartToImage = async (elementId) => {
    // ... (fungsi ini tetap sama)
    const element = document.getElementById(elementId);
    if (!element) return null;
    try {
        const dataUrl = await toPng(element, { quality: 0.95, backgroundColor: '#ffffff' });
        return dataUrl;
    } catch (error) {
        console.error('Gagal mengubah grafik menjadi gambar:', error);
        return null;
    }
};

const renderers = {
    // ... (semua renderer tetap sama)
    'header': async (doc, yPos, component, reportData, settings) => {
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const PAGE_MARGIN = 15;
        if (settings.logoPath) {
            try {
                const logoBase64 = await api.readFileAsBase64(settings.logoPath);
                if (logoBase64) {
                    const fileExtension = settings.logoPath.split('.').pop().toUpperCase();
                    doc.addImage(`data:image/${fileExtension};base64,${logoBase64}`, fileExtension, PAGE_MARGIN, 10, 20, 20);
                }
            } catch (e) { console.error("Gagal memuat logo:", e); }
        }
        doc.setFontSize(16).setFont(undefined, 'bold');
        doc.text(settings.companyName || 'Laporan Laboratorium Beton', PAGE_MARGIN + 25, 20);
        doc.setDrawColor(0);
        doc.line(PAGE_MARGIN, 35, PAGE_WIDTH - PAGE_MARGIN, 35);
        return 45;
    },
    'jmd-table': async (doc, yPos, component, trialData) => {
        if (!trialData?.design_result) return yPos;
        const { design_result } = trialData;
        const body = [
            ["Kuat Tekan Target (f'cr)", `${design_result.fcr?.toFixed(2) ?? '-'} MPa`],
            ["Faktor Air/Semen (FAS)", design_result.wcRatio?.toFixed(2) ?? '-'],
            ["Semen (Koreksi)", `${design_result.cementContent?.toFixed(2) ?? '-'} kg/m³`],
            ["Air (Koreksi)", `${design_result.correctedWater?.toFixed(2) ?? '-'} kg/m³`],
        ];
        doc.autoTable({ startY: yPos, head: [[`Tabel Job Mix - ${trialData.trial_name}`]], body, theme: 'grid', headStyles: { fillColor: '#3b82f6' } });
        return doc.lastAutoTable.finalY + 5;
    },
    'raw-strength-table': async (doc, yPos, component, trialData) => {
        if (!trialData?.tests || trialData.tests.length === 0) return yPos;
        const head = [['ID Benda Uji', 'Umur (hari)', 'Tanggal Uji', 'Kuat Tekan (MPa)']];
        const body = trialData.tests.map(test => [
            test.specimen_id,
            test.age_days,
            new Date(test.testing_date).toLocaleDateString('id-ID'),
            test.result_data.strength_MPa?.toFixed(2) || '-'
        ]);
        doc.autoTable({ startY: yPos, head, body, theme: 'striped', headStyles: { fillColor: '#3b82f6' } });
        return doc.lastAutoTable.finalY + 5;
    },
    'strength-chart': async (doc, yPos, component, trialData) => {
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const PAGE_MARGIN = 15;
        const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
        const imageData = await renderChartToImage(`strength-chart-${trialData.id}`);
        if (imageData) {
            doc.addImage(imageData, 'PNG', PAGE_MARGIN, yPos, CONTENT_WIDTH, 70);
            return yPos + 75;
        }
        return yPos;
    },
    'sqc-chart': async (doc, yPos, component, trialData) => {
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const PAGE_MARGIN = 15;
        const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
        const imageData = await renderChartToImage(`sqc-chart-${trialData.id}`);
        if (imageData) {
            doc.addImage(imageData, 'PNG', PAGE_MARGIN, yPos, CONTENT_WIDTH, 80);
            return yPos + 85;
        }
        return yPos;
    },
    'custom-text': async (doc, yPos, component) => {
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const PAGE_MARGIN = 15;
        const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
        const { content = '', fontSize = 12, isBold = false, align = 'left' } = component.properties;
        doc.setFontSize(fontSize).setFont(undefined, isBold ? 'bold' : 'normal');
        const textLines = doc.splitTextToSize(content, CONTENT_WIDTH);
        doc.text(textLines, PAGE_MARGIN, yPos, { align });
        return yPos + (textLines.length * (fontSize * 0.35));
    },
    'project-name': async (doc, yPos, component, reportData) => {
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        doc.setFontSize(18).setFont(undefined, 'bold');
        doc.text(reportData?.projectName || 'Nama Proyek', PAGE_WIDTH / 2, yPos, { align: 'center' });
        return yPos + 8;
    },
    'client-name': async (doc, yPos, component, reportData) => {
        doc.setFontSize(12).setFont(undefined, 'normal');
        doc.text(`Klien: ${reportData?.clientName || 'Nama Klien'}`, 15, yPos);
        return yPos + 6;
    },
    'signature-block': async (doc, yPos, component) => {
        const { label1 = 'Disiapkan oleh,', name1 = '(_________________)', position1 = 'Teknisi Lab', label2 = 'Disetujui oleh,', name2 = '(_________________)', position2 = 'Penyelia' } = component.properties || {};
        doc.autoTable({
            startY: yPos + 15,
            body: [[
                { content: `${label1}\n\n\n\n${name1}\n${position1}`, styles: { halign: 'center' } },
                { content: `${label2}\n\n\n\n${name2}\n${position2}`, styles: { halign: 'center' } }
            ]],
            theme: 'plain'
        });
        return doc.lastAutoTable.finalY + 5;
    },
    'horizontal-line': async (doc, yPos) => {
        const PAGE_WIDTH = doc.internal.pageSize.getWidth();
        const PAGE_MARGIN = 15;
        doc.setDrawColor(200);
        doc.line(PAGE_MARGIN, yPos, PAGE_WIDTH - PAGE_MARGIN, yPos);
        return yPos + 5;
    },
    'page-break': async (doc, yPos) => {
        doc.addPage();
        return 15;
    }
};

const renderComponent = async (doc, yPos, component, reportData, settings, apiReady) => {
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const PAGE_MARGIN = 15;
    const FOOTER_HEIGHT = 20;

    const checkPageBreak = (currentY, componentHeight = 20) => {
        if (currentY + componentHeight > PAGE_HEIGHT - FOOTER_HEIGHT) {
            doc.addPage();
            return PAGE_MARGIN;
        }
        return currentY;
    };

    yPos = checkPageBreak(yPos);

    if (component.id === 'trial-loop') {
        const selectedTrialIds = component.properties?.selectedTrials || [];
        const trialsToRender = reportData?.trials.filter(t => selectedTrialIds.includes(t.id)) || [];
        for (const trial of trialsToRender) {
            for (const child of component.children) {
                yPos = await renderComponent(doc, yPos, child, { ...reportData, trials: [trial] }, settings, apiReady);
            }
        }
        return yPos;
    }

    if (component.id === 'section') {
        for (const child of component.children) {
            yPos = await renderComponent(doc, yPos, child, reportData, settings, apiReady);
        }
        return yPos;
    }
    
    const renderer = renderers[component.id];
    if (renderer) {
        const trialData = component.trialData || reportData?.trials?.[0];
        return await renderer(doc, yPos, component, trialData || reportData, settings, apiReady);
    }
    
    return yPos;
};

// Fungsi utama diubah untuk menerima `pageSettings`
export const generatePdfFromLayout = async ({ layout, pageSettings, reportData, settings, apiReady }) => {
    const { size = 'a4', orientation = 'portrait' } = pageSettings || {};

    const doc = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: size
    });
    
    const PAGE_MARGIN = 15;
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    let yPos = PAGE_MARGIN;

    for (let i = 0; i < layout.length; i++) {
        const pageComponents = layout[i];
        if (i > 0) {
            doc.addPage();
        }
        yPos = PAGE_MARGIN;

        for (const component of pageComponents) {
            yPos = await renderComponent(doc, yPos, component, reportData, settings, apiReady);
        }
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8).setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN, PAGE_HEIGHT - 10, { align: 'right' });
    }

    doc.save(`Laporan - ${reportData.projectName || 'Proyek'}.pdf`);
};
