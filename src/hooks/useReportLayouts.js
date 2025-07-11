// Lokasi file: src/hooks/useReportLayouts.js
// Deskripsi: Hook untuk mengelola state layout laporan kustom (Report Builder v2.0).

import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useReportLayouts = (apiReady) => {
    const [layouts, setLayouts] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);

    const fetchLayouts = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getReportLayouts();
            setLayouts(list);
        } catch (err) {
            notify.error("Gagal memuat template laporan.");
            console.error("Fetch report layouts error:", err);
        } finally {
            setLoading(false);
        }
    }, [apiReady, notify]);

    useEffect(() => {
        fetchLayouts();
    }, [fetchLayouts]);

    const addLayout = async (layoutData) => {
        try {
            await api.addReportLayout(layoutData);
            await fetchLayouts();
            notify.success("Template laporan berhasil ditambahkan.");
            return true;
        } catch (err) {
            notify.error("Gagal menambahkan template. Nama mungkin sudah ada.");
            return false;
        }
    };

    const updateLayout = async (layoutData) => {
        try {
            await api.updateReportLayout(layoutData);
            await fetchLayouts();
            notify.success("Template laporan berhasil diperbarui.");
            return true;
        } catch (err) {
            notify.error("Gagal memperbarui template.");
            return false;
        }
    };

    const deleteLayout = async (id) => {
        try {
            await api.deleteReportLayout(id);
            await fetchLayouts();
            notify.success("Template laporan berhasil dihapus.");
            return true;
        } catch (err) {
            notify.error("Gagal menghapus template.");
            return false;
        }
    };

    return { layouts, loading, addLayout, updateLayout, deleteLayout, refresh: fetchLayouts };
};
