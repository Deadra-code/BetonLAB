import Papa from 'papaparse';
import * as api from '../api/electronAPI';

// Fungsi untuk mengekspor data satu trial (format key-value)
export const exportTrialToCsv = async ({ trial, notify }) => {
    if (!trial || !trial.design_input || !trial.design_result) {
        notify.error("Data desain atau hasil tidak lengkap untuk diekspor.");
        return;
    }

    const { design_input, design_result } = trial;

    const dataToExport = [
        { Kategori: 'Info Proyek', Parameter: 'Nama Proyek', Nilai: trial.projectName },
        { Kategori: 'Info Proyek', Parameter: 'Nama Trial', Nilai: trial.trial_name },
        { Kategori: 'Input Desain', Parameter: "Kuat Tekan (f'c)", Nilai: design_input.fc },
        { Kategori: 'Input Desain', Parameter: 'Deviasi Standar', Nilai: design_input.stdDev },
        { Kategori: 'Input Desain', Parameter: 'Slump', Nilai: design_input.slump },
        { Kategori: 'Input Desain', Parameter: 'Ukuran Agregat Maksimum', Nilai: design_input.maxAggrSize },
        { Kategori: 'Input Desain', Parameter: 'Modulus Kehalusan Pasir', Nilai: design_input.finenessModulus },
        { Kategori: 'Input Desain', Parameter: 'BJ Semen', Nilai: design_input.sgCement },
        { Kategori: 'Input Desain', Parameter: 'BJ Ag. Kasar', Nilai: design_input.sgCoarse },
        { Kategori: 'Input Desain', Parameter: 'BJ Ag. Halus', Nilai: design_input.sgFine },
        { Kategori: 'Input Desain', Parameter: 'Berat Isi Ag. Kasar', Nilai: design_input.dryRoddedWeightCoarse },
        { Kategori: 'Input Desain', Parameter: 'Kadar Air Ag. Kasar', Nilai: design_input.moistureCoarse },
        { Kategori: 'Input Desain', Parameter: 'Penyerapan Ag. Kasar', Nilai: design_input.absorptionCoarse },
        { Kategori: 'Input Desain', Parameter: 'Kadar Air Ag. Halus', Nilai: design_input.moistureFine },
        { Kategori: 'Input Desain', Parameter: 'Penyerapan Ag. Halus', Nilai: design_input.absorptionFine },
        { Kategori: 'Hasil Perhitungan', Parameter: "Kuat Tekan Target (f'cr)", Nilai: design_result.fcr?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Faktor Air/Semen (FAS)', Nilai: design_result.wcRatio?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Kandungan Udara (%)', Nilai: design_result.airContent?.toFixed(1) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Semen (SSD kg/m³)', Nilai: design_result.cementContent?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Air (SSD kg/m³)', Nilai: design_result.waterContent?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Ag. Kasar (SSD kg/m³)', Nilai: design_result.coarseAggrWeightSSD?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Ag. Halus (SSD kg/m³)', Nilai: design_result.fineAggrWeightSSD?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Air Terkoreksi (kg/m³)', Nilai: design_result.correctedWater?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Ag. Kasar Lembab (kg/m³)', Nilai: design_result.correctedCoarseWeight?.toFixed(2) },
        { Kategori: 'Hasil Perhitungan', Parameter: 'Ag. Halus Lembab (kg/m³)', Nilai: design_result.correctedFineWeight?.toFixed(2) },
    ];

    const csv = Papa.unparse(dataToExport);
    
    const result = await api.saveCsv({ 
        defaultName: `Export-${trial.projectName}-${trial.trial_name}`, 
        content: csv 
    });

    if (result.success) {
        notify.success(`Data berhasil diekspor ke: ${result.path}`);
    } else if (result.error !== 'Save dialog canceled') {
        notify.error(`Gagal mengekspor file: ${result.error}`);
    }
};

export const exportComparisonToCsv = async ({ trials, notify }) => {
    if (!trials || trials.length === 0) {
        notify.error("Tidak ada data trial untuk diekspor.");
        return;
    }

    const headers = [
        'Parameter',
        ...trials.map(t => t.trial_name)
    ];

    const parameters = [
        { label: "f'c Rencana (MPa)", path: 'design_input.fc' },
        { label: 'Slump (mm)', path: 'design_input.slump' },
        { label: "f'cr Target (MPa)", path: 'design_result.fcr', precision: 2 },
        { label: 'FAS', path: 'design_result.wcRatio', precision: 2 },
        { label: 'Semen (kg/m³)', path: 'design_result.cementContent', precision: 2 },
        { label: 'Air Koreksi (kg/m³)', path: 'design_result.correctedWater', precision: 2 },
        { label: 'Ag. Kasar Lembab (kg/m³)', path: 'design_result.correctedCoarseWeight', precision: 2 },
        { label: 'Ag. Halus Lembab (kg/m³)', path: 'design_result.correctedFineWeight', precision: 2 },
    ];
    
    const getValue = (obj, path, precision) => {
        const value = path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
        if (typeof value === 'number' && precision !== undefined) {
            return value.toFixed(precision);
        }
        return value || '-';
    };

    const rows = parameters.map(param => {
        const rowData = { 'Parameter': param.label };
        trials.forEach(trial => {
            rowData[trial.trial_name] = getValue(trial, param.path, param.precision);
        });
        return rowData;
    });

    const csv = Papa.unparse({
        fields: headers,
        data: rows.map(row => headers.map(header => row[header]))
    });

    const result = await api.saveCsv({
        defaultName: `Perbandingan-Trial-${trials[0].projectName}`,
        content: csv
    });

    if (result.success) {
        notify.success(`Data perbandingan berhasil diekspor ke: ${result.path}`);
    } else if (result.error !== 'Save dialog canceled') {
        notify.error(`Gagal mengekspor file: ${result.error}`);
    }
};
