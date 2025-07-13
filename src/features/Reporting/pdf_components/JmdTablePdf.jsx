import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

// Stylesheet untuk mendefinisikan tampilan tabel di PDF
const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  table: { 
    display: "table", 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#bfbfbf',
    borderRightWidth: 0, 
    borderBottomWidth: 0 
  },
  tableRow: { 
    margin: "auto", 
    flexDirection: "row" 
  },
  tableColHeader: { 
    width: "50%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#bfbfbf',
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    backgroundColor: '#f2f2f2',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableCol: { 
    width: "50%", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#bfbfbf',
    borderLeftWidth: 0, 
    borderTopWidth: 0,
    padding: 5,
    fontSize: 10,
  },
  tableCell: {
    fontSize: 10
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  }
});

/**
 * Komponen JMD Table yang dirancang khusus untuk dirender ke dalam PDF.
 * @param {object} props - Props yang berisi data trial dan properti komponen.
 */
const JmdTablePdf = ({ trialData, properties }) => {
    const { design_result } = trialData || {};
    // Properti ini nantinya bisa diatur melalui Property Inspector
    const { showCorrected = true, showSsd = true } = properties || {};

    if (!design_result) {
        return <Text style={{ color: 'grey', fontStyle: 'italic' }}>Data Job Mix Design tidak tersedia.</Text>;
    }

    return (
        <View style={styles.container}>
            {showSsd && (
                <View style={{...styles.table, marginBottom: 10}}>
                    <View style={styles.tableRow}>
                        <View style={{...styles.tableColHeader, width: '100%'}}><Text>Proporsi per 1 m³ (Kondisi SSD)</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Semen</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.cementContent?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Air</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.waterContent?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Agregat Kasar</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.coarseAggrWeightSSD?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                     <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Agregat Halus</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.fineAggrWeightSSD?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                </View>
            )}
             {showCorrected && (
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={{...styles.tableColHeader, width: '100%'}}><Text>Proporsi per 1 m³ (Koreksi Lapangan)</Text></View>
                    </View>
                     <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Semen</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.cementContent?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Air Koreksi</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.correctedWater?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Agregat Kasar Lembab</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.correctedCoarseWeight?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                     <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text>Agregat Halus Lembab</Text></View>
                        <View style={styles.tableCol}><Text>{design_result.correctedFineWeight?.toFixed(2) || '-'} kg</Text></View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default JmdTablePdf;
