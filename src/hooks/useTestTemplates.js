import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useTestTemplates = (apiReady) => {
    const [templates, setTemplates] = useState([]);
    const { notify } = useNotifier();
    const [loading, setLoading] = useState(false);

    const fetchTemplates = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getTestTemplates();
            // Parse JSON data dari backend
            const parsedList = list.map(template => ({
                ...template,
                tests: JSON.parse(template.tests_json || '[]'),
            }));
            setTemplates(parsedList);
        } catch (err) {
            console.error("Fetch test templates error:", err);
            notify.error("Gagal memuat template pengujian.");
        } finally {
            setLoading(false);
        }
    }, [apiReady]); // PERBAIKAN: 'notify' dihapus dari dependency array

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const addTemplate = async (templateData) => {
        try {
            const payload = { ...templateData, tests_json: JSON.stringify(templateData.tests || []) };
            await api.addTestTemplate(payload);
            await fetchTemplates(); // Refresh list
            notify.success("Template berhasil ditambahkan.");
            return true;
        } catch (err) {
            console.error("Add template error:", err);
            notify.error("Gagal menambahkan template.");
            return false;
        }
    };

    const deleteTemplate = async (id) => {
        try {
            await api.deleteTestTemplate(id);
            await fetchTemplates(); // Refresh list
            notify.success("Template berhasil dihapus.");
            return true;
        } catch (err) {
            console.error("Delete template error:", err);
            notify.error("Gagal menghapus template.");
            return false;
        }
    };

    return {
        templates,
        loading,
        addTemplate,
        deleteTemplate,
    };
};
