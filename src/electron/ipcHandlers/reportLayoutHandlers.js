// Lokasi file: src/electron/ipcHandlers/reportLayoutHandlers.js
// Deskripsi: Penambahan validasi input yang ketat untuk memastikan integritas data template laporan.

const log = require('electron-log');

// Helper sederhana untuk validasi JSON
const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

function registerReportLayoutHandlers(ipcMain, db) {
    ipcMain.handle('db:get-report-layouts', async () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM report_layouts ORDER BY name", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    });

    ipcMain.handle('db:add-report-layout', async (event, { name, layout_object_json }) => {
        return new Promise((resolve, reject) => {
            // TAHAP 1: VALIDASI BACKEND
            const cleanName = name?.trim();
            if (!cleanName) return reject(new Error("Nama template tidak boleh kosong."));
            if (!isJsonString(layout_object_json)) return reject(new Error("Format layout tidak valid (bukan JSON)."));

            const stmt = db.prepare("INSERT INTO report_layouts (name, layout_object_json) VALUES (?, ?)");
            stmt.run(cleanName, layout_object_json, function(err) {
                if (err) {
                    log.error('Add report layout error:', err);
                    reject(err);
                } else {
                    log.info(`Report layout added: ${cleanName}`);
                    resolve({ id: this.lastID, name: cleanName, layout_object_json });
                }
            });
            stmt.finalize();
        });
    });

    ipcMain.handle('db:update-report-layout', async (event, { id, name, layout_object_json }) => {
        return new Promise((resolve, reject) => {
            // TAHAP 1: VALIDASI BACKEND
            if (typeof id !== 'number' || id <= 0) return reject(new Error('ID template tidak valid.'));
            const cleanName = name?.trim();
            if (!cleanName) return reject(new Error("Nama template tidak boleh kosong."));
            if (!isJsonString(layout_object_json)) return reject(new Error("Format layout tidak valid (bukan JSON)."));

            db.run("UPDATE report_layouts SET name = ?, layout_object_json = ? WHERE id = ?", [cleanName, layout_object_json, id], function(err) {
                if (err) {
                    log.error('Update report layout error:', err);
                    reject(err);
                } else {
                    log.info(`Report layout updated: ${cleanName}`);
                    resolve({ success: true });
                }
            });
        });
    });

    ipcMain.handle('db:delete-report-layout', async (event, id) => {
        return new Promise((resolve, reject) => {
            // TAHAP 1: VALIDASI BACKEND
            if (typeof id !== 'number' || id <= 0) return reject(new Error('ID template tidak valid.'));

            db.run("DELETE FROM report_layouts WHERE id = ?", [id], function(err) {
                if (err) {
                    log.error('Delete report layout error:', err);
                    reject(err);
                } else {
                    log.info(`Report layout deleted, ID: ${id}`);
                    resolve({ success: true });
                }
            });
        });
    });
}

module.exports = { registerReportLayoutHandlers };
