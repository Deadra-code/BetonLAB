// Lokasi file: src/electron/ipcHandlers/appHandlers.js
// Deskripsi: Handler untuk info aplikasi, backup, dan restore.

const { app, dialog } = require('electron');
const fs = require('fs');
const log = require('electron-log');

function registerAppHandlers(ipcMain, db) {
    const dbPath = db.filename;

    ipcMain.handle('app:get-info', () => {
        return {
            name: app.getName(),
            version: app.getVersion(),
        };
    });

    ipcMain.handle('db:backup', async () => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Backup Database',
            defaultPath: `betonlab-backup-${new Date().toISOString().split('T')[0]}.db`,
            filters: [{ name: 'Database Files', extensions: ['db'] }]
        });
        if (!canceled && filePath) {
            try {
                fs.copyFileSync(dbPath, filePath);
                log.info(`Database backup successful to ${filePath}`);
                return { success: true, path: filePath };
            } catch (error) {
                log.error('Backup failed:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'Backup canceled' };
    });

    ipcMain.handle('db:restore', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: 'Restore Database',
            properties: ['openFile'],
            filters: [{ name: 'Database Files', extensions: ['db'] }]
        });
        if (!canceled && filePaths.length > 0) {
            const backupPath = filePaths[0];
            const confirmation = await dialog.showMessageBox({
                type: 'warning',
                buttons: ['Batal', 'Ya, Pulihkan Data'],
                defaultId: 0,
                title: 'Konfirmasi Pemulihan Data',
                message: 'Anda yakin ingin memulihkan data dari file ini?',
                detail: 'Aksi ini akan menimpa semua data Anda saat ini dengan data dari file backup. Aplikasi akan dimulai ulang setelah proses selesai.'
            });
            if (confirmation.response === 1) {
                try {
                    // Database instance is managed in database.js, so we can't directly close it here.
                    // The app restart will handle reconnection.
                    fs.copyFileSync(backupPath, dbPath);
                    log.info(`Database restored from ${backupPath}. Relaunching app.`);
                    app.relaunch();
                    app.exit();
                    return { success: true };
                } catch (error) {
                    log.error('Restore failed:', error);
                    return { success: false, error: error.message };
                }
            }
        }
        return { success: false, error: 'Restore canceled' };
    });
}

module.exports = { registerAppHandlers };
