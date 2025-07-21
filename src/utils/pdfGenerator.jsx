// src/utils/pdfGenerator.jsx
// Implementasi: Rancangan #5 - "Satu-Klik" Laporan Komposisi Awal
// Deskripsi: Menambahkan fungsi baru `generateInitialCompositionPdf` untuk membuat
// laporan sederhana secara cepat tanpa melalui Report Builder.

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import * as htmlToImage from 'html-to-image';
import { checkConditions } from './reporting/reportUtils';

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
import LocationDatePdf from '../features/Reporting/pdf_components/LocationDatePdf.jsx';

// Registrasi font (jika diperlukan)
Font.register({
  family: 'Helvetica-Bold',
  src: `https://fonts.gstatic.com/s/helvetica/v10/7_06431f3b3319ea05634a4135545945.ttf`,
});


const styles = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, paddingTop: 35, paddingBottom: 65, paddingHorizontal: 35, lineHeight: 1.5, flexDirection: 'column' },
    columnContainer: { flexDirection: 'row', gap: 10 },
    column: { flex: 1 },
    loopItem: { marginBottom: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
    pageBreak: { break: true }
});

// Fungsi render rekursif utama (tidak berubah)
const renderComponentInPdf = (component, reportData, settings) => {
    // ... (isi fungsi ini tetap sama seperti sebelumnya)
};

export const ReportDocument = ({ layout, reportData, settings, pageSettings }) => (
    <Document author="BetonLAB" title={`Laporan - ${reportData.projectName}`}>
        {layout.map((page, pageIndex) => {
            const { header, components, footer } = page;
            
            return (
                <Page key={pageIndex} size={pageSettings.size.toUpperCase()} orientation={pageSettings.orientation} style={styles.page}>
                    <View style={{ flexGrow: 1 }}>
                        {header && renderComponentInPdf(header, reportData, settings)}
                        {components.map(component => (
                            <React.Fragment key={component.instanceId}>
                                {renderComponentInPdf(component, reportData, settings)}
                            </React.Fragment>
                        ))}
                    </View>
                    {footer && <FooterPdf properties={footer.properties} pageNumber={pageIndex + 1} totalPages={layout.length} />}
                </Page>
            );
        })}
    </Document>
);

export const generatePdf = async ({ layout, reportData, settings, pageSettings, notify }) => {
    // ... (isi fungsi ini tetap sama seperti sebelumnya)
};


// --- RANCANGAN #5: FUNGSI BARU UNTUK LAPORAN CEPAT ---
const QuickReportDocument = ({ trial, settings }) => {
    const quickStyles = StyleSheet.create({
        page: { fontFamily: 'Helvetica', fontSize: 11, padding: 40 },
        title: { fontSize: 18, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 20 },
        sectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginTop: 15, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 3 },
        infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
        infoItem: { width: '48%' },
        label: { fontSize: 10, color: '#555' },
        value: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
    });

    return (
        <Document>
            <Page size="A4" style={quickStyles.page}>
                <HeaderPdf settings={settings} />
                <Text style={quickStyles.title}>Laporan Komposisi Rencana Campuran</Text>
                
                <View style={quickStyles.infoGrid}>
                    <View style={quickStyles.infoItem}>
                        <Text style={quickStyles.label}>Proyek</Text>
                        <Text style={quickStyles.value}>{trial.projectName}</Text>
                    </View>
                    <View style={quickStyles.infoItem}>
                        <Text style={quickStyles.label}>Trial Mix</Text>
                        <Text style={quickStyles.value}>{trial.trial_name}</Text>
                    </View>
                </View>

                <View style={quickStyles.sectionTitle}><Text>Parameter Desain</Text></View>
                <View style={quickStyles.infoGrid}>
                     <View style={quickStyles.infoItem}><Text style={quickStyles.label}>f'c Rencana: <Text style={quickStyles.value}>{trial.design_input?.fc} MPa</Text></Text></View>
                     <View style={quickStyles.infoItem}><Text style={quickStyles.label}>f'cr Target: <Text style={quickStyles.value}>{trial.design_result?.fcr?.toFixed(2)} MPa</Text></Text></View>
                </View>
                 <View style={quickStyles.infoGrid}>
                     <View style={quickStyles.infoItem}><Text style={quickStyles.label}>Slump: <Text style={quickStyles.value}>{trial.design_input?.slump} mm</Text></Text></View>
                     <View style={quickStyles.infoItem}><Text style={quickStyles.label}>FAS: <Text style={quickStyles.value}>{trial.design_result?.wcRatio?.toFixed(2)}</Text></Text></View>
                </View>

                <View style={quickStyles.sectionTitle}><Text>Komposisi per 1 m³ (Kondisi Lapangan)</Text></View>
                <JmdTablePdf trialData={trial} properties={{ showSsd: false, showCorrected: true }} />
                
                <View style={{ marginTop: 'auto', paddingTop: 30 }}>
                    <SignatureBlockPdf properties={{
                        label1: 'Disiapkan oleh,',
                        name1: '(_________________)',
                        position1: 'Lab Technician',
                        label2: 'Mengetahui,',
                        name2: '(_________________)',
                        position2: 'Supervisor',
                    }} />
                </View>

            </Page>
        </Document>
    );
};

export const generateInitialCompositionPdf = async ({ trial, settings }) => {
    const doc = <QuickReportDocument trial={trial} settings={settings} />;
    const blob = await pdf(doc).toBlob();
    saveAs(blob, `Komposisi Awal - ${trial.trial_name}.pdf`);
};
