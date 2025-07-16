// src/features/Reporting/pdf_components/ChartImagePdf.jsx
import React from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    title: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
    },
    image: {
        width: '100%',
        height: 'auto',
    }
});

const ChartImagePdf = ({ component }) => {
    const { properties } = component;
    const { title, imageBase64 } = properties || {};

    if (!imageBase64) {
        return (
            <View style={{ border: '1px dashed grey', padding: 10, marginVertical: 5 }}>
                <Text style={{ color: 'grey', fontSize: 9 }}>[Grafik "{title}" tidak dapat dirender. Coba lagi.]</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <Image style={styles.image} src={imageBase64} />
        </View>
    );
};

export default ChartImagePdf;
