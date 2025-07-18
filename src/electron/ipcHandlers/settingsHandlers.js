// Lokasi file: src/electron/ipcHandlers/settingsHandlers.js
// Deskripsi: Penambahan validasi input yang ketat untuk memastikan integritas data pengaturan.

const log = require('electron-log');

const handleDbError = (err, reject, customMessages = {}) => {
    if (err) {
        log.error(`Database Error: ${err.message}`, { code: err.code });
        if (err.code && customMessages[err.code]) {
            reject(new Error(customMessages[err.code]));
        } else {
            reject(new Error(err.message));
        }
        return true;
    }
    return false;
};

// Helper sederhana untuk validasi JSON
const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

function registerSettingsHandlers(ipcMain, db) {
    ipcMain.handle('settings:get-all', async () => new Promise((resolve, reject) => {
        db.all("SELECT key, value FROM settings", [], (err, rows) => {
            if (handleDbError(err, reject)) return;
            const settings = rows.reduce((acc, row) => ({...acc, [row.key]: row.value }), {});
            resolve(settings);
        });
    }));

    ipcMain.handle('settings:set', async (event, { key, value }) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        const cleanKey = key?.trim();
        if (!cleanKey) return reject(new Error("Kunci pengaturan tidak boleh kosong."));
        // Memastikan value adalah string, karena itu yang disimpan di DB
        const valueToStore = String(value);

        db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [cleanKey, valueToStore], (err) => {
            if (handleDbError(err, reject)) return;
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:get-test-templates', async () => new Promise((resolve, reject) => {
        db.all("SELECT * FROM test_templates ORDER BY template_name", [], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:add-test-template', async (event, template) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        if (!template || typeof template !== 'object') return reject(new Error("Data template tidak valid."));
        const cleanName = template.template_name?.trim();
        if (!cleanName) return reject(new Error("Nama template tidak boleh kosong."));
        if (!['fine_aggregate', 'coarse_aggregate'].includes(template.material_type)) return reject(new Error("Tipe material template tidak valid."));
        if (!isJsonString(template.tests_json)) return reject(new Error("Format daftar tes tidak valid (bukan JSON)."));

        const stmt = db.prepare("INSERT INTO test_templates (template_name, material_type, tests_json) VALUES (?, ?, ?)");
        stmt.run(cleanName, template.material_type, template.tests_json, function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Test template added successfully. ID: ${this.lastID}`);
            resolve({ id: this.lastID, ...template });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:delete-test-template', async (event, id) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID template tidak valid.'));
        db.run("DELETE FROM test_templates WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Test template with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:get-due-specimens', async () => {
        const sql = `
            SELECT 
                ct.id, ct.specimen_id, ct.casting_date, ct.age_days, 
                pt.id AS trialId, pt.trial_name, 
                p.id AS projectId, p.projectName
            FROM concrete_tests ct
            JOIN project_trials pt ON ct.trial_id = pt.id
            JOIN projects p ON pt.project_id = p.id
            WHERE ct.status = 'Dalam Perawatan' OR ct.status = 'Siap Uji'
        `;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (handleDbError(err, reject)) return;
                resolve(rows);
            });
        });
    });
}

module.exports = { registerSettingsHandlers };
