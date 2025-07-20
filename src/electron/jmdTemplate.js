// src/electron/jmdTemplate.js
// Deskripsi: Berisi data JSON untuk template laporan JMD bawaan.

const JMD_TEMPLATE_JSON = JSON.stringify({
  "layout": [
    // Halaman 1
    {
      "header": { "id": "header", "instanceId": "header-1718683201", "properties": {} },
      "components": [
        { "id": "custom-text", "instanceId": "custom-text-1718683202", "properties": { "content": "LAPORAN RENCANA CAMPURAN BETON\n(JOB MIX DESIGN)", "fontSize": 18, "isBold": true, "align": "center" } },
        { "id": "vertical-spacer", "instanceId": "vertical-spacer-1718683203", "properties": { "height": 20 } },
        { "id": "columns", "instanceId": "columns-1718683204", "properties": { "columnCount": 2 }, "children": [ [ { "id": "client-info-block", "instanceId": "client-info-block-1718683205", "properties": {} } ], [ { "id": "trial-info-block", "instanceId": "trial-info-block-1718683206", "properties": {} } ] ] },
        { "id": "vertical-spacer", "instanceId": "vertical-spacer-1718683207", "properties": { "height": 10 } },
        { "id": "custom-text", "instanceId": "custom-text-1718683208", "properties": { "content": "Ringkasan Hasil Utama:", "fontSize": 12, "isBold": true } },
        { "id": "columns", "instanceId": "columns-1718683209", "properties": { "columnCount": 2 }, "children": [ [ { "id": "dynamic-placeholder", "instanceId": "dynamic-placeholder-1718683210", "properties": { "label": "Faktor Air/Semen (FAS): ", "placeholder": "{{fas}}", "isBold": true } } ], [ { "id": "dynamic-placeholder", "instanceId": "dynamic-placeholder-1718683211", "properties": { "label": "Kadar Semen: ", "placeholder": "{{cementContent}}", "suffix": " kg/m³", "isBold": true } } ] ] },
        { "id": "signature-block", "instanceId": "signature-block-1718683212", "properties": { "columnCount": 2, "label1": "Disiapkan oleh,", "name1": "", "position1": "Teknisi Lab", "label2": "Diperiksa oleh,", "name2": "", "position2": "Penyelia" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683213", "properties": {} }
    },
    // Halaman 2
    {
      "header": { "id": "header", "instanceId": "header-1718683214", "properties": {} },
      "components": [
        { "id": "material-properties-table", "instanceId": "material-properties-table-1718683215", "properties": { "title": "1. Properti Material yang Digunakan" } },
        { "id": "jmd-table", "instanceId": "jmd-table-1718683216", "properties": { "title": "2. Proporsi Rencana Campuran per 1 m³" } },
        { "id": "combined-gradation-chart", "instanceId": "combined-gradation-chart-1718683217", "properties": { "title": "3. Grafik Gradasi Gabungan Agregat" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683218", "properties": {} }
    },
    // Halaman 3
    {
      "header": { "id": "header", "instanceId": "header-1718683219", "properties": {} },
      "components": [
        { "id": "strength-chart", "instanceId": "strength-chart-1718683220", "properties": { "title": "4. Grafik Perkembangan Kuat Tekan Beton" } },
        { "id": "strength-summary-table", "instanceId": "strength-summary-table-1718683221", "properties": { "title": "5. Ringkasan Hasil Uji Kuat Tekan Rata-rata" } },
        { "id": "raw-strength-table", "instanceId": "raw-strength-table-1718683222", "properties": { "title": "6. Data Mentah Hasil Uji Kuat Tekan" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683223", "properties": {} }
    },
    // Halaman 4
    {
      "header": { "id": "header", "instanceId": "header-1718683224", "properties": {} },
      "components": [
        { "id": "custom-text", "instanceId": "custom-text-1718683225", "properties": { "content": "7. Catatan & Kesimpulan\n\n- ...\n- ...\n- ...", "fontSize": 12, "isBold": true } },
        { "id": "vertical-spacer", "instanceId": "vertical-spacer-1718683226", "properties": { "height": 40 } },
        { "id": "signature-block", "instanceId": "signature-block-1718683227", "properties": { "columnCount": 2, "label1": "Menyetujui,", "name1": "", "position1": "Kepala Laboratorium", "label2": "", "name2": "", "position2": "" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683228", "properties": {} }
    }
  ],
  "pageSettings": { "size": "a4", "orientation": "portrait" }
});

module.exports = JMD_TEMPLATE_JSON;
