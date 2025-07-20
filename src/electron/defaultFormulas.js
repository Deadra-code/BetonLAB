// src/electron/defaultFormulas.js
// Deskripsi: Berisi data awal untuk tabel `calculation_formulas`.
// Versi ini menggunakan module.exports langsung pada array untuk kompatibilitas penuh.

const waterAndAirContentData = {
    '10': { slump: { '10-30': 190, '30-50': 200, '80-100': 216, '150-180': 228 }, air: 3.0 },
    '12.5': { slump: { '10-30': 180, '30-50': 190, '80-100': 205, '150-180': 216 }, air: 2.5 },
    '20': { slump: { '10-30': 170, '30-50': 180, '80-100': 193, '150-180': 205 }, air: 1.5 },
    '25': { slump: { '10-30': 160, '30-50': 170, '80-100': 181, '150-180': 193 }, air: 1.0 },
    '40': { slump: { '10-30': 145, '30-50': 155, '80-100': 166, '150-180': 178 }, air: 0.5 },
    '50': { slump: { '10-30': 135, '30-50': 145, '80-100': 157, '150-180': 169 }, air: 0.3 },
};

const coarseAggregateVolumeData = {
    '10': { '2.40': 0.50, '2.60': 0.48, '2.80': 0.46, '3.00': 0.44 },
    '12.5': { '2.40': 0.59, '2.60': 0.57, '2.80': 0.55, '3.00': 0.53 },
    '20': { '2.40': 0.66, '2.60': 0.64, '2.80': 0.62, '3.00': 0.60 },
    '25': { '2.40': 0.71, '2.60': 0.69, '2.80': 0.67, '3.00': 0.65 },
    '40': { '2.40': 0.75, '2.60': 0.73, '2.80': 0.71, '3.00': 0.69 },
    '50': { '2.40': 0.78, '2.60': 0.76, '2.80': 0.74, '3.00': 0.72 },
};

const defaultFormulas = [
    {
        formula_key: 'fcr_formula',
        formula_name: "Kuat Tekan Target (f'cr)",
        formula_type: 'expression',
        formula_value: 'fc + 1.64 * stdDev',
        variables: JSON.stringify([
            { name: "fc", desc: "Kuat tekan karakteristik (MPa)" },
            { name: "stdDev", desc: "Deviasi standar (MPa)" }
        ]),
        notes: 'Berdasarkan ACI 318 / SNI 2847 untuk tingkat kepercayaan 95%. Konstanta 1.64 dapat diubah.',
        is_editable: 1,
    },
    {
        formula_key: 'wc_ratio_table',
        formula_name: 'Tabel Rasio Air/Semen (FAS)',
        formula_type: 'json_table',
        formula_value: JSON.stringify({
            "45": 0.38, "40": 0.43, "35": 0.48, "30": 0.55, "25": 0.62, "20": 0.69, "default": 0.75
        }),
        variables: JSON.stringify([
            { name: "key", desc: "Kuat Tekan Target (f'cr) terdekat (pembulatan ke bawah)" },
            { name: "value", desc: "Nilai Faktor Air/Semen" }
        ]),
        notes: 'Tabel lookup berdasarkan f\'cr. Kunci adalah nilai f\'cr, dan value adalah FAS yang sesuai.',
        is_editable: 1,
    },
    {
        formula_key: 'water_air_table',
        formula_name: 'Tabel Kebutuhan Air & Udara',
        formula_type: 'json_table',
        formula_value: JSON.stringify(waterAndAirContentData),
        variables: JSON.stringify([
            { name: "key", desc: "Ukuran agregat maksimum (mm)" },
            { name: "value", desc: "Objek berisi data slump dan kandungan udara" }
        ]),
        notes: 'Tabel data berdasarkan SNI 03-2834-2000 Tabel 1. Struktur JSON harus dipertahankan.',
        is_editable: 1,
    },
    {
        formula_key: 'coarse_agg_vol_table',
        formula_name: 'Tabel Volume Agregat Kasar',
        formula_type: 'json_table',
        formula_value: JSON.stringify(coarseAggregateVolumeData),
        variables: JSON.stringify([
            { name: "key", desc: "Ukuran agregat maksimum (mm)" },
            { name: "value", desc: "Objek berisi data Modulus Kehalusan (FM)" }
        ]),
        notes: 'Tabel data berdasarkan SNI 03-2834-2000 Tabel 3. Struktur JSON harus dipertahankan.',
        is_editable: 1,
    },
    {
        formula_key: 'fine_agg_weight',
        formula_name: 'Berat Agregat Halus (SSD)',
        formula_type: 'expression',
        formula_value: '(1 - volWater - volCement - volCoarseSSD - volAir) * sgFine * 1000',
        variables: JSON.stringify([]),
        notes: 'Perhitungan berdasarkan metode volume absolut.',
        is_editable: 0,
    },
    {
        formula_key: 'corrected_coarse_weight',
        formula_name: 'Berat Ag. Kasar Terkoreksi',
        formula_type: 'expression',
        formula_value: 'coarseAggrWeightSSD * (1 + moistureCoarse / 100)',
        variables: JSON.stringify([]),
        notes: 'Menyesuaikan berat agregat kasar dengan kadar air lapangan.',
        is_editable: 0,
    },
    {
        formula_key: 'corrected_fine_weight',
        formula_name: 'Berat Ag. Halus Terkoreksi',
        formula_type: 'expression',
        formula_value: 'fineAggrWeightSSD * (1 + moistureFine / 100)',
        variables: JSON.stringify([]),
        notes: 'Menyesuaikan berat agregat halus dengan kadar air lapangan.',
        is_editable: 0,
    },
    {
        formula_key: 'corrected_water',
        formula_name: 'Air Terkoreksi',
        formula_type: 'expression',
        formula_value: 'waterContent - (coarseAggrWeightSSD * (moistureCoarse / 100 - absorptionCoarse / 100)) - (fineAggrWeightSSD * (moistureFine / 100 - absorptionFine / 100))',
        variables: JSON.stringify([]),
        notes: 'Menyesuaikan kebutuhan air berdasarkan kondisi kadar air dan penyerapan agregat.',
        is_editable: 0,
    }
];

module.exports = defaultFormulas;
