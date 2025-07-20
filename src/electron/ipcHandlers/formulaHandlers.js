// src/electron/ipcHandlers/formulaHandlers.js
// Deskripsi: Memperbarui path impor untuk defaultFormulas agar konsisten.

const log = require('electron-log');
// PERBAIKAN: Mengimpor dari lokasi baru di /data dan mengakses properti .default
const defaultFormulas = require('../../data/defaultFormulas.js').default;

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

    // Memperbarui sebuah formula dan mencatat riwayatnya
    ipcMain.handle('formulas:update', async (event, { id, formula_value, userId }) => {
        return new Promise((resolve, reject) => {
            if (typeof id !== 'number' || id <= 0) {
                return reject(new Error('ID formula tidak valid.'));
            }
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                // 1. Ambil nilai lama
                db.get("SELECT formula_value FROM calculation_formulas WHERE id = ?", [id], (err, row) => {
                    if (err || !row) {
                        db.run("ROLLBACK");
                        return reject(new Error('Formula tidak ditemukan untuk dicatat riwayatnya.'));
                    }
                    const oldValue = row.formula_value;

                    // 2. Simpan nilai lama ke riwayat
                    db.run("INSERT INTO formula_history (formula_id, old_value, changed_at, changed_by_user_id) VALUES (?, ?, ?, ?)",
                        [id, oldValue, new Date().toISOString(), userId], (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(new Error('Gagal menyimpan riwayat formula.'));
                        }

                        // 3. Update nilai baru
                        db.run("UPDATE calculation_formulas SET formula_value = ? WHERE id = ?", [formula_value, id], function(err) {
                            if (err) {
                                db.run("ROLLBACK");
                                return reject(new Error('Gagal memperbarui formula.'));
                            }
                            db.run("COMMIT");
                            log.info(`Formula with ID ${id} was updated by user ${userId}.`);
                            resolve({ success: true });
                        });
                    });
                });
            });
        });
    });

    // Mengambil riwayat untuk satu formula
    ipcMain.handle('formulas:get-history', async (event, formulaId) => {
        return new Promise((resolve, reject) => {
            if (typeof formulaId !== 'number' || formulaId <= 0) {
                return reject(new Error('ID formula tidak valid.'));
            }
            const sql = `
                SELECT fh.id, fh.old_value, fh.changed_at, u.full_name as changed_by_user
                FROM formula_history fh
                LEFT JOIN users u ON fh.changed_by_user_id = u.id
                WHERE fh.formula_id = ?
                ORDER BY fh.changed_at DESC
            `;
            db.all(sql, [formulaId], (err, rows) => {
                if (err) {
                    log.error(`Database error getting history for formula ID ${formulaId}:`, err);
                    reject(new Error('Gagal mengambil riwayat formula.'));
                    return;
                }
                resolve(rows);
            });
        });
    });


    // Mengembalikan formula ke nilai default
    ipcMain.handle('formulas:reset-default', async (event, { formulaKey, userId }) => {
        return new Promise((resolve, reject) => {
            if (!formulaKey || typeof formulaKey !== 'string') {
                return reject(new Error('Kunci formula tidak valid.'));
            }
            const defaultFormula = defaultFormulas.find(f => f.formula_key === formulaKey);
            if (!defaultFormula) {
                return reject(new Error(`Formula default untuk kunci '${formulaKey}' tidak ditemukan.`));
            }

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // 1. Ambil nilai saat ini sebelum di-reset
                db.get("SELECT id, formula_value FROM calculation_formulas WHERE formula_key = ?", [formulaKey], (err, row) => {
                    if (err || !row) {
                        db.run("ROLLBACK");
                        return reject(new Error('Formula tidak ditemukan untuk di-reset.'));
                    }
                    const { id, formula_value: oldValue } = row;

                    // 2. Simpan nilai lama ke riwayat
                    db.run("INSERT INTO formula_history (formula_id, old_value, changed_at, changed_by_user_id) VALUES (?, ?, ?, ?)",
                        [id, oldValue, new Date().toISOString(), userId], (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(new Error('Gagal menyimpan riwayat sebelum reset.'));
                        }

                        // 3. Update ke nilai default
                        db.run("UPDATE calculation_formulas SET formula_value = ? WHERE formula_key = ?",
                            [defaultFormula.formula_value, formulaKey],
                            function(err) {
                                if (err) {
                                    db.run("ROLLBACK");
                                    return reject(new Error('Gagal mengembalikan formula ke default.'));
                                }
                                db.run("COMMIT");
                                log.info(`Formula with key ${formulaKey} was reset to default by user ${userId}.`);
                                resolve({ success: true });
                            }
                        );
                    });
                });
            });
        });
    });

    // Handler baru untuk mengambil satu formula default
    ipcMain.handle('formulas:get-default-formula', async (event, formulaKey) => {
        if (!formulaKey) {
            throw new Error('Kunci formula harus disediakan.');
        }
        const formula = defaultFormulas.find(f => f.formula_key === formulaKey);
        if (!formula) {
            throw new Error(`Formula default dengan kunci '${formulaKey}' tidak ditemukan.`);
        }
        return formula;
    });
}

module.exports = { registerFormulaHandlers };
