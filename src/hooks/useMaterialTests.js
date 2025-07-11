import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI'; // Pastikan path ini benar

export const useMaterialTests = (materialId) => {
    const [tests, setTests] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTests = useCallback(async () => {
        if (!materialId) {
            setTests([]);
            return;
        };
        setLoading(true);
        try {
            const list = await api.getTestsForMaterial(materialId);
            // Parse JSON data dari backend
            const parsedList = list.map(test => ({
                ...test,
                input_data: JSON.parse(test.input_data_json || '{}'),
                result_data: JSON.parse(test.result_data_json || '{}'),
            }));
            setTests(parsedList);
            setError('');
        } catch (err) {
            console.error(`Fetch tests error for material ${materialId}:`, err);
            setError("Gagal memuat data pengujian.");
        } finally {
            setLoading(false);
        }
    }, [materialId]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const addTest = async (testData) => {
        if (!materialId) return false;
        try {
            await api.addMaterialTest({ material_id: materialId, ...testData });
            await fetchTests(); // Refresh list
            return true;
        } catch (err) {
            console.error("Add test error:", err);
            setError("Gagal menyimpan hasil pengujian.");
            return false;
        }
    };
    
    const setActiveTest = async ({ testType, testId }) => {
        if (!materialId) return false;
         try {
            await api.setActiveMaterialTest({ materialId, testType, testId });
            await fetchTests(); // Refresh list
            return true;
        } catch (err) {
            console.error("Set active test error:", err);
            setError("Gagal mengaktifkan hasil pengujian.");
            return false;
        }
    };

    return {
        tests,
        loading,
        testError: error,
        addTest,
        setActiveTest,
    };
};
