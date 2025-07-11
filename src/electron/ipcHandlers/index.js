// Lokasi file: src/electron/ipcHandlers/index.js
// Deskripsi: Titik pusat untuk mendaftarkan semua handler IPC.
// PERUBAHAN: Menghapus registrasi untuk `reportTemplateHandlers` (sistem lama).

const { ipcMain } = require('electron');
const { registerAppHandlers } = require('./appHandlers');
const { registerFileHandlers } = require('./fileHandlers');
const { registerMaterialHandlers } = require('./materialHandlers');
const { registerProjectHandlers } = require('./projectHandlers');
const { registerReferenceHandlers } = require('./referenceHandlers');
const { registerSettingsHandlers } = require('./settingsHandlers');
const { registerReportLayoutHandlers } = require('./reportLayoutHandlers');

function registerIpcHandlers(db) {
    // Register semua handler dari modul-modul terpisah
    registerAppHandlers(ipcMain, db);
    registerFileHandlers(ipcMain, db);
    registerMaterialHandlers(ipcMain, db);
    registerProjectHandlers(ipcMain, db);
    registerReferenceHandlers(ipcMain, db);
    registerSettingsHandlers(ipcMain, db);
    registerReportLayoutHandlers(ipcMain, db);
}

module.exports = { registerIpcHandlers };
