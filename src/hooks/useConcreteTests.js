import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useConcreteTests = (trialId) => {
    const [tests, setTests] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { notify } = useNotifier();

    const fetchTests = useCallback(async () => {
        if (!trialId) {
            setTests([]);
            return;
        };
        setLoading(true);
        try {
            const list = await api.getTestsForTrial(trialId);
            const parsedList = list.map(test => ({
                ...test,
                input_data: JSON.parse(test.input_data_json || '{}'),
                result_data: JSON.parse(test.result_data_json || '{}'),
            }));
            setTests(parsedList);
            setError('');
        } catch (err) {
            console.error(`Fetch concrete tests error for trial ${trialId}:`, err);
            setError("Gagal memuat data uji beton.");
            notify.error("Gagal memuat data uji beton.");
        } finally {
            setLoading(false);
        }
    // PERBAIKAN: Menghapus `notify` dari dependency array untuk memutus infinite loop.
    }, [trialId]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const addTest = async (testData) => {
        if (!trialId) return false;
        try {
            await api.addConcreteTest({ trial_id: trialId, ...testData });
            await fetchTests();
            notify.success("Benda uji berhasil ditambahkan.");
            return true;
        } catch (err) {
            console.error("Add concrete test error:", err);
            setError("Gagal menambahkan benda uji.");
            notify.error("Gagal menambahkan benda uji.");
            return false;
        }
    };
    
    const updateTest = async (testData) => {
        if (!testData.id) return false;
        try {
            await api.updateConcreteTest(testData);
            await fetchTests();
            notify.success("Data benda uji berhasil diperbarui.");
            return true;
        } catch (err) {
            console.error("Update concrete test error:", err);
            setError("Gagal memperbarui data benda uji.");
            notify.error("Gagal memperbarui data benda uji.");
            return false;
        }
    };
    
    const deleteTest = async (id) => {
        if (!id) return false;
        try {
            await api.deleteConcreteTest(id);
            await fetchTests();
            notify.success("Benda uji berhasil dihapus.");
            return true;
        } catch (err) {
            console.error("Delete concrete test error:", err);
            setError("Gagal menghapus benda uji.");
            notify.error("Gagal menghapus benda uji.");
            return false;
        }
    };
    
    return {
        tests,
        loading,
        testError: error,
        addTest,
        updateTest,
        deleteTest,
    };
};
