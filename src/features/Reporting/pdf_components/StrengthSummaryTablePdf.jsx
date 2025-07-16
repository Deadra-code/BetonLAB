// src/features/Reporting/pdf_components/StrengthSummaryTablePdf.jsx
import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderRightWidth: 0, borderBottomWidth: 0, marginBottom: 10 },
    tableRow: { margin: "auto", flexDirection: "row" },
    tableColHeader: { width: '33.33%', borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f2f2f2', padding: 5, fontFamily: 'Helvetica-Bold', fontSize: 9 },
    tableCol: { width: '33.33%', borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
    tableCell: { fontSize: 9, fontFamily: 'Helvetica' },
    title: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 5 }
});

const StrengthSummaryTablePdf = ({ trialData, properties }) => {
    const { title = "Ringkasan Hasil Uji Kuat Tekan" } = properties || {};
    const tests = trialData?.tests || [];

    const summaryData = useMemo(() => {
        if (tests.length === 0) return [];
        const groupedByAge = tests.reduce((acc, test) => {
            if (test.status === 'Telah Diuji') {
                const age = test.age_days;
                if (!acc[age]) {
                    acc[age] = { strengths: [], count: 0 };
                }
                acc[age].strengths.push(test.result_data.strength_MPa);
                acc[age].count++;
            }
            return acc;
        }, {});

        return Object.entries(groupedByAge).map(([age, data]) => {
            const sum = data.strengths.reduce((a, b) => a + b, 0);
            return { age: parseInt(age), count: data.count, average: sum / data.count };
        }).sort((a, b) => a.age - b.age);
    }, [tests]);

    if (summaryData.length === 0) return null;

    return (
        <View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableColHeader}><Text>Umur (Hari)</Text></View>
                    <View style={styles.tableColHeader}><Text>Jumlah Benda Uji</Text></View>
                    <View style={{...styles.tableColHeader, textAlign: 'right'}}><Text>Kuat Tekan Rata-rata (MPa)</Text></View>
                </View>
                {summaryData.map(row => (
                    <View style={styles.tableRow} key={row.age}>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{row.age}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{row.count}</Text></View>
                        <View style={{...styles.tableCol, textAlign: 'right'}}><Text style={styles.tableCell}>{row.average.toFixed(2)}</Text></View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default StrengthSummaryTablePdf;
