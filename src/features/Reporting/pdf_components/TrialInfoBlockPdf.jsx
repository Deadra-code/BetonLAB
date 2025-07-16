// src/features/Reporting/pdf_components/TrialInfoBlockPdf.jsx
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        padding: 8,
        marginBottom: 10,
        fontFamily: 'Helvetica',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    item: {
        flex: 1,
        paddingHorizontal: 4,
    },
    label: {
        fontSize: 8,
        color: '#6B7280',
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 10,
        color: '#1F2937',
    }
});

const InfoItemPdf = ({ label, value, unit }) => {
    if (!value) return null;
    return (
        <View style={styles.item}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value} {unit}</Text>
        </View>
    );
};

const TrialInfoBlockPdf = ({ trialData, properties }) => {
    const { design_input, design_result } = trialData || {};
    if (!design_input || !design_result) return null;

    return (
        <View style={styles.container}>
            <InfoItemPdf label="f'c Rencana" value={design_input.fc} unit="MPa" />
            <InfoItemPdf label="Slump" value={design_input.slump} unit="mm" />
            <InfoItemPdf label="f'cr Target" value={design_result.fcr?.toFixed(2)} unit="MPa" />
        </View>
    );
};

export default TrialInfoBlockPdf;
