// Lokasi file: src/electron/main.js
// Deskripsi: Versi fungsional penuh, mengaktifkan kembali database dan semua fitur.

const { app, dialog, BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log');
const { initializeDatabase, getDbInstance, closeDatabase } = require('./database');
const { createWindow } = require('./windowManager');
const { registerIpcHandlers } = require('./ipcHandlers');

// --- Pengaturan Logging ---
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/main.log');
log.transports.file.level = 'info';
Object.assign(console, log.functions);

// Penanganan error eksplisit untuk memastikan semua masalah saat startup tercatat
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    dialog.showErrorBox('Kesalahan Fatal', 'Aplikasi mengalami kesalahan yang tidak terduga. Silakan periksa file log untuk detailnya.');
    app.quit();
});

log.info('App starting...');

// --- Siklus Hidup Aplikasi ---
app.whenReady().then(async () => {
    try {
        await initializeDatabase();
        const db = getDbInstance();
        registerIpcHandlers(db); // Daftarkan semua handler IPC
        createWindow();
    } catch (error) {
        log.error('Fatal: Could not initialize the application.', error);
        dialog.showErrorBox('Application Error', 'Could not initialize the application. See logs for details.');
        app.quit();
    }
});

app.on('window-all-closed', () => {
    closeDatabase();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('will-quit', () => {
    log.info('App is quitting.');
});
