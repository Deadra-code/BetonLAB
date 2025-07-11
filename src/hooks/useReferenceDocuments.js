// Lokasi file: src/hooks/useReferenceDocuments.js
// Deskripsi: Hook dimodifikasi untuk menerima flag 'enabled'.

import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useReferenceDocuments = (enabled = true) => { // PERUBAHAN: Parameter diubah menjadi 'enabled'
    const [documents, setDocuments] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        // PERUBAHAN: Fetch hanya berjalan jika 'enabled' bernilai true
        if (!enabled) {
            setDocuments([]); // Kosongkan data jika tidak aktif
            return;
        };
        setLoading(true);
        try {
            const list = await api.getReferenceDocuments();
            setDocuments(list);
        } catch (err) {
            console.error("Fetch reference documents error:", err);
            notify.error("Gagal memuat pustaka referensi.");
        } finally {
            setLoading(false);
        }
    }, [enabled, notify]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const addDocument = async (docData) => {
        try {
            await api.addReferenceDocument(docData);
            await fetchDocuments();
            notify.success("Dokumen berhasil ditambahkan.");
            return true;
        } catch (err) {
            notify.error("Gagal menambahkan dokumen.");
            return false;
        }
    };

    const deleteDocument = async (id) => {
        try {
            await api.deleteReferenceDocument(id);
            await fetchDocuments();
            notify.success("Dokumen berhasil dihapus.");
            return true;
        } catch (err) {
            notify.error("Gagal menghapus dokumen.");
            return false;
        }
    };

    return {
        documents,
        loading,
        addDocument,
        deleteDocument,
    };
};
