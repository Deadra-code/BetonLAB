// Lokasi File: src/features/Reporting/pdf_components/RawStrengthTestTablePdf.jsx

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 10 },
    tableRow: { margin: "auto", flexDirection: "row" },
    tableColHeader: { borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f2f2f2', padding: 5, fontWeight: 'bold', fontSize: 9 },
    tableCol: { borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0, padding: 5, fontSize: 9 },
    title: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 }
});

const RawStrengthTestTablePdf = ({ trialData }) => {
    const tests = trialData?.tests?.filter(t => t.status === 'Telah Diuji') || [];

    if (tests.length === 0) {
        return <Text style={{ fontStyle: 'italic', color: 'grey' }}>Data Uji Tekan tidak tersedia.</Text>;
    }

    return (
        <View>
            <Text style={styles.title}>Tabel Data Mentah Uji Kuat Tekan</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={{ ...styles.tableColHeader, width: '25%' }}><Text>ID Benda Uji</Text></View>
                    <View style={{ ...styles.tableColHeader, width: '25%' }}><Text>Umur (hari)</Text></View>
                    <View style={{ ...styles.tableColHeader, width: '25%' }}><Text>Tanggal Uji</Text></View>
                    <View style={{ ...styles.tableColHeader, width: '25%', textAlign: 'right' }}><Text>Kuat Tekan (MPa)</Text></View>
                </View>
                {tests.map(test => (
                    <View style={styles.tableRow} key={test.id}>
                        <View style={{ ...styles.tableCol, width: '25%' }}><Text>{test.specimen_id}</Text></View>
                        <View style={{ ...styles.tableCol, width: '25%' }}><Text>{test.age_days}</Text></View>
                        <View style={{ ...styles.tableCol, width: '25%' }}><Text>{new Date(test.testing_date).toLocaleDateString('id-ID')}</Text></View>
                        <View style={{ ...styles.tableCol, width: '25%', textAlign: 'right' }}><Text>{test.result_data.strength_MPa?.toFixed(2) || '-'}</Text></View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default RawStrengthTestTablePdf;