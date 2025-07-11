// Tabel 1: Estimasi Kebutuhan Air & Kandungan Udara (per m³)
export const waterAndAirContentData = {
    '10': { slump: { '10-30': 190, '30-50': 200, '80-100': 216, '150-180': 228 }, air: 3.0 },
    '12.5': { slump: { '10-30': 180, '30-50': 190, '80-100': 205, '150-180': 216 }, air: 2.5 },
    '20': { slump: { '10-30': 170, '30-50': 180, '80-100': 193, '150-180': 205 }, air: 1.5 },
    '25': { slump: { '10-30': 160, '30-50': 170, '80-100': 181, '150-180': 193 }, air: 1.0 },
    '40': { slump: { '10-30': 145, '30-50': 155, '80-100': 166, '150-180': 178 }, air: 0.5 },
    '50': { slump: { '10-30': 135, '30-50': 145, '80-100': 157, '150-180': 169 }, air: 0.3 },
};

// Tabel 2: Rasio Air/Semen (W/C Ratio) berdasarkan Kuat Tekan
export const getWCRatio = (fcr) => {
    if (fcr >= 45) return 0.38;
    if (fcr >= 40) return 0.43;
    if (fcr >= 35) return 0.48;
    if (fcr >= 30) return 0.55;
    if (fcr >= 25) return 0.62;
    if (fcr >= 20) return 0.69;
    return 0.75;
};

// Tabel 3: Volume Agregat Kasar per Volume Beton
export const coarseAggregateVolumeData = {
    '10': { '2.40': 0.50, '2.60': 0.48, '2.80': 0.46, '3.00': 0.44 },
    '12.5': { '2.40': 0.59, '2.60': 0.57, '2.80': 0.55, '3.00': 0.53 },
    '20': { '2.40': 0.66, '2.60': 0.64, '2.80': 0.62, '3.00': 0.60 },
    '25': { '2.40': 0.71, '2.60': 0.69, '2.80': 0.67, '3.00': 0.65 },
    '40': { '2.40': 0.75, '2.60': 0.73, '2.80': 0.71, '3.00': 0.69 },
    '50': { '2.40': 0.78, '2.60': 0.76, '2.80': 0.74, '3.00': 0.72 },
};

// Data untuk input saringan default
export const defaultSieveData = { '100': 100, '50': 100, '40': 100, '25': 100, '20': 100, '12.5': 100, '10': 100, '4.75': 100, '2.36': 80, '1.18': 60, '0.60': 40, '0.30': 20, '0.15': 5, 'pan': 0 };

export const defaultInputs = {
    fc: 25,
    stdDev: 4,
    slump: 80,
    maxAggrSize: '20',
    finenessModulus: '2.60',
    selectedCementId: null,
    selectedCoarseId: null,
    selectedFineId: null,
    sgCement: 3.15,
    sgCoarse: 2.65,
    sgFine: 2.60,
    dryRoddedWeightCoarse: 1600,
    moistureCoarse: 2.0,
    absorptionCoarse: 1.0,
    moistureFine: 3.0,
    absorptionFine: 1.5,
    admixture: { name: '', dosage: 0, waterReduction: 0 },
    sieve: { fine: defaultSieveData, coarse: defaultSieveData, combinationRatio: 40 }
};

// PENINGKATAN: Menambahkan teks bantuan untuk tooltip
export const sniReferenceData = {
    fc: { title: "Kuat Tekan Karakteristik (f'c)", content: "Kuat tekan beton yang disyaratkan (dalam MPa) pada umur 28 hari. Nilai ini menjadi dasar dari seluruh perhitungan." },
    stdDev: { title: "Deviasi Standar (S)", content: "Nilai statistik yang menunjukkan variabilitas kekuatan beton di lapangan. Jika tidak ada data, gunakan nilai dari tabel SNI berdasarkan tingkat kendali produksi." },
    slump: { title: "Referensi Slump (SNI 03-2834-2000)", content: "• Dinding, pelat pondasi, dan beton polos: 20-80 mm\n• Pondasi telapak, balok, dan dinding bertulang: 25-100 mm\n• Kolom bangunan: 25-100 mm\n• Perkerasan jalan: 20-75 mm\n• Beton masif: 20-50 mm" },
    maxAggrSize: { title: "Ukuran Agregat Maksimum", content: "Ukuran agregat maksimum tidak boleh melebihi:\n• 1/5 jarak terkecil antara sisi-sisi cetakan.\n• 1/3 tebal pelat.\n• 3/4 jarak bersih minimum antar tulangan." },
    wcRatio: { title: "Faktor Air/Semen (FAS/WCR)", content: "FAS yang terlalu tinggi (> 0.7) dapat menyebabkan beton dengan kekuatan rendah dan kurang awet. FAS yang terlalu rendah (< 0.35) mungkin sulit dikerjakan tanpa superplasticizer." }
};
