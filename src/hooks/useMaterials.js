import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useMaterials = (apiReady) => {
    const [materials, setMaterials] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);
    const [showArchived, setShowArchived] = useState(false); // Tambahkan state untuk arsip

    const fetchMaterials = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            // PERBAIKAN: Menggunakan getMaterialsWithActiveTests untuk mendapatkan data yang lebih kaya
            // dan meneruskan status filter arsip.
            const list = await api.getMaterialsWithActiveTests(showArchived);
            setMaterials(list);
        } catch (err) {
            console.error("Fetch materials error:", err);
            notify.error("Gagal memuat pustaka material.");
        } finally {
            setLoading(false);
        }
    }, [apiReady, showArchived, notify]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const addMaterial = async (material) => {
        try {
            await api.addMaterial(material);
            await fetchMaterials();
            notify.success("Material baru berhasil ditambahkan.");
            return true;
        } catch (err) {
            console.error("Add material error:", err);
            notify.error(`Gagal menambahkan material: ${err.message || 'Nama mungkin sudah ada.'}`);
            return false;
        }
    };

    const updateMaterial = async (material) => {
        try {
            await api.updateMaterial(material);
            await fetchMaterials();
            notify.success("Material berhasil diperbarui.");
            return true;
        } catch (err) {
            console.error("Update material error:", err);
            notify.error(`Gagal memperbarui material: ${err.message}`);
            return false;
        }
    };
    
    const deleteMaterial = async (id) => {
        try {
            await api.deleteMaterial(id);
            await fetchMaterials();
            notify.success("Material berhasil dihapus.");
            return true;
        } catch (err) {
            console.error("Delete material error:", err);
            notify.error(`Gagal menghapus material: ${err.message}`);
            return false;
        }
    };

    const setMaterialStatus = async (id, status) => {
        try {
            await api.setMaterialStatus({ id, status });
            await fetchMaterials();
            notify.success(`Status material berhasil diubah.`);
            return true;
        } catch (err) {
            notify.error(`Gagal mengubah status material: ${err.message}`);
            return false;
        }
    };

    return {
        materials,
        loading,
        showArchived,
        setShowArchived,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        setMaterialStatus,
        refreshMaterials: fetchMaterials,
    };
};
