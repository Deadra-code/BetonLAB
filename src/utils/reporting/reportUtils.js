// Lokasi file: src/utils/reporting/reportUtils.js
// Deskripsi: File utilitas terpusat untuk fungsi-fungsi yang digunakan oleh fitur pelaporan.

// Mengganti placeholder dalam teks dengan data yang relevan.
export const replacePlaceholders = (text, reportData, settings) => {
    if (!text) return '';
    const trialData = reportData?.trials?.[0] || {};
    const replacements = {
        '{{nama_proyek}}': reportData?.projectName || '',
        '{{nama_klien}}': reportData?.clientName || '',
        '{{nama_trial}}': trialData?.trial_name || '',
        '{{tanggal_laporan}}': new Date().toLocaleDateString('id-ID'),
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
