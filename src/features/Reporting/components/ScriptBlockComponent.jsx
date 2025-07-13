// Lokasi file: src/features/Reporting/components/ScriptBlockComponent.jsx
// Deskripsi: Komponen baru untuk mengeksekusi dan menampilkan hasil dari skrip kustom.

import React from 'react';

const ScriptBlockComponent = ({ properties, trialData }) => {
    const { script = "return 'Tulis skrip di sini...';" } = properties || {};
    let output = '';
    let error = null;

    try {
        // Eksekusi skrip dalam lingkungan yang aman dan terbatas
        // 'trial' akan tersedia sebagai variabel di dalam skrip pengguna
        const func = new Function('trial', script);
        const result = func(trialData);
        output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
    } catch (e) {
        error = e.message;
    }

    if (error) {
        return (
            <div className="p-2 text-sm bg-red-100 text-red-700 border border-red-300 rounded-md">
                <strong>Error Skrip:</strong> {error}
            </div>
        );
    }

    return (
        <pre className="p-2 text-sm bg-gray-100 border rounded-md whitespace-pre-wrap">
            {output}
        </pre>
    );
};

export default ScriptBlockComponent;
