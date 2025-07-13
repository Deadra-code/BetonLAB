import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 10,
        marginBottom: 20,
    },
    companyDetails: {
        marginLeft: 10,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    reportTitle: {
        fontSize: 10,
        color: 'grey',
    }
});

const HeaderPdf = ({ settings }) => {
    if (!settings) return null;

    return (
        <View style={styles.headerContainer}>
            <View style={styles.companyDetails}>
                <Text style={styles.companyName}>{settings.companyName || 'Nama Perusahaan Anda'}</Text>
                <Text style={styles.reportTitle}>Laporan Laboratorium Beton</Text>
            </View>
        </View>
    );
};

export default HeaderPdf;
