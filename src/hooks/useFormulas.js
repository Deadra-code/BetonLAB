// src/hooks/useFormulas.js
// Deskripsi: Custom hook untuk mengambil dan mengelola data formula dari database.

import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useFormulas = (apiReady) => {
    const [formulas, setFormulas] = useState({});
    const [loading, setLoading] = useState(false);
    const { notify } = useNotifier();

    const fetchFormulas = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getFormulas();
            // Ubah array menjadi objek yang diindeks oleh formula_key untuk akses mudah
            const formulaObject = list.reduce((acc, item) => {
                acc[item.formula_key] = item;
                return acc;
            }, {});
            setFormulas(formulaObject);
        } catch (err) {
            notify.error("Gagal memuat data formula dari database.");
            console.error("Fetch formulas error:", err);
        } finally {
            setLoading(false);
        }
    }, [apiReady, notify]);

    useEffect(() => {
        fetchFormulas();
    }, [fetchFormulas]);

    // Fungsi update yang akan dipanggil oleh halaman UI
    const updateFormula = async ({ id, formula_value }) => {
        try {
            await api.updateFormula({ id, formula_value });
            notify.success("Formula berhasil diperbarui.");
            await fetchFormulas(); // Muat ulang data setelah update
            return true;
        } catch (err) {
            notify.error(`Gagal memperbarui formula: ${err.message}`);
            return false;
        }
    };

    return { formulas, loading, updateFormula, refreshFormulas: fetchFormulas };
};
