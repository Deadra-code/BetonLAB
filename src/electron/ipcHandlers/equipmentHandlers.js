// Lokasi file: src/electron/ipcHandlers/equipmentHandlers.js
// Deskripsi: Handler IPC baru untuk semua operasi terkait manajemen peralatan.

const log = require('electron-log');

function registerEquipmentHandlers(ipcMain, db) {
    const handleDbError = (err, reject, operation) => {
        if (err) {
            log.error(`Database error during ${operation}:`, err);
            reject(new Error(`Gagal pada operasi ${operation}.`));
            return true;
        }
        return false;
    };

    // Mendapatkan semua peralatan
    ipcMain.handle('equipment:get-all', async () => new Promise((resolve, reject) => {
        db.all("SELECT * FROM equipment ORDER BY next_calibration_date ASC", [], (err, rows) => {
            if (handleDbError(err, reject, 'get-all-equipment')) return;
            resolve(rows);
        });
    }));

    // Menambah peralatan baru
    ipcMain.handle('equipment:add', async (event, equipment) => new Promise((resolve, reject) => {
        const { name, serial_number, last_calibrated_date, next_calibration_date, status, notes } = equipment;
        if (!name || !next_calibration_date || !status) {
            return reject(new Error("Nama, tanggal kalibrasi berikutnya, dan status harus diisi."));
        }
        const stmt = db.prepare("INSERT INTO equipment (name, serial_number, last_calibrated_date, next_calibration_date, status, notes) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(name, serial_number, last_calibrated_date, next_calibration_date, status, notes, function(err) {
            if (handleDbError(err, reject, 'add-equipment')) return;
            log.info(`Equipment added: ${name} (ID: ${this.lastID})`);
            resolve({ id: this.lastID, ...equipment });
        });
        stmt.finalize();
    }));

    // Memperbarui peralatan
    ipcMain.handle('equipment:update', async (event, equipment) => new Promise((resolve, reject) => {
        const { id, name, serial_number, last_calibrated_date, next_calibration_date, status, notes } = equipment;
        if (!id || !name || !next_calibration_date || !status) {
            return reject(new Error("ID, Nama, tanggal kalibrasi berikutnya, dan status harus diisi."));
        }
        db.run("UPDATE equipment SET name = ?, serial_number = ?, last_calibrated_date = ?, next_calibration_date = ?, status = ?, notes = ? WHERE id = ?",
            [name, serial_number, last_calibrated_date, next_calibration_date, status, notes, id],
            function(err) {
                if (handleDbError(err, reject, 'update-equipment')) return;
                log.info(`Equipment updated: ${name} (ID: ${id})`);
                resolve({ success: true });
            }
        );
    }));

    // Menghapus peralatan
    ipcMain.handle('equipment:delete', async (event, id) => new Promise((resolve, reject) => {
        if (!id) return reject(new Error("ID peralatan tidak valid."));
        db.run("DELETE FROM equipment WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject, 'delete-equipment')) return;
            log.info(`Equipment deleted, ID: ${id}`);
            resolve({ success: true });
        });
    }));

    // Mendapatkan log untuk benda uji spesifik
    ipcMain.handle('specimen:get-log', async (event, concreteTestId) => new Promise((resolve, reject) => {
        if (!concreteTestId) return reject(new Error("ID Benda Uji tidak valid."));
        const sql = `
            SELECT sl.*, u.full_name as user_name 
            FROM specimen_log sl 
            LEFT JOIN users u ON sl.user_id = u.id
            WHERE sl.concrete_test_id = ? 
            ORDER BY sl.timestamp ASC
        `;
        db.all(sql, [concreteTestId], (err, rows) => {
            if (handleDbError(err, reject, 'get-specimen-log')) return;
            resolve(rows);
        });
    }));
}

module.exports = { registerEquipmentHandlers };
