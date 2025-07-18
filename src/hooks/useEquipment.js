// Lokasi file: src/hooks/useEquipment.js
// Deskripsi: Custom hook untuk mengelola state dan operasi CRUD untuk peralatan lab.

import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useEquipment = (apiReady) => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotifier();

    const fetchEquipment = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getEquipment();
            setEquipment(list);
        } catch (err) {
            notify.error("Gagal memuat daftar peralatan.");
        } finally {
            setLoading(false);
        }
    }, [apiReady, notify]);

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    const addEquipment = async (data) => {
        try {
            await api.addEquipment(data);
            await fetchEquipment();
            notify.success("Peralatan baru berhasil ditambahkan.");
            return true;
        } catch (err) {
            notify.error(`Gagal: ${err.message}`);
            return false;
        }
    };

    const updateEquipment = async (data) => {
        try {
            await api.updateEquipment(data);
            await fetchEquipment();
            notify.success("Data peralatan berhasil diperbarui.");
            return true;
        } catch (err) {
            notify.error(`Gagal: ${err.message}`);
            return false;
        }
    };

    const deleteEquipment = async (id) => {
        try {
            await api.deleteEquipment(id);
            await fetchEquipment();
            notify.success("Peralatan berhasil dihapus.");
            return true;
        } catch (err) {
            notify.error(`Gagal: ${err.message}`);
            return false;
        }
    };

    return { equipment, loading, addEquipment, updateEquipment, deleteEquipment };
};
