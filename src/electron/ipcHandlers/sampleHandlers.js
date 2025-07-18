// Lokasi file: src/electron/ipcHandlers/sampleHandlers.js
// Deskripsi: Penambahan logika untuk secara otomatis membuat log "Diterima" saat benda uji baru dibuat.

const log = require('electron-log');

function registerSampleHandlers(ipcMain, db) {
    // Helper untuk membuat entri log
    const createSpecimenLog = (concreteTestId, userId, action, details = '') => {
        const timestamp = new Date().toISOString();
        db.run("INSERT INTO specimen_log (concrete_test_id, user_id, timestamp, action, details) VALUES (?, ?, ?, ?, ?)",
            [concreteTestId, userId, timestamp, action, details],
            (err) => {
                if (err) log.error(`Failed to create specimen log for action "${action}" on test ID ${concreteTestId}:`, err);
            }
        );
    };

    ipcMain.handle('samples:reception-create', async (event, { receptionData, specimens }) => {
        return new Promise((resolve, reject) => {
            // Validasi backend (dari Tahap 1) tetap di sini...
            if (!receptionData || typeof receptionData.project_id !== 'number' || receptionData.project_id <= 0) {
                return reject(new Error("Data penerimaan tidak valid atau ID proyek tidak ada."));
            }
            if (!Array.isArray(specimens) || specimens.length === 0) {
                return reject(new Error("Daftar benda uji tidak boleh kosong."));
            }
            for (const spec of specimens) {
                if (!spec.trial_id || !spec.specimen_id?.trim() || !spec.casting_date || !spec.age_days) {
                    return reject(new Error(`Data benda uji tidak lengkap: ${JSON.stringify(spec)}`));
                }
            }

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const stmtReception = db.prepare(
                    "INSERT INTO sample_receptions (project_id, reception_date, received_by_user_id, submitted_by, notes) VALUES (?, ?, ?, ?, ?)"
                );
                stmtReception.run(
                    receptionData.project_id,
                    receptionData.reception_date,
                    receptionData.received_by_user_id,
                    receptionData.submitted_by?.trim() || null,
                    receptionData.notes?.trim() || null,
                    function (err) {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(new Error(`Gagal menyimpan data penerimaan: ${err.message}`));
                        }
                        
                        const receptionId = this.lastID;
                        const stmtSpecimen = db.prepare(`
                            INSERT INTO concrete_tests (
                                trial_id, specimen_id, lab_id, test_type, casting_date, testing_date, age_days,
                                specimen_shape, curing_method, status, sample_reception_id,
                                assigned_technician_id, storage_location, created_by_user_id
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                        );

                        const specimenPromises = specimens.map(spec => {
                            return new Promise((res, rej) => {
                                const testDate = new Date(spec.casting_date);
                                testDate.setDate(testDate.getDate() + parseInt(spec.age_days));
                                
                                stmtSpecimen.run(
                                    spec.trial_id, spec.specimen_id.trim(), spec.lab_id, 'compressive_strength',
                                    spec.casting_date, testDate.toISOString().split('T')[0], spec.age_days,
                                    spec.specimen_shape, 'Perendaman Air', 'Dalam Perawatan', receptionId,
                                    spec.assigned_technician_id || null, spec.storage_location?.trim() || null, receptionData.received_by_user_id,
                                    function (err) { 
                                        if (err) return rej(err);
                                        // TAHAP 2: Buat log "Diterima"
                                        const details = `Diserahkan oleh: ${receptionData.submitted_by || 'N/A'}. Lokasi simpan: ${spec.storage_location || 'N/A'}`;
                                        createSpecimenLog(this.lastID, receptionData.received_by_user_id, 'Diterima', details);
                                        res();
                                    }
                                );
                            });
                        });

                        Promise.all(specimenPromises)
                            .then(() => {
                                stmtSpecimen.finalize();
                                db.run("COMMIT", (err) => {
                                    if (err) return reject(new Error(`Gagal commit: ${err.message}`));
                                    log.info(`Sample reception batch ${receptionId} with ${specimens.length} specimens created.`);
                                    resolve({ success: true, receptionId });
                                });
                            })
                            .catch(err => {
                                db.run("ROLLBACK");
                                reject(new Error(`Gagal menyimpan salah satu spesimen: ${err.message}`));
                            });
                    }
                );
                stmtReception.finalize();
            });
        });
    });

    ipcMain.handle('samples:get-my-tasks', async (event, technicianId) => {
        return new Promise((resolve, reject) => {
            if (typeof technicianId !== 'number' || technicianId <= 0) {
                return reject(new Error("ID teknisi tidak valid."));
            }
            const query = `
                SELECT 
                    ct.*, 
                    p.projectName,
                    pt.trial_name
                FROM concrete_tests ct
                JOIN project_trials pt ON ct.trial_id = pt.id
                JOIN projects p ON pt.project_id = p.id
                WHERE ct.assigned_technician_id = ? AND (ct.status = 'Dalam Perawatan' OR ct.status = 'Siap Uji')
                ORDER BY ct.testing_date ASC
            `;
            db.all(query, [technicianId], (err, rows) => {
                if (err) return reject(new Error('Gagal mengambil daftar tugas.'));
                resolve(rows);
            });
        });
    });
}

module.exports = { registerSampleHandlers };
