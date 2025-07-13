// Lokasi file: src/features/Reporting/pdf_components/ClientInfoBlockPdf.jsx
// Deskripsi: Komponen PDF untuk menampilkan blok info klien di laporan akhir.

import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        fontFamily: 'Helvetica',
    },
    item: {
        marginBottom: 5,
    },
    label: {
        fontSize: 9,
        color: '#6B7280',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 10,
        color: '#1F2937',
    }
});

const InfoItemPdf = ({ label, value }) => {
    if (!value) return null;
    return (
        <View style={styles.item}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

const ClientInfoBlockPdf = ({ reportData }) => {
    if (!reportData) return null;

    return (
        <View style={styles.container}>
            <InfoItemPdf label="Klien" value={reportData.clientName} />
            <InfoItemPdf label="Alamat" value={reportData.clientAddress} />
            <InfoItemPdf label="Kontak Person" value={reportData.clientContactPerson} />
            <InfoItemPdf label="Nomor Kontak" value={reportData.clientContactNumber} />
        </View>
    );
};

export default ClientInfoBlockPdf;
