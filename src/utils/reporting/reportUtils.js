// Lokasi file: src/utils/reporting/reportUtils.js
// Deskripsi: Menambahkan placeholder baru untuk detail klien dan permohonan.

// Mengganti placeholder dalam teks dengan data yang relevan.
export const replacePlaceholders = (text, reportData, settings) => {
    if (!text) return '';
    const trialData = reportData?.trials?.[0] || {};
    const replacements = {
        '{{nama_proyek}}': reportData?.projectName || '',
        '{{nama_klien}}': reportData?.clientName || '',
        '{{tanggal_laporan}}': new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}),
        
        // --- DATA PROYEK BARU ---
        '{{client_address}}': reportData?.clientAddress || '',
        '{{client_contact_person}}': reportData?.clientContactPerson || '',
        '{{client_contact_number}}': reportData?.clientContactNumber || '',
        '{{request_number}}': reportData?.requestNumber || '',
        '{{request_date}}': reportData?.requestDate ? new Date(reportData.requestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric'}) : '',
        '{{testing_requests}}': reportData?.testingRequests || '',
        '{{project_notes}}': reportData?.projectNotes || '',
        '{{request_letter_path}}': reportData?.requestLetterPath || '',

        // --- DATA TRIAL ---
        '{{nama_trial}}': trialData?.trial_name || '',
        '{{fc}}': trialData?.design_input?.fc || '',
        '{{fcr}}': trialData?.design_result?.fcr?.toFixed(2) || '',
        '{{slump}}': trialData?.design_input?.slump || '',
        '{{fas}}': trialData?.design_result?.wcRatio?.toFixed(2) || '',
    };
    return text.replace(/\{\{.*?\}\}/g, match => replacements[match] || match);
};

// Mengevaluasi apakah sebuah komponen harus ditampilkan berdasarkan serangkaian kondisi.
export const checkConditions = (conditions = [], reportData) => {
    if (!conditions || conditions.length === 0) return true;
    const trialData = reportData?.trials?.[0];
    if (!trialData) return true; // Jika tidak ada data, asumsikan kondisi terpenuhi untuk ditampilkan.

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
