// Lokasi file: src/hooks/useProjects.js

import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useProjects = (apiReady) => {
    const [projects, setProjects] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);
    const [showArchived, setShowArchived] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getProjects(showArchived);
            setProjects(list);
        } catch (err) {
            notify.error("Gagal memuat daftar proyek.");
        } finally {
            setLoading(false);
        }
    }, [apiReady, showArchived, notify]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);
    
    const addProject = async (projectData) => {
        try {
            await api.addProject(projectData);
            await fetchProjects();
            notify.success("Proyek baru berhasil ditambahkan.");
            return true;
        } catch (err) {
            notify.error("Gagal menambahkan proyek baru.");
            return false;
        }
    };

    const updateProject = async (projectData) => {
        try {
            await api.updateProject(projectData);
            await fetchProjects();
            notify.success("Proyek berhasil diperbarui.");
            return true;
        } catch (err) {
            notify.error("Gagal memperbarui proyek.");
            return false;
        }
    };
    
    const deleteProject = async (id) => {
        try {
            await api.deleteProject(id);
            await fetchProjects();
            notify.success("Proyek berhasil dihapus.");
            return true;
        } catch (err) {
            notify.error("Gagal menghapus proyek.");
            return false;
        }
    };

    const setProjectStatus = async (id, status) => {
        try {
            await api.setProjectStatus({ id, status });
            await fetchProjects();
            notify.success(`Proyek berhasil di${status === 'active' ? 'aktifkan kembali' : 'arsipkan'}.`);
            return true;
        } catch (err) {
            notify.error("Gagal mengubah status proyek.");
            return false;
        }
    };

    return {
        projects,
        loading,
        showArchived,
        setShowArchived,
        addProject,
        updateProject,
        deleteProject,
        setProjectStatus,
        refreshProjects: fetchProjects,
    };
};
