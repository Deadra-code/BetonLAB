// Lokasi file: src/utils/reporting/reportUtils.js
// Deskripsi: Diperbarui dengan semua placeholder yang tersedia.

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

export const checkConditions = (conditions = [], reportData) => {
    if (!conditions || conditions.length === 0) return true;
    const trialData = reportData?.trials?.[0];
    if (!trialData) return true;

    return conditions.every(cond => {
        const { field, operator, value } = cond;
        const actualValue = trialData.design_result?.[field];
        if (actualValue === undefined || value === '') return true;
        const numActual = parseFloat(actualValue);
        const numValue = parseFloat(value);
        switch (operator) {
            case '>': return numActual > numValue;
            case '<': return numActual < numValue;
            case '==': return numActual === numValue;
            case '!=': return numActual !== numValue;
            default: return true;
        }
    });
};
