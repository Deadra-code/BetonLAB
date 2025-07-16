// Lokasi file: src/features/Reporting/pdf_components/MaterialPropertiesTablePdf.jsx
// Deskripsi: Komponen PDF untuk tabel properti material.

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const MaterialPropertiesTablePdf = ({ trialData, properties }) => {
    const { design_input } = trialData || {};

    const {
        headerBgColor = '#E5E7EB',
        headerTextColor = '#111827',
        borderColor = '#9CA3AF',
        borderWidth = 1,
    } = properties || {};

    const styles = StyleSheet.create({
        table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: borderWidth, borderColor: borderColor, borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 10 },
        tableRow: { margin: "auto", flexDirection: "row" },
        tableColHeader: { borderStyle: "solid", borderWidth: borderWidth, borderColor: borderColor, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: headerBgColor, padding: 5, color: headerTextColor, fontFamily: 'Helvetica-Bold' },
        tableCol: { borderStyle: "solid", borderWidth: borderWidth, borderColor: borderColor, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
        tableCell: { fontSize: 9, fontFamily: 'Helvetica' },
    });

    if (!design_input) {
        return <Text style={{ fontStyle: 'italic', color: 'grey', fontSize: 9 }}>Data Input Desain tidak tersedia.</Text>;
    }

    const data = [
        { name: 'Semen', sg: design_input.sgCement, absorption: '-', moisture: '-', bulkDensity: '-', fm: '-' },
        { name: 'Agregat Halus', sg: design_input.sgFine, absorption: design_input.absorptionFine, moisture: design_input.moistureFine, bulkDensity: '-', fm: design_input.finenessModulus },
        { name: 'Agregat Kasar', sg: design_input.sgCoarse, absorption: design_input.absorptionCoarse, moisture: design_input.moistureCoarse, bulkDensity: design_input.dryRoddedWeightCoarse, fm: '-' },
    ];

    return (
        <View style={styles.table}>
            <View style={styles.tableRow}>
                <View style={{ ...styles.tableColHeader, width: '25%' }}><Text>Material</Text></View>
                <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>BJ (SSD)</Text></View>
                <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Penyerapan (%)</Text></View>
                <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Kadar Air (%)</Text></View>
                <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Berat Isi</Text></View>
                <View style={{ ...styles.tableColHeader, width: '15%' }}><Text>Modulus Halus</Text></View>
            </View>
            {data.map(mat => (
                <View style={styles.tableRow} key={mat.name}>
                    <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>{mat.name}</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCell}>{mat.sg}</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCell}>{mat.absorption}</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCell}>{mat.moisture}</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCell}>{mat.bulkDensity}</Text></View>
                    <View style={{ ...styles.tableCol, width: '15%' }}><Text style={styles.tableCell}>{mat.fm}</Text></View>
                </View>
            ))}
        </View>
    );
};

export default MaterialPropertiesTablePdf;
