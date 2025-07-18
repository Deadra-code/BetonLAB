// Lokasi file: src/electron/ipcHandlers/index.js
// Deskripsi: Mendaftarkan `equipmentHandlers` yang baru.

const { ipcMain } = require('electron');
const { registerAppHandlers } = require('./appHandlers');
const { registerFileHandlers } = require('./fileHandlers');
const { registerMaterialHandlers } = require('./materialHandlers');
const { registerProjectHandlers } = require('./projectHandlers');
const { registerReferenceHandlers } = require('./referenceHandlers');
const { registerSettingsHandlers } = require('./settingsHandlers');
const { registerReportLayoutHandlers } = require('./reportLayoutHandlers');
const { registerUserHandlers } = require('./userHandlers');
const { registerSampleHandlers } = require('./sampleHandlers');
const { registerEquipmentHandlers } = require('./equipmentHandlers'); // TAHAP 2: Impor handler baru

function registerIpcHandlers(db) {
    // Register semua handler dari modul-modul terpisah
    registerAppHandlers(ipcMain, db);
    registerFileHandlers(ipcMain, db);
    registerMaterialHandlers(ipcMain, db);
    registerProjectHandlers(ipcMain, db);
    registerReferenceHandlers(ipcMain, db);
    registerSettingsHandlers(ipcMain, db);
    registerReportLayoutHandlers(ipcMain, db);
    registerUserHandlers(ipcMain, db);
    registerSampleHandlers(ipcMain, db);
    registerEquipmentHandlers(ipcMain, db); // TAHAP 2: Daftarkan handler baru
}

module.exports = { registerIpcHandlers };
