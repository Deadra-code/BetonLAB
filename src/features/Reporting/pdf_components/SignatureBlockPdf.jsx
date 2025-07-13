import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
        textAlign: 'center',
        fontSize: 10,
    },
    signatureColumn: {
        width: '45%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    label: {
        marginBottom: 50,
    },
    name: {
        fontWeight: 'bold',
        paddingTop: 5,
    },
    position: {
        borderTopWidth: 1,
        borderTopColor: '#000000',
        width: '100%',
        paddingTop: 2,
        marginTop: 2,
    }
});

const SignatureBlockPdf = ({ properties }) => {
    const {
        label1 = 'Disiapkan oleh,',
        label2 = 'Disetujui oleh,',
        name1 = '(_________________)',
        name2 = '(_________________)',
        position1 = 'Teknisi Lab',
        position2 = 'Penyelia',
    } = properties || {};

    return (
        <View style={styles.container}>
            <View style={styles.signatureColumn}>
                <Text style={styles.label}>{label1}</Text>
                <Text style={styles.name}>{name1}</Text>
                <Text style={styles.position}>{position1}</Text>
            </View>
            <View style={styles.signatureColumn}>
                <Text style={styles.label}>{label2}</Text>
                <Text style={styles.name}>{name2}</Text>
                <Text style={styles.position}>{position2}</Text>
            </View>
        </View>
    );
};

export default SignatureBlockPdf;
