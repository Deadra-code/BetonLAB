import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useTrials = (projectId) => {
    const [trials, setTrials] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);

    const fetchTrials = useCallback(async () => {
        if (!projectId) {
            setTrials([]);
            return;
        };
        setLoading(true);
        try {
            const list = await api.getTrialsForProject(projectId);
            const parsedList = list.map(trial => ({
                ...trial,
                design_input: JSON.parse(trial.design_input_json || '{}'),
                design_result: JSON.parse(trial.design_result_json || '{}'),
                // Pastikan notes juga ada, meskipun kosong
                notes: trial.notes || '',
            }));
            setTrials(parsedList);
        } catch (err) {
            console.error(`Fetch trials error for project ${projectId}:`, err);
            notify.error("Gagal memuat data trial mix.");
        } finally {
            setLoading(false);
        }
        // PERBAIKAN: Menghapus `notify` dari dependency array untuk mencegah infinite loop.
    }, [projectId]);

    useEffect(() => {
        fetchTrials();
    }, [fetchTrials]);

    const addTrial = async (trialData) => {
        if (!projectId) return false;
        try {
            const payload = { 
                ...trialData, 
                project_id: projectId, 
                design_input_json: JSON.stringify(trialData.design_input || {}), 
                design_result_json: JSON.stringify(trialData.design_result || {}),
                notes: trialData.notes || '' 
            };
            await api.addTrial(payload);
            await fetchTrials();
            notify.success("Trial mix baru berhasil ditambahkan.");
            return true;
        } catch (err) {
            console.error("Add trial error:", err);
            notify.error("Gagal menyimpan trial mix baru.");
            return false;
        }
    };

    const updateTrial = async (trialData) => {
        if (!trialData.id) return false;
        try {
            const payload = { 
                ...trialData, 
                design_input_json: JSON.stringify(trialData.design_input || {}), 
                design_result_json: JSON.stringify(trialData.design_result || {}),
                notes: trialData.notes || ''
            };
            await api.updateTrial(payload);
            await fetchTrials();
            notify.success("Trial mix berhasil diperbarui.");
            return true;
        } catch (err) {
            console.error("Update trial error:", err);
            notify.error("Gagal memperbarui trial mix.");
            return false;
        }
    };

    const deleteTrial = async (id) => {
        if (!id) return false;
        try {
            await api.deleteTrial(id);
            await fetchTrials();
            notify.success("Trial mix berhasil dihapus.");
            return true;
        } catch (err) {
            console.error("Delete trial error:", err);
            notify.error("Gagal menghapus trial mix.");
            return false;
        }
    };
    
    return {
        trials,
        loading,
        addTrial,
        updateTrial,
        deleteTrial,
    };
};
