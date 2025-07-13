// Lokasi file: src/hooks/useSettings.js
// Deskripsi: Versi lengkap dengan logika untuk mencatat dan memeriksa tanggal backup terakhir.

import { useState, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useSettings = (apiReady) => {
    const [settings, setSettings] = useState({ 
        theme: 'light', 
        companyName: 'Laboratorium Beton Anda', 
        logoPath: '',
        logoBase64: '',
        lastBackupDate: null,
        hasCompletedTour: false,
    });
    const { notify } = useNotifier();

    useEffect(() => {
        const fetchSettings = async () => {
            const savedSettings = await api.getSettings();
            if (savedSettings && Object.keys(savedSettings).length > 0) {
                const parsedSettings = {
                    ...savedSettings,
                    lastBackupDate: savedSettings.lastBackupDate ? new Date(savedSettings.lastBackupDate) : null,
                    hasCompletedTour: savedSettings.hasCompletedTour === 'true'
                };
                if (parsedSettings.logoPath) {
                    const base64 = await api.readFileAsBase64(parsedSettings.logoPath);
                    parsedSettings.logoBase64 = base64;
                }
                setSettings(prev => ({ ...prev, ...parsedSettings }));
            }
        };
        if (apiReady) {
            fetchSettings();
        }
    }, [apiReady]);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(settings.theme);
        document.documentElement.style.colorScheme = settings.theme;
    }, [settings.theme]);

    const handleUpdateSetting = async (key, value) => {
        const valueToStore = value instanceof Date ? value.toISOString() : String(value);
        await api.setSetting(key, valueToStore);
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectLogo = async () => {
        const filePath = await api.openImageDialog();
        if (filePath) {
            try {
                const savedPath = await api.saveLogoFile(filePath);
                const base64 = await api.readFileAsBase64(savedPath);
                await handleUpdateSetting('logoPath', savedPath);
                setSettings(prev => ({ ...prev, logoBase64: base64, logoPath: savedPath }));
                notify.success('Logo berhasil diperbarui.');
            } catch (error) {
                notify.error('Gagal menyimpan logo.');
            }
        }
    };

    const handleBackupDatabase = async () => {
        const result = await api.backupDatabase();
        if (result.success) {
            notify.success(`Database berhasil di-backup ke: ${result.path}`);
            await handleUpdateSetting('lastBackupDate', new Date());
        } else if (result.error !== 'Backup canceled') {
            notify.error(`Backup gagal: ${result.error}`);
        }
    };

    const handleRestoreDatabase = async () => {
        const result = await api.restoreDatabase();
        if (result && !result.success && result.error !== 'Restore canceled') {
             notify.error(`Restore gagal: ${result.error}`);
        }
    };

    return { settings, handleUpdateSetting, handleSelectLogo, handleBackupDatabase, handleRestoreDatabase };
};
