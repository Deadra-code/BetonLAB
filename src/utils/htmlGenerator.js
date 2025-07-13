// Lokasi file: src/utils/htmlGenerator.js
// Deskripsi: Versi lengkap dari generator HTML dengan semua logika rendering komponen.

const renderComponentToHtml = (component, reportData, settings) => {
    const { id, properties = {} } = component;
    const trialData = reportData?.trials?.[0] || {};
    
    const replacePlaceholders = (text) => {
        if (!text) return '';
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

    switch(id) {
        case 'header':
            return `<header style="display: flex; align-items: center; border-bottom: 2px solid black; padding-bottom: 1rem; margin-bottom: 1rem;">
                        <div>
                            <h2 style="font-size: 1.5rem; font-weight: bold; margin: 0;">${settings.companyName || 'Nama Perusahaan'}</h2>
                            <p style="margin: 0;">Laporan Laboratorium Beton</p>
                        </div>
                    </header>`;
        case 'custom-text':
            const style = `font-size: ${properties.fontSize || 12}pt; text-align: ${properties.align || 'left'}; font-weight: ${properties.isBold ? 'bold' : 'normal'}; font-style: ${properties.isItalic ? 'italic' : 'normal'}; text-decoration: ${properties.isUnderline ? 'underline' : 'none'}; color: ${properties.color || '#000'}; font-family: ${properties.fontFamily || 'Arial'};`;
            return `<div style="${style}">${replacePlaceholders(properties.content || '')}</div>`;
        case 'jmd-table':
            const { design_result } = trialData;
            if (!design_result) return '<p>Data JMD tidak tersedia</p>';
            return `<h4>Tabel Job Mix</h4>
                    <table border="1" style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                        <thead><tr style="background-color: #f3f4f6;"><th colspan="2" style="padding: 5px; text-align: left;">Proporsi (Koreksi Lapangan)</th></tr></thead>
                        <tbody>
                            <tr><td style="padding: 5px;">Semen</td><td style="padding: 5px;">${design_result.cementContent?.toFixed(2)} kg/m³</td></tr>
                            <tr><td style="padding: 5px;">Air</td><td style="padding: 5px;">${design_result.correctedWater?.toFixed(2)} kg/m³</td></tr>
                            <tr><td style="padding: 5px;">Agregat Kasar Lembab</td><td style="padding: 5px;">${design_result.correctedCoarseWeight?.toFixed(2)} kg/m³</td></tr>
                            <tr><td style="padding: 5px;">Agregat Halus Lembab</td><td style="padding: 5px;">${design_result.correctedFineWeight?.toFixed(2)} kg/m³</td></tr>
                        </tbody>
                    </table>`;
        case 'horizontal-line':
            return '<hr style="margin: 1rem 0;" />';
        case 'page-break':
            return '<div style="page-break-after: always;"></div>';
        case 'script-block':
             let output = '';
             try {
                const func = new Function('trial', properties.script || '');
                const result = func(trialData);
                output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
             } catch (e) {
                output = `Error Skrip: ${e.message}`;
             }
             return `<pre style="background-color: #f3f4f6; border: 1px solid #e5e7eb; padding: 10px; font-family: monospace; white-space: pre-wrap;">${output}</pre>`;
        default:
            return `<div style="border: 1px dashed grey; padding: 1rem; margin: 0.5rem 0; text-align: center; color: grey;">[Komponen: ${component.name}]</div>`;
    }
};

export const generateHtmlFromLayout = async ({ layout, reportData, settings }) => {
    let bodyContent = '';

    for (const page of layout) {
        for (const component of page) {
            bodyContent += renderComponentToHtml(component, reportData, settings);
        }
        bodyContent += '<div style="page-break-after: always;"></div>';
    }

    return `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Laporan - ${reportData.projectName}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
                @media print {
                    body { -webkit-print-color-adjust: exact; margin: 0; }
                }
            </style>
        </head>
        <body>
            ${bodyContent}
        </body>
        </html>
    `;
};
