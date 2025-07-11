import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useMaterials = (apiReady) => {
    const [materials, setMaterials] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);

    const fetchMaterials = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getMaterials();
            setMaterials(list);
        } catch (err) {
            console.error("Fetch materials error:", err);
            notify.error("Gagal memuat pustaka material.");
        } finally {
            setLoading(false);
        }
        // PERBAIKAN: Menghapus `notify` dari dependency array untuk mencegah infinite loop.
    }, [apiReady]);

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
            notify.error("Gagal menambahkan material. Nama mungkin sudah ada.");
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
            notify.error("Gagal memperbarui material.");
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
            notify.error("Gagal menghapus material.");
            return false;
        }
    };

    return {
        materials,
        loading,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        refreshMaterials: fetchMaterials,
    };
};
