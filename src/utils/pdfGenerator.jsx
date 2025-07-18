// src/utils/pdfGenerator.jsx
// Deskripsi: Integrasi logika checkConditions untuk memastikan output PDF cocok dengan pratinjau kanvas.

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import * as htmlToImage from 'html-to-image';
import { checkConditions } from './reporting/reportUtils'; // TAHAP 3: Impor fungsi baru

// Impor semua komponen PDF
import HeaderPdf from '../features/Reporting/pdf_components/HeaderPdf.jsx';
import JmdTablePdf from '../features/Reporting/pdf_components/JmdTablePdf.jsx';
import CustomTextPdf from '../features/Reporting/pdf_components/CustomTextPdf.jsx';
import RawStrengthTestTablePdf from '../features/Reporting/pdf_components/RawStrengthTestTablePdf.jsx';
import SignatureBlockPdf from '../features/Reporting/pdf_components/SignatureBlockPdf.jsx';
import ClientInfoBlockPdf from '../features/Reporting/pdf_components/ClientInfoBlockPdf.jsx';
import TrialInfoBlockPdf from '../features/Reporting/pdf_components/TrialInfoBlockPdf.jsx';
import MaterialPropertiesTablePdf from '../features/Reporting/pdf_components/MaterialPropertiesTablePdf.jsx';
import StrengthSummaryTablePdf from '../features/Reporting/pdf_components/StrengthSummaryTablePdf.jsx';
import ChartImagePdf from '../features/Reporting/pdf_components/ChartImagePdf.jsx';
import { QrCodePdf, CustomImagePdf, DynamicPlaceholderPdf, FooterPdf, CustomTablePdf } from '../features/Reporting/pdf_components/OtherComponentsPdf.jsx';

const styles = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, paddingTop: 35, paddingBottom: 65, paddingHorizontal: 35, lineHeight: 1.5, flexDirection: 'column' },
    columnContainer: { flexDirection: 'row', gap: 10 },
    column: { flex: 1 },
    loopItem: { marginBottom: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
    pageBreak: { break: true }
});

// Fungsi render rekursif utama
const renderComponentInPdf = (component, reportData, settings) => {
    const { id, properties = {}, children = [], instanceId } = component;
    const trialData = component.isInsideLoop ? reportData : (reportData?.trials?.[0] || {});

    // TAHAP 3: Periksa kondisi sebelum merender ke PDF
    const shouldRender = checkConditions(properties.conditions, reportData);
    if (!shouldRender) {
        return null;
    }

    if (id === 'columns') {
        const numColumns = properties?.columnCount || 2;
        return (
            <View style={styles.columnContainer}>
                {[...Array(numColumns).keys()].map(colIndex => (
                    <View key={colIndex} style={styles.column}>
                        {children[colIndex]?.map(child => renderComponentInPdf(child, reportData, settings))}
                    </View>
                ))}
            </View>
        );
    }
    if (id === 'trial-loop') {
        const trialsToRender = reportData?.trials || [];
        return (
            <View>
                {trialsToRender.map(currentTrial => (
                    <View key={currentTrial.id} style={styles.loopItem}>
                        {children.map(childComponent => renderComponentInPdf({ ...childComponent, isInsideLoop: true }, currentTrial, settings))}
                    </View>
                ))}
            </View>
        );
    }

    switch (id) {
        case 'header': return <HeaderPdf settings={settings} properties={properties} />;
        case 'client-info-block': return <ClientInfoBlockPdf reportData={reportData} properties={properties} />;
        case 'trial-info-block': return <TrialInfoBlockPdf trialData={trialData} properties={properties} />;
        case 'jmd-table': return <JmdTablePdf trialData={trialData} properties={properties} />;
        case 'material-properties-table': return <MaterialPropertiesTablePdf trialData={trialData} properties={properties} />;
        case 'raw-strength-table': return <RawStrengthTestTablePdf trialData={trialData} properties={properties} />;
        case 'strength-summary-table': return <StrengthSummaryTablePdf trialData={trialData} properties={properties} />;
        case 'strength-chart':
        case 'sqc-chart':
        case 'combined-gradation-chart':
            return <ChartImagePdf component={component} />;
        case 'custom-text': return <CustomTextPdf properties={properties} reportData={reportData} settings={settings} />;
        case 'dynamic-placeholder': return <DynamicPlaceholderPdf properties={properties} reportData={reportData} settings={settings} />;
        case 'custom-table': return <CustomTablePdf properties={properties} />;
        case 'custom-image': return <CustomImagePdf properties={properties} />;
        case 'qr-code': return <QrCodePdf properties={properties} reportData={reportData} settings={settings} />;
        case 'signature-block': return <SignatureBlockPdf properties={properties} />;
        case 'horizontal-line': return <View style={{ borderBottomWidth: properties.thickness || 1, borderBottomColor: properties.color || '#9CA3AF', marginVertical: 10 }} />;
        case 'vertical-spacer': return <View style={{ height: properties.height || 20 }} />;
        case 'page-break': return <View style={styles.pageBreak} />;
        case 'footer': return null;
        default: return <View key={instanceId} style={{ border: '1px dashed grey', padding: 5, marginVertical: 2 }}><Text style={{ color: 'grey', fontSize: 8 }}>[Komponen: {component.name}]</Text></View>;
    }
};

