import { useState, useEffect } from 'react';
import * as api from '../api/electronAPI';
import { useNotifier } from './useNotifier';

export const useSettings = (apiReady) => {
    const [settings, setSettings] = useState({ theme: 'light', companyName: 'Laboratorium Beton Anda', logoPath: '' });
    const { notify } = useNotifier();

    useEffect(() => {
        const fetchSettings = async () => {
            const savedSettings = await api.getSettings();
            if (savedSettings && Object.keys(savedSettings).length > 0) {
                setSettings(prev => ({ ...prev, ...savedSettings }));
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

    const handleUpdateSetting = (key, value) => {
        api.setSetting(key, value).catch(err => console.error(err));
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSelectLogo = async () => {
        const filePath = await api.openImageDialog();
        if (filePath) {
            const savedPath = await api.saveLogoFile(filePath);
            handleUpdateSetting('logoPath', savedPath);
            notify.success('Logo berhasil diperbarui.');
        }
    };

    const handleBackupDatabase = async () => {
        const result = await api.backupDatabase();
        if (result.success) {
            notify.success(`Database berhasil di-backup ke: ${result.path}`);
        } else if (result.error !== 'Backup canceled') {
            notify.error(`Backup gagal: ${result.error}`);
        }
    };

    const handleRestoreDatabase = async () => {
        const result = await api.restoreDatabase();
        // A success notification is not needed because the app will restart.
        if (result && !result.success && result.error !== 'Restore canceled') {
             notify.error(`Restore gagal: ${result.error}`);
        }
    };

    return { settings, handleUpdateSetting, handleSelectLogo, handleBackupDatabase, handleRestoreDatabase };
};
