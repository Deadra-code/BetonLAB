// File baru: src/hooks/useAllTrials.js
import { useState, useCallback, useEffect } from 'react';
import * as api from '../api/electronAPI';

export const useAllTrials = (apiReady) => {
    const [allTrials, setAllTrials] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllTrials = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const list = await api.getAllTrials();
            setAllTrials(list);
        } catch (err) {
            console.error("Fetch all trials error:", err);
        } finally {
            setLoading(false);
        }
    }, [apiReady]);

    useEffect(() => {
        fetchAllTrials();
    }, [fetchAllTrials]);

    return { allTrials, loading, refreshAllTrials: fetchAllTrials };
};
