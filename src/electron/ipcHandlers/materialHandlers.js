// Lokasi file: src/electron/ipcHandlers/materialHandlers.js
// Deskripsi: Handler untuk CRUD material dan tes material.

const log = require('electron-log');

// Helper untuk menangani error spesifik dari database
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

function registerMaterialHandlers(ipcMain, db) {
    // Mengambil semua material, dengan opsi untuk menampilkan yang diarsipkan
    ipcMain.handle('db:get-materials', async (event, showArchived = false) => new Promise((resolve, reject) => {
        const query = `SELECT * FROM materials ${showArchived ? '' : "WHERE status = 'active'"} ORDER BY material_type, name`;
        db.all(query, [], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    // Mengatur status material (aktif atau diarsipkan)
    ipcMain.handle('db:set-material-status', async (event, { id, status }) => new Promise((resolve, reject) => {
        if (!['active', 'archived'].includes(status)) {
            return reject(new Error('Invalid status value'));
        }
        db.run("UPDATE materials SET status = ? WHERE id = ?", [status, id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Material ID ${id} status set to ${status}`);
            resolve({ success: true });
        });
    }));

    // Menambah material baru
    ipcMain.handle('db:add-material', async (event, material) => new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO materials (material_type, name, source, is_blend, blend_components_json, created_at) VALUES (?, ?, ?, ?, ?, ?)");
        const cleanName = material.name.trim();
        const cleanSource = (material.source || '').trim();

        if (!cleanName) {
            return reject(new Error("Nama material tidak boleh kosong."));
        }

        stmt.run(material.material_type, cleanName, cleanSource, material.is_blend || 0, material.blend_components_json || '[]', new Date().toISOString(), function(err) {
            if (handleDbError(err, reject, { 'SQLITE_CONSTRAINT': 'Gagal: Nama material sudah ada dalam database.' })) return;
            log.info(`Material added successfully. ID: ${this.lastID}, Name: ${cleanName}`);
            resolve({ id: this.lastID, ...material, name: cleanName, source: cleanSource });
        });
        stmt.finalize();
    }));

    // Memperbarui material yang ada
    ipcMain.handle('db:update-material', async (event, { id, name, source }) => new Promise((resolve, reject) => {
        const cleanName = name.trim();
        const cleanSource = (source || '').trim();

        if (!cleanName) {
            return reject(new Error("Nama material tidak boleh kosong."));
        }
        
        db.run("UPDATE materials SET name = ?, source = ? WHERE id = ?", [cleanName, cleanSource, id], function(err) {
            if (handleDbError(err, reject, { 'SQLITE_CONSTRAINT': 'Gagal: Nama material sudah ada dalam database.' })) return;
            log.info(`Material with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    // Menghapus material
    ipcMain.handle('db:delete-material', async (event, id) => new Promise((resolve, reject) => {
        db.run("DELETE FROM materials WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Material with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    // Mengambil material beserta tes aktifnya untuk digunakan dalam perhitungan
    ipcMain.handle('db:get-materials-with-active-tests', async () => {
        const query = `
            SELECT 
                m.id, m.name, m.material_type, m.source, m.is_blend, m.blend_components_json, m.status,
                (
                    SELECT GROUP_CONCAT(test_type || ':::' || result_data_json || ':::' || test_date, '|||') 
                    FROM material_tests 
                    WHERE material_id = m.id AND is_active_for_design = 1
                ) as active_tests 
            FROM materials m 
            WHERE m.status = 'active'
            ORDER BY m.material_type, m.name
        `;
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (handleDbError(err, reject)) return;
                resolve(rows);
            });
        });
    });

    // Mengambil semua tes untuk satu material spesifik
    ipcMain.handle('db:get-tests-for-material', async (event, materialId) => new Promise((resolve, reject) => {
        db.all("SELECT * FROM material_tests WHERE material_id = ? ORDER BY test_date DESC", [materialId], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    // Menambah data tes material baru
    ipcMain.handle('db:add-material-test', async (event, test) => new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO material_tests (material_id, test_type, test_date, input_data_json, result_data_json, image_path) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(test.material_id, test.test_type, test.test_date, test.input_data_json, test.result_data_json, test.image_path || null, function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Material test added for material ID: ${test.material_id}. Test ID: ${this.lastID}`);
            resolve({ id: this.lastID, ...test });
        });
        stmt.finalize();
    }));

    // Mengatur satu tes sebagai "aktif" untuk tipe tes tertentu pada sebuah material
    ipcMain.handle('db:set-active-material-test', async (event, { materialId, testType, testId }) => new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => { if (handleDbError(err, reject)) return; });
            // Set semua tes dengan tipe yang sama menjadi tidak aktif
            db.run("UPDATE material_tests SET is_active_for_design = 0 WHERE material_id = ? AND test_type = ?", [materialId, testType], (err) => {
                if (err) {
                    log.error(`Transaction Error on step 1 (set inactive): ${err.message}`);
                    db.run("ROLLBACK");
                    return reject(err);
                }
                // Set tes yang dipilih menjadi aktif
                db.run("UPDATE material_tests SET is_active_for_design = 1 WHERE id = ?", [testId], function(err) {
                    if (err) {
                        log.error(`Transaction Error on step 2 (set active): ${err.message}`);
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                    db.run("COMMIT", (err) => {
                        if (handleDbError(err, reject)) return;
                        log.info(`Active test set for material ID: ${materialId}, Test Type: ${testType}, Test ID: ${testId}`);
                        resolve({ success: true });
                    });
                });
            });
        });
    }));

    // Menghapus data tes material
    ipcMain.handle('db:delete-material-test', async (event, id) => new Promise((resolve, reject) => {
        db.run("DELETE FROM material_tests WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Material test with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));
}

module.exports = { registerMaterialHandlers };
