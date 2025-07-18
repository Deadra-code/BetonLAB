// Lokasi file: src/electron/ipcHandlers/materialHandlers.js
// Deskripsi: Penambahan validasi input yang ketat di semua handler untuk meningkatkan keamanan dan stabilitas.

const log = require('electron-log');

const handleDbError = (err, reject, context = {}, customMessages = {}) => {
    if (err) {
        log.error(`Database Error in ${context.operation || 'unknown operation'}`, { ...context, errorMessage: err.message, errorCode: err.code });
        
        const defaultErrorMessages = {
            'SQLITE_CONSTRAINT_UNIQUE': `Gagal: Nama "${context.name}" sudah ada. Silakan gunakan nama lain.`,
            'SQLITE_CONSTRAINT': 'Terjadi konflik data di database.'
        };

        const message = customMessages[err.code] || defaultErrorMessages[err.code] || err.message;
        reject(new Error(message));
        
        return true;
    }
    return false;
};

function registerMaterialHandlers(ipcMain, db) {
    ipcMain.handle('db:get-materials', async (event, showArchived = false) => new Promise((resolve, reject) => {
        const query = `SELECT * FROM materials ${showArchived ? '' : "WHERE status = 'active'"} ORDER BY material_type, name`;
        db.all(query, [], (err, rows) => {
            if (handleDbError(err, reject, { operation: 'getMaterials' })) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:set-material-status', async (event, { id, status }) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID material tidak valid.'));
        if (!['active', 'archived'].includes(status)) return reject(new Error('Status tidak valid.'));
        
        db.run("UPDATE materials SET status = ? WHERE id = ?", [status, id], function(err) {
            if (handleDbError(err, reject, { operation: 'setMaterialStatus', materialId: id })) return;
            log.info(`Material ID ${id} status set to ${status}`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:add-material', async (event, material) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI & SANITASI BACKEND
        if (!material || typeof material !== 'object') return reject(new Error("Data material tidak valid."));
        const cleanName = material.name?.trim();
        if (!cleanName) return reject(new Error("Nama material tidak boleh kosong."));
        const validTypes = ['cement', 'fine_aggregate', 'coarse_aggregate'];
        if (!validTypes.includes(material.material_type)) return reject(new Error("Tipe material tidak valid."));

        const stmt = db.prepare("INSERT INTO materials (material_type, name, source, is_blend, blend_components_json, created_at) VALUES (?, ?, ?, ?, ?, ?)");
        const cleanSource = (material.source || '').trim();

        stmt.run(material.material_type, cleanName, cleanSource, material.is_blend || 0, material.blend_components_json || '[]', new Date().toISOString(), function(err) {
            if (handleDbError(err, reject, { operation: 'addMaterial', name: cleanName })) return;
            log.info(`Material added successfully. ID: ${this.lastID}, Name: ${cleanName}`);
            resolve({ id: this.lastID, ...material, name: cleanName, source: cleanSource });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:update-material', async (event, { id, name, source }) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI & SANITASI BACKEND
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID material tidak valid.'));
        const cleanName = name?.trim();
        if (!cleanName) return reject(new Error("Nama material tidak boleh kosong."));
        const cleanSource = (source || '').trim();
        
        db.run("UPDATE materials SET name = ?, source = ? WHERE id = ?", [cleanName, cleanSource, id], function(err) {
            if (handleDbError(err, reject, { operation: 'updateMaterial', materialId: id, name: cleanName })) return;
            log.info(`Material with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-material', async (event, id) => {
        // TAHAP 1: VALIDASI BACKEND
        if (typeof id !== 'number' || id <= 0) {
            return Promise.reject(new Error('ID material tidak valid.'));
        }
        return new Promise((resolve, reject) => {
            const checkUsageQuery = `
                SELECT COUNT(*) as count 
                FROM project_trials 
                WHERE json_extract(design_input_json, '$.selectedCementId') = ?
                   OR json_extract(design_input_json, '$.selectedFineId') = ?
                   OR json_extract(design_input_json, '$.selectedCoarseId') = ?
            `;

            db.get(checkUsageQuery, [id, id, id], (err, row) => {
                if (err) return handleDbError(err, reject, { operation: 'checkMaterialUsage', materialId: id });
                if (row.count > 0) return reject(new Error(`Material ini digunakan dalam ${row.count} trial mix dan tidak dapat dihapus.`));

                db.run("DELETE FROM materials WHERE id = ?", [id], function(err) {
                    if (handleDbError(err, reject, { operation: 'deleteMaterial', materialId: id })) return;
                    log.info(`Material with ID: ${id} deleted successfully.`);
                    resolve({ success: true });
                });
            });
        });
    });

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
            ORDER BY m.material_type, m.name
        `;
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (handleDbError(err, reject, { operation: 'getMaterialsWithActiveTests' })) return;
                resolve(rows);
            });
        });
    });

    ipcMain.handle('db:get-tests-for-material', async (event, materialId) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        if (typeof materialId !== 'number' || materialId <= 0) return reject(new Error('ID material tidak valid.'));
        db.all("SELECT * FROM material_tests WHERE material_id = ? ORDER BY test_date DESC", [materialId], (err, rows) => {
            if (handleDbError(err, reject, { operation: 'getTestsForMaterial', materialId })) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:add-material-test', async (event, test) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI & SANITASI BACKEND
        if (!test || typeof test !== 'object') return reject(new Error("Data tes tidak valid."));
        if (typeof test.material_id !== 'number' || test.material_id <= 0) return reject(new Error("ID material untuk tes tidak valid."));
        if (!test.test_type?.trim()) return reject(new Error("Tipe tes tidak boleh kosong."));

        const stmt = db.prepare(`INSERT INTO material_tests (
            material_id, test_type, test_date, input_data_json, result_data_json, image_path,
            testedBy, checkedBy, testMethod
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run(
            test.material_id, test.test_type, test.test_date, 
            test.input_data_json, test.result_data_json, test.image_path || null,
            test.testedBy?.trim() || '', test.checkedBy?.trim() || '', test.testMethod?.trim() || '',
            function(err) {
                if (handleDbError(err, reject, { operation: 'addMaterialTest', materialId: test.material_id })) return;
                log.info(`Material test added for material ID: ${test.material_id}. Test ID: ${this.lastID}`);
                resolve({ id: this.lastID, ...test });
            }
        );
        stmt.finalize();
    }));

    ipcMain.handle('db:set-active-material-test', async (event, { materialId, testType, testId }) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        if (typeof materialId !== 'number' || materialId <= 0) return reject(new Error('ID material tidak valid.'));
        if (typeof testId !== 'number' || testId <= 0) return reject(new Error('ID tes tidak valid.'));
        if (!testType || typeof testType !== 'string') return reject(new Error('Tipe tes tidak valid.'));

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => { if (handleDbError(err, reject, { operation: 'setActiveMaterialTestBegin' })) return; });
            db.run("UPDATE material_tests SET is_active_for_design = 0 WHERE material_id = ? AND test_type = ?", [materialId, testType], (err) => {
                if (err) {
                    log.error(`Transaction Error on step 1 (set inactive): ${err.message}`);
                    db.run("ROLLBACK");
                    return reject(err);
                }
                db.run("UPDATE material_tests SET is_active_for_design = 1 WHERE id = ?", [testId], function(err) {
                    if (err) {
                        log.error(`Transaction Error on step 2 (set active): ${err.message}`);
                        db.run("ROLLBACK");
                        return reject(err);
                    }
                    db.run("COMMIT", (err) => {
                        if (handleDbError(err, reject, { operation: 'setActiveMaterialTestCommit' })) return;
                        log.info(`Active test set for material ID: ${materialId}, Test Type: ${testType}, Test ID: ${testId}`);
                        resolve({ success: true });
                    });
                });
            });
        });
    }));

    ipcMain.handle('db:delete-material-test', async (event, id) => new Promise((resolve, reject) => {
        // TAHAP 1: VALIDASI BACKEND
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID tes tidak valid.'));
        db.run("DELETE FROM material_tests WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject, { operation: 'deleteMaterialTest', testId: id })) return;
            log.info(`Material test with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));
}

module.exports = { registerMaterialHandlers };
