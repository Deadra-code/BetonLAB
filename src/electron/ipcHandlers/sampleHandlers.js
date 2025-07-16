// Lokasi file: src/electron/ipcHandlers/sampleHandlers.js
// Deskripsi: File baru untuk menangani semua logika terkait siklus hidup sampel.

const log = require('electron-log');

function registerSampleHandlers(ipcMain, db) {
    // Handler untuk membuat batch penerimaan sampel baru dan spesimennya
    ipcMain.handle('samples:reception-create', async (event, { receptionData, specimens }) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                // 1. Masukkan data ke tabel sample_receptions
                const stmtReception = db.prepare(
                    "INSERT INTO sample_receptions (project_id, reception_date, received_by_user_id, submitted_by, notes) VALUES (?, ?, ?, ?, ?)"
                );
                stmtReception.run(
                    receptionData.project_id,
                    receptionData.reception_date,
                    receptionData.received_by_user_id,
                    receptionData.submitted_by,
                    receptionData.notes,
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

                        // 2. Masukkan setiap spesimen ke tabel concrete_tests
                        const specimenPromises = specimens.map(spec => {
                            return new Promise((res, rej) => {
                                const testDate = new Date(spec.casting_date);
                                testDate.setDate(testDate.getDate() + parseInt(spec.age_days));
                                
                                stmtSpecimen.run(
                                    spec.trial_id, spec.specimen_id, spec.lab_id, 'compressive_strength',
                                    spec.casting_date, testDate.toISOString().split('T')[0], spec.age_days,
                                    spec.specimen_shape, 'Perendaman Air', 'Dalam Perawatan', receptionId,
                                    spec.assigned_technician_id || null, spec.storage_location || null, receptionData.received_by_user_id,
                                    (err) => { if (err) rej(err); else res(); }
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

    // Handler untuk mendapatkan semua tugas pengujian untuk teknisi tertentu
    ipcMain.handle('samples:get-my-tasks', async (event, technicianId) => {
        return new Promise((resolve, reject) => {
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