export const ReportDocument = ({ layout, reportData, settings, pageSettings }) => (
    <Document author="BetonLAB" title={`Laporan - ${reportData.projectName}`}>
        {layout.map((pageComponents, pageIndex) => {
            const footerComponent = pageComponents.find(c => c.id === 'footer');
            return (
                <Page key={pageIndex} size={pageSettings.size.toUpperCase()} orientation={pageSettings.orientation} style={styles.page}>
                    <View style={{ flexGrow: 1 }}>
                        {pageComponents.map(component => component.id !== 'footer' && (
                            <React.Fragment key={component.instanceId}>
                                {renderComponentInPdf(component, reportData, settings)}
                            </React.Fragment>
                        ))}
                    </View>
                    {footerComponent && <FooterPdf properties={footerComponent.properties} pageNumber={pageIndex + 1} totalPages={layout.length} />}
                </Page>
            );
        })}
    </Document>
);

export const generatePdf = async ({ layout, reportData, settings, pageSettings, notify }) => {
    if (!reportData) {
        notify.error("Pilih data pratinjau terlebih dahulu untuk membuat laporan.");
        throw new Error("Preview data is not selected.");
    }
    const layoutWithImages = JSON.parse(JSON.stringify(layout));
    const chartComponentIds = [];
    const findChartsRecursive = (nodes) => {
        for (const component of nodes) {
            if (['strength-chart', 'sqc-chart', 'combined-gradation-chart'].includes(component.id)) {
                chartComponentIds.push(component.instanceId);
            }
            if (component.children) {
                if (component.id.startsWith('columns')) {
                    component.children.forEach(col => findChartsRecursive(col));
                } else {
                    findChartsRecursive(component.children);
                }
            }
        }
    };
    layoutWithImages.forEach(page => findChartsRecursive(page));
    
    for (const id of chartComponentIds) {
        const node = document.getElementById(`chart-container-${id}`);
        if (node) {
            try {
                const dataUrl = await htmlToImage.toPng(node);
                const updateImageInLayout = (nodes) => {
                    for (let component of nodes) {
                        if (component.instanceId === id) {
                            component.properties.imageBase64 = dataUrl;
                            return true;
                        }
                        if (component.children) {
                            if (component.id.startsWith('columns')) {
                                for (const col of component.children) { if (updateImageInLayout(col)) return true; }
                            } else {
                                if (updateImageInLayout(component.children)) return true;
                            }
                        }
                    }
                    return false;
                };
                layoutWithImages.forEach(page => updateImageInLayout(page));
            } catch (error) {
                console.error('Gagal mengonversi grafik ke gambar:', error);
                notify.error(`Gagal memproses grafik untuk komponen ID: ${id}`);
            }
        }
    }
    
    const doc = <ReportDocument layout={layoutWithImages} reportData={reportData} settings={settings} pageSettings={pageSettings} />;
    const blob = await pdf(doc).toBlob();
    saveAs(blob, `Laporan - ${reportData.projectName || 'Proyek'}.pdf`);
    notify.success("PDF berhasil dibuat dan unduhan dimulai.");
};
