import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import JmdTablePdf from '../features/Reporting/pdf_components/JmdTablePdf.jsx';
import CustomTextPdf from '../features/Reporting/pdf_components/CustomTextPdf.jsx';
import HeaderPdf from '../features/Reporting/pdf_components/HeaderPdf.jsx';
import SignatureBlockPdf from '../features/Reporting/pdf_components/SignatureBlockPdf.jsx';
import RawStrengthTestTablePdf from '../features/Reporting/pdf_components/RawStrengthTestTablePdf.jsx';

const styles = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, paddingTop: 35, paddingBottom: 65, paddingHorizontal: 35, lineHeight: 1.5 },
});

const renderComponentInPdf = (component, reportData, settings) => {
    const { id, properties = {} } = component;
    const trialData = reportData?.trials?.[0] || {};
    switch (id) {
        case 'header': return <HeaderPdf settings={settings} />;
        case 'custom-text': return <CustomTextPdf properties={properties} reportData={reportData} settings={settings} />;
        case 'jmd-table': return <JmdTablePdf trialData={trialData} properties={properties} />;
        case 'raw-strength-table': return <RawStrengthTestTablePdf trialData={trialData} properties={properties} />;
        case 'signature-block': return <SignatureBlockPdf properties={properties} />;
        case 'horizontal-line': return <View style={{ borderBottomWidth: 1, borderBottomColor: '#000000', marginVertical: 10 }} />;
        case 'page-break': return null;
        case 'vertical-spacer': return <View style={{ height: properties.height || 20 }} />;
        default: return <View style={{ border: '1px dashed grey', padding: 10, marginVertical: 5 }}><Text style={{ color: 'grey', fontSize: 9 }}>[Komponen: {component.name}]</Text></View>;
    }
};

export const ReportDocument = ({ layout, reportData, settings, pageSettings }) => (
    <Document author="BetonLAB" title={`Laporan - ${reportData.projectName}`}>
        {layout.map((pageComponents, index) => (
            <Page key={index} size={pageSettings.size.toUpperCase()} orientation={pageSettings.orientation} style={styles.page}>
                {pageComponents.map(component => (
                    <React.Fragment key={component.instanceId}>
                        {renderComponentInPdf(component, reportData, settings)}
                    </React.Fragment>
                ))}
                <Text style={{ position: 'absolute', fontSize: 8, bottom: 30, left: 0, right: 35, textAlign: 'center', color: 'grey' }}>
                    Halaman {index + 1}
                </Text>
            </Page>
        ))}
    </Document>
);

export const generatePdf = async ({ layout, reportData, settings, pageSettings }) => {
    if (!reportData) {
        alert("Pilih data pratinjau terlebih dahulu untuk membuat laporan.");
        throw new Error("Preview data is not selected.");
    }
    const doc = <ReportDocument layout={layout} reportData={reportData} settings={settings} pageSettings={pageSettings} />;
    const blob = await pdf(doc).toBlob();
    saveAs(blob, `Laporan - ${reportData.projectName || 'Proyek'}.pdf`);
};
