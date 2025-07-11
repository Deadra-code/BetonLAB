// Lokasi file: src/hooks/useNotifications.js

import { useEffect, useState } from 'react';
import * as api from '../api/electronAPI';

/**
 * Custom hook untuk menangani notifikasi di seluruh aplikasi.
 * @param {boolean} apiReady - Flag untuk menandakan API Electron sudah siap.
 * @returns {{notifications: Array, loading: boolean}}
 */
export const useNotifications = (apiReady) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!apiReady) return;

        const checkSpecimenDeadlines = async () => {
            setLoading(true);
            try {
                const specimens = await api.getDueSpecimens();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const upcomingNotifications = specimens.map(specimen => {
                    const castingDate = new Date(specimen.casting_date);
                    const dueDate = new Date(castingDate.getTime());
                    dueDate.setDate(dueDate.getDate() + specimen.age_days);
                    dueDate.setHours(0, 0, 0, 0);

                    const timeDiff = dueDate.getTime() - today.getTime();
                    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    let message = '';
                    if (dayDiff === 0) {
                        message = `Pengujian Hari Ini: Benda uji "${specimen.specimen_id}" (${specimen.trial_name}) jatuh tempo.`;
                    } else if (dayDiff === 1) {
                        message = `Pengujian Besok: Benda uji "${specimen.specimen_id}" (${specimen.trial_name}) jatuh tempo.`;
                    }

                    if (message) {
                        return {
                            id: specimen.id,
                            message,
                            context: { // Data untuk navigasi
                                projectId: specimen.projectId,
                                trialId: specimen.trialId,
                                specimenId: specimen.id,
                            }
                        };
                    }
                    return null;
                }).filter(Boolean); // Hapus item null dari array

                setNotifications(upcomingNotifications);
            } catch (error) {
                console.error("Gagal memeriksa notifikasi:", error);
            } finally {
                setLoading(false);
            }
        };

        checkSpecimenDeadlines();
        // Set interval untuk memeriksa setiap jam
        const intervalId = setInterval(checkSpecimenDeadlines, 3600000); 

        return () => clearInterval(intervalId);
    }, [apiReady]);
    
    return { notifications, loading };
};
