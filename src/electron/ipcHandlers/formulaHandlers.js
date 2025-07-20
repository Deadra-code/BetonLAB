// src/electron/ipcHandlers/formulaHandlers.js
// Deskripsi: Handler IPC untuk semua operasi terkait manajemen formula.

const log = require('electron-log');

function registerFormulaHandlers(ipcMain, db) {
    // Mengambil semua formula
    ipcMain.handle('formulas:get-all', async () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM calculation_formulas", [], (err, rows) => {
                if (err) {
                    log.error('Database error during get-all-formulas:', err);
                    reject(new Error('Gagal mengambil data formula.'));
                    return;
                }
                resolve(rows);
            });
        });
    });

    // Memperbarui sebuah formula
    ipcMain.handle('formulas:update', async (event, { id, formula_value }) => {
        return new Promise((resolve, reject) => {
            if (typeof id !== 'number' || id <= 0) {
                return reject(new Error('ID formula tidak valid.'));
            }
            db.run("UPDATE calculation_formulas SET formula_value = ? WHERE id = ?", [formula_value, id], function(err) {
                if (err) {
                    log.error(`Database error during update-formula for ID ${id}:`, err);
                    reject(new Error('Gagal memperbarui formula.'));
                    return;
                }
                log.info(`Formula with ID ${id} was updated.`);
                resolve({ success: true });
            });
        });
    });
}

module.exports = { registerFormulaHandlers };
