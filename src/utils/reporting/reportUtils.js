// Lokasi file: src/utils/reporting/reportUtils.js
// Deskripsi: Penambahan fungsi checkConditions untuk logika rendering kondisional.

export const ALL_PLACEHOLDERS = [
    { value: '{{nama_proyek}}', label: 'Nama Proyek' },
    { value: '{{nama_klien}}', label: 'Nama Klien' },
    { value: '{{tanggal_laporan}}', label: 'Tanggal Laporan' },
    { value: '{{client_address}}', label: 'Alamat Klien' },
    { value: '{{client_contact_person}}', label: 'Kontak Person Klien' },
    { value: '{{client_contact_number}}', label: 'Nomor Kontak Klien' },
    { value: '{{request_number}}', label: 'Nomor Surat Permohonan' },
    { value: '{{request_date}}', label: 'Tanggal Surat Permohonan' },
    { value: '{{testing_requests}}', label: 'Detail Permintaan Uji' },
    { value: '{{project_notes}}', label: 'Catatan Proyek' },
    { value: '{{nama_trial}}', label: 'Nama Trial' },
    { value: '{{fc}}', label: "f'c Rencana (MPa)" },
    { value: '{{fcr}}', label: "f'cr Target (MPa)" },
    { value: '{{slump}}', label: 'Slump (mm)' },
    { value: '{{fas}}', label: 'Faktor Air/Semen' },
    { value: '{{cementContent}}', label: 'Kadar Semen (kg/m³)' },
    { value: '{{waterContent}}', label: 'Kadar Air (kg/m³)' },
];

export const replacePlaceholders = (text, reportData, settings, pageContext = {}) => {
    if (!text) return '';
    const trialData = reportData?.trials?.[0] || {};
    const { pageNumber = '', totalPages = '' } = pageContext;

    const replacements = {
        '{{nama_proyek}}': reportData?.projectName || '',
        '{{nama_klien}}': reportData?.clientName || '',
        '{{tanggal_laporan}}': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}),
        '{{client_address}}': reportData?.clientAddress || '',
        '{{client_contact_person}}': reportData?.clientContactPerson || '',
        '{{client_contact_number}}': reportData?.clientContactNumber || '',
        '{{request_number}}': reportData?.requestNumber || '',
        '{{request_date}}': reportData?.requestDate ? new Date(reportData.requestDate).toLocaleDateString('id-ID') : '',
        '{{testing_requests}}': reportData?.testingRequests || '',
        '{{project_notes}}': reportData?.projectNotes || '',
        '{{nama_trial}}': trialData?.trial_name || '',
        '{{fc}}': trialData?.design_input?.fc || '',
        '{{fcr}}': trialData?.design_result?.fcr?.toFixed(2) || '',
        '{{slump}}': trialData?.design_input?.slump || '',
        '{{fas}}': trialData?.design_result?.wcRatio?.toFixed(2) || '',
        '{{cementContent}}': trialData?.design_result?.cementContent?.toFixed(2) || '',
        '{{waterContent}}': trialData?.design_result?.waterContent?.toFixed(2) || '',
        '{{pageNumber}}': pageNumber,
        '{{totalPages}}': totalPages,
    };
    return text.replace(/\{\{.*?\}\}/g, match => replacements[match] !== undefined ? replacements[match] : match);
};

// TAHAP 3: Fungsi baru untuk memeriksa kondisi
export const checkConditions = (conditions = [], reportData) => {
    // Jika tidak ada kondisi, selalu tampilkan komponen
    if (!conditions || conditions.length === 0) return true;
    
    // Jika tidak ada data untuk diperiksa, jangan tampilkan komponen (kecuali kondisinya kosong)
    const trialData = reportData?.trials?.[0];
    if (!trialData) return false;

    // Periksa setiap kondisi. Semua harus terpenuhi (logika AND)
    return conditions.every(cond => {
        const { field, operator, value } = cond;
        
        // Dapatkan nilai aktual dari data trial
        const actualValue = trialData.design_result?.[field];

        // Jika field tidak ada di data atau value kondisi kosong, anggap kondisi terpenuhi
        if (actualValue === undefined || value === '') return true;

        const numActual = parseFloat(actualValue);
        const numValue = parseFloat(value);

        // Jika salah satu bukan angka, batalkan perbandingan
        if (isNaN(numActual) || isNaN(numValue)) return true;

        switch (operator) {
            case '>': return numActual > numValue;
            case '<': return numActual < numValue;
            case '==': return numActual === numValue;
            case '!=': return numActual !== numValue;
            default: return true; // Operator tidak dikenal, anggap true
        }
    });
};
