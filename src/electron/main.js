// Lokasi file: src/electron/main.js
// Deskripsi: Perbaikan path untuk mode development dan production.

const { app, dialog, BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log');
const { initializeDatabase, getDbInstance, closeDatabase } = require('./database');
const { registerIpcHandlers } = require('./ipcHandlers');
const isDev = require('electron-is-dev');

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
        
        // --- PERBAIKAN KUNCI DI SINI ---
        // Menentukan path preload yang benar untuk dev dan prod
        const preloadScriptPath = isDev 
            ? path.join(__dirname, '../../public/preload.js') 
            : path.join(__dirname, '../preload.js');

        const mainWindow = new BrowserWindow({
            width: 1600,
            height: 1000,
            webPreferences: {
                preload: preloadScriptPath,
                nodeIntegration: false,
                contextIsolation: true,
            },
            icon: path.join(__dirname, '../../public/favicon.ico'),
            show: false
        });

        // Menentukan URL yang akan dimuat
        const startUrl = isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../../index.html')}`; // Path yang benar untuk build

        mainWindow.loadURL(startUrl);

        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
        });

        if (isDev) {
            mainWindow.webContents.openDevTools({ mode: 'detach' });
        }

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
        // Jika diperlukan, panggil kembali fungsi createWindow di sini
    }
});

app.on('will-quit', () => {
    log.info('App is quitting.');
});
