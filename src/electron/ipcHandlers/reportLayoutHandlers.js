// Lokasi file: src/electron/ipcHandlers/reportLayoutHandlers.js
// Deskripsi: Handler untuk CRUD layout laporan kustom (Report Builder v2.0).

const log = require('electron-log');

function registerReportLayoutHandlers(ipcMain, db) {
    // Mengambil semua layout laporan yang tersimpan
    ipcMain.handle('db:get-report-layouts', async () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM report_layouts ORDER BY name", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    });

    // Menambah layout laporan baru
    ipcMain.handle('db:add-report-layout', async (event, { name, layout_object_json }) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT INTO report_layouts (name, layout_object_json) VALUES (?, ?)");
            stmt.run(name, layout_object_json, function(err) {
                if (err) {
                    log.error('Add report layout error:', err);
                    reject(err);
                } else {
                    log.info(`Report layout added: ${name}`);
                    resolve({ id: this.lastID, name, layout_object_json });
                }
            });
            stmt.finalize();
        });
    });

    // Memperbarui layout laporan yang sudah ada
    ipcMain.handle('db:update-report-layout', async (event, { id, name, layout_object_json }) => {
        return new Promise((resolve, reject) => {
            db.run("UPDATE report_layouts SET name = ?, layout_object_json = ? WHERE id = ?", [name, layout_object_json, id], function(err) {
                if (err) {
                    log.error('Update report layout error:', err);
                    reject(err);
                } else {
                    log.info(`Report layout updated: ${name}`);
                    resolve({ success: true });
                }
            });
        });
    });

    // Menghapus layout laporan
    ipcMain.handle('db:delete-report-layout', async (event, id) => {
        return new Promise((resolve, reject) => {
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
