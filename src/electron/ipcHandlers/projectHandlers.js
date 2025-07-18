// Lokasi file: src/electron/ipcHandlers/projectHandlers.js
// Deskripsi: Penambahan logika untuk membuat log "Telah Diuji" saat hasil tes diperbarui.

const log = require('electron-log');
const fs = require('fs');
const path = require('path');

// Helper untuk menangani error spesifik dari database
const handleDbError = (err, reject, context = {}, customMessages = {}) => {
    if (err) {
        log.error(`Database Error in ${context.operation || 'unknown operation'}`, { ...context, errorMessage: err.message, errorCode: err.code });
        if (err.code && customMessages[err.code]) {
            reject(new Error(customMessages[err.code]));
        } else {
            reject(new Error(err.message));
        }
        return true;
    }
    return false;
};

// TAHAP 2: Helper untuk membuat entri log
const createSpecimenLog = (db, concreteTestId, userId, action, details = '') => {
    const timestamp = new Date().toISOString();
    db.run("INSERT INTO specimen_log (concrete_test_id, user_id, timestamp, action, details) VALUES (?, ?, ?, ?, ?)",
        [concreteTestId, userId, timestamp, action, details],
        (err) => {
            if (err) log.error(`Failed to create specimen log for action "${action}" on test ID ${concreteTestId}:`, err);
        }
    );
};

function registerProjectHandlers(ipcMain, db) {
    // ... (semua handler proyek dan trial lainnya tetap sama seperti di Tahap 1) ...
    // --- Project Handlers ---
    ipcMain.handle('db:get-projects', async (event, showArchived = false) => new Promise((resolve, reject) => {
        const query = `SELECT * FROM projects ${showArchived ? '' : "WHERE status = 'active'"} ORDER BY id DESC`;
        db.all(query, [], (err, rows) => {
            if (handleDbError(err, reject, { operation: 'getProjects' })) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:set-project-status', async (event, { id, status }) => new Promise((resolve, reject) => {
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID proyek tidak valid.'));
        if (!['active', 'archived'].includes(status)) return reject(new Error('Status tidak valid.'));
        
        db.run("UPDATE projects SET status = ? WHERE id = ?", [status, id], function(err) {
            if (handleDbError(err, reject, { operation: 'setProjectStatus', projectId: id })) return;
            log.info(`Project ID ${id} status set to ${status}`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:add-project', async (event, project) => new Promise((resolve, reject) => {
        if (!project || typeof project !== 'object') return reject(new Error("Data proyek tidak valid."));
        const cleanProjectName = project.projectName?.trim();
        if (!cleanProjectName) return reject(new Error("Nama proyek tidak boleh kosong."));

        const stmt = db.prepare(`INSERT INTO projects (
            projectName, clientName, createdAt, clientAddress, clientContactPerson, 
            clientContactNumber, requestNumber, requestDate, projectNotes,
            testingRequests, requestLetterPath, assignedTo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run(
            cleanProjectName,
            project.clientName?.trim() || null,
            new Date().toISOString(),
            project.clientAddress?.trim() || null,
            project.clientContactPerson?.trim() || null,
            project.clientContactNumber?.trim() || null,
            project.requestNumber?.trim() || null,
            project.requestDate || null,
            project.projectNotes?.trim() || null,
            project.testingRequests?.trim() || null,
            project.requestLetterPath || null,
            project.assignedTo?.trim() || null,
            function(err) {
                if (handleDbError(err, reject, { operation: 'addProject', projectName: cleanProjectName }, { 'SQLITE_CONSTRAINT': 'Nama proyek tidak boleh sama.' })) return;
                log.info(`Project added successfully. ID: ${this.lastID}`);
                resolve({ id: this.lastID, ...project });
            }
        );
        stmt.finalize();
    }));

    ipcMain.handle('db:update-project', async (event, project) => new Promise((resolve, reject) => {
        if (!project || typeof project !== 'object') return reject(new Error("Data proyek tidak valid."));
        const id = project.id;
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID proyek tidak valid.'));
        const cleanProjectName = project.projectName?.trim();
        if (!cleanProjectName) return reject(new Error("Nama proyek tidak boleh kosong."));

        const sql = `UPDATE projects SET 
            projectName = ?, clientName = ?, clientAddress = ?, clientContactPerson = ?,
            clientContactNumber = ?, requestNumber = ?, requestDate = ?, projectNotes = ?,
            testingRequests = ?, requestLetterPath = ?, assignedTo = ?
            WHERE id = ?`;

        db.run(sql, [
            cleanProjectName,
            project.clientName?.trim() || null,
            project.clientAddress?.trim() || null, 
            project.clientContactPerson?.trim() || null,
            project.clientContactNumber?.trim() || null,
            project.requestNumber?.trim() || null,
            project.requestDate || null, 
            project.projectNotes?.trim() || null,
            project.testingRequests?.trim() || null,
            project.requestLetterPath || null,
            project.assignedTo?.trim() || null,
            id
        ], function(err) {
            if (handleDbError(err, reject, { operation: 'updateProject', projectId: id })) return;
            if (this.changes === 0) return reject(new Error(`Proyek dengan ID ${id} tidak ditemukan.`));
            log.info(`Project with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-project', async (event, id) => new Promise((resolve, reject) => {
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID proyek tidak valid.'));

        db.get("SELECT requestLetterPath FROM projects WHERE id = ?", [id], (err, row) => {
            if (err) { log.error(`Failed to get requestLetterPath for project ${id} before deletion:`, err); }
            if (row && row.requestLetterPath && fs.existsSync(row.requestLetterPath)) {
                try {
                    fs.unlinkSync(row.requestLetterPath);
                    log.info(`Orphaned file deleted: ${row.requestLetterPath}`);
                } catch (unlinkErr) {
                    log.error(`Failed to delete orphaned file ${row.requestLetterPath}:`, unlinkErr);
                }
            }
            db.run("DELETE FROM projects WHERE id = ?", [id], function(err) {
                if (handleDbError(err, reject, { operation: 'deleteProject', projectId: id })) return;
                log.info(`Project with ID: ${id} deleted successfully.`);
                resolve({ success: true });
            });
        });
    }));

    ipcMain.handle('db:duplicate-project', async (event, projectId) => {
        if (typeof projectId !== 'number' || projectId <= 0) {
            return Promise.reject(new Error('ID proyek untuk duplikasi tidak valid.'));
        }
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION", (err) => { if (err) return reject(new Error(`Gagal memulai transaksi: ${err.message}`)); });
                db.get("SELECT * FROM projects WHERE id = ?", [projectId], (err, project) => {
                    if (err || !project) {
                        db.run("ROLLBACK");
                        return reject(new Error(`Gagal menemukan proyek asli: ${err?.message || 'Proyek tidak ada.'}`));
                    }
                    let newRequestLetterPath = null;
                    if (project.requestLetterPath && fs.existsSync(project.requestLetterPath)) {
                        try {
                            const letterDir = path.dirname(project.requestLetterPath);
                            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                            const newFileName = uniqueSuffix + '-' + path.basename(project.requestLetterPath).split('-').slice(2).join('-');
                            newRequestLetterPath = path.join(letterDir, newFileName);
                            fs.copyFileSync(project.requestLetterPath, newRequestLetterPath);
                            log.info(`File duplicated from ${project.requestLetterPath} to ${newRequestLetterPath}`);
                        } catch (copyErr) {
                            log.error('Failed to copy request letter during duplication:', copyErr);
                            newRequestLetterPath = null;
                        }
                    }
                    const newProjectName = `${project.projectName} (Salinan)`;
                    const newCreatedAt = new Date().toISOString();
                    db.run(`INSERT INTO projects (
                        projectName, clientName, createdAt, status, clientAddress, clientContactPerson,
                        clientContactNumber, requestNumber, requestDate, projectNotes,
                        testingRequests, requestLetterPath, assignedTo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            newProjectName, project.clientName, newCreatedAt, project.status,
                            project.clientAddress, project.clientContactPerson, project.clientContactNumber,
                            project.requestNumber, project.requestDate, project.projectNotes,
                            project.testingRequests, newRequestLetterPath, project.assignedTo
                        ],
                        function(err) {
                            if (err) { db.run("ROLLBACK"); return reject(new Error(`Gagal membuat duplikat proyek: ${err.message}`)); }
                            const newProjectId = this.lastID;
                            db.all("SELECT * FROM project_trials WHERE project_id = ?", [projectId], (err, trials) => {
                                if (err) { db.run("ROLLBACK"); return reject(new Error(`Gagal mengambil trial asli: ${err.message}`)); }
                                const trialPromises = trials.map(trial => new Promise((res, rej) => {
                                    db.run("INSERT INTO project_trials (project_id, trial_name, design_input_json, design_result_json, created_at, notes) VALUES (?, ?, ?, ?, ?, ?)",
                                        [newProjectId, trial.trial_name, trial.design_input_json, trial.design_result_json, newCreatedAt, trial.notes],
                                        (err) => err ? rej(err) : res()
                                    );
                                }));
                                Promise.all(trialPromises)
                                    .then(() => {
                                        db.run("COMMIT", (err) => {
                                            if (err) return reject(new Error(`Gagal commit transaksi: ${err.message}`));
                                            log.info(`Project ${projectId} duplicated successfully into new project ${newProjectId}`);
                                            resolve({ success: true, newProjectId });
                                        });
                                    })
                                    .catch(err => {
                                        db.run("ROLLBACK");
                                        reject(new Error(`Gagal menduplikasi salah satu trial: ${err.message}`));
                                    });
                            });
                        }
                    );
                });
            });
        });
    });

    ipcMain.handle('db:get-project-status-counts', async () => new Promise((resolve, reject) => {
        const query = `
            SELECT
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
            FROM projects
        `;
        db.get(query, [], (err, row) => {
            if (handleDbError(err, reject, { operation: 'getProjectStatusCounts' })) return;
            resolve(row || { active: 0, archived: 0 });
        });
    }));

    // --- Trial Handlers ---
    ipcMain.handle('db:get-trials-for-project', async (event, projectId) => new Promise((resolve, reject) => {
        if (typeof projectId !== 'number' || projectId <= 0) return reject(new Error('ID proyek tidak valid.'));
        
        db.all("SELECT * FROM project_trials WHERE project_id = ? ORDER BY id DESC", [projectId], (err, rows) => {
            if (handleDbError(err, reject, { operation: 'getTrials', projectId })) return;
            resolve(rows);
        });
    }));
    
    ipcMain.handle('db:get-all-trials', async () => new Promise((resolve, reject) => {
        const query = `SELECT pt.id, pt.project_id, pt.trial_name, pt.created_at, p.projectName FROM project_trials pt JOIN projects p ON pt.project_id = p.id ORDER BY pt.created_at DESC`;
        db.all(query, [], (err, rows) => {
            if (handleDbError(err, reject, { operation: 'getAllTrials' })) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:add-trial', async (event, trial) => new Promise((resolve, reject) => {
        if (!trial || typeof trial !== 'object') return reject(new Error("Data trial tidak valid."));
        if (typeof trial.project_id !== 'number' || trial.project_id <= 0) return reject(new Error("ID proyek untuk trial tidak valid."));
        const cleanTrialName = trial.trial_name?.trim();
        if (!cleanTrialName) return reject(new Error("Nama trial tidak boleh kosong."));

        const stmt = db.prepare("INSERT INTO project_trials (project_id, trial_name, design_input_json, design_result_json, created_at, notes) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(trial.project_id, cleanTrialName, trial.design_input_json, trial.design_result_json, new Date().toISOString(), trial.notes?.trim() || '', function(err) {
            if (handleDbError(err, reject, { operation: 'addTrial', trialName: cleanTrialName })) return;
            log.info(`Trial added successfully to project ${trial.project_id}. Trial ID: ${this.lastID}`);
            resolve({ id: this.lastID, ...trial });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:update-trial', async (event, trial) => new Promise((resolve, reject) => {
        if (!trial || typeof trial !== 'object') return reject(new Error("Data trial tidak valid."));
        const { id, trial_name, design_input_json, design_result_json, notes } = trial;
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID trial tidak valid.'));
        const cleanTrialName = trial_name?.trim();
        if (!cleanTrialName) return reject(new Error("Nama trial tidak boleh kosong."));

        db.run("UPDATE project_trials SET trial_name = ?, design_input_json = ?, design_result_json = ?, notes = ? WHERE id = ?", [cleanTrialName, design_input_json, design_result_json, notes?.trim() || '', id], function(err) {
            if (handleDbError(err, reject, { operation: 'updateTrial', trialId: id })) return;
            log.info(`Trial with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-trial', async (event, id) => new Promise((resolve, reject) => {
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID trial tidak valid.'));
        db.run("DELETE FROM project_trials WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject, { operation: 'deleteTrial', trialId: id })) return;
            log.info(`Trial with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    // --- Concrete Test Handlers ---
    ipcMain.handle('db:add-concrete-test', async (event, test) => new Promise((resolve, reject) => {
        if (!test || typeof test !== 'object') return reject(new Error("Data tes tidak valid."));
        if (typeof test.trial_id !== 'number' || test.trial_id <= 0) return reject(new Error("ID trial untuk tes tidak valid."));
        if (!test.specimen_id?.trim()) return reject(new Error("ID spesimen tidak boleh kosong."));

        const stmt = db.prepare(`INSERT INTO concrete_tests (
            trial_id, specimen_id, test_type, casting_date, testing_date, 
            age_days, input_data_json, result_data_json, specimen_shape, 
            curing_method, status, testedBy, checkedBy, testMethod
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(
            test.trial_id, test.specimen_id.trim(), test.test_type, test.casting_date, 
            test.testing_date, test.age_days, test.input_data_json, 
            test.result_data_json, test.specimen_shape, test.curing_method, 
            test.status, test.testedBy?.trim() || '', test.checkedBy?.trim() || '', test.testMethod?.trim() || '',
            function(err) {
                if (handleDbError(err, reject, { operation: 'addConcreteTest', trialId: test.trial_id })) return;
                log.info(`Concrete test added for trial ID: ${test.trial_id}. Specimen ID: ${test.specimen_id}`);
                resolve({ id: this.lastID, ...test });
            }
        );
        stmt.finalize();
    }));

    ipcMain.handle('db:get-tests-for-trial', async (event, trialId) => new Promise((resolve, reject) => {
        if (typeof trialId !== 'number' || trialId <= 0) return reject(new Error('ID trial tidak valid.'));
        db.all("SELECT * FROM concrete_tests WHERE trial_id = ? ORDER BY id DESC", [trialId], (err, rows) => {
            if (handleDbError(err, reject, { operation: 'getTestsForTrial', trialId })) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:update-concrete-test', async (event, test) => new Promise((resolve, reject) => {
        if (!test || typeof test !== 'object') return reject(new Error("Data tes tidak valid."));
        const { id, specimen_id, testing_date, age_days, input_data_json, result_data_json, 
                specimen_shape, curing_method, status, casting_date, 
                testedBy, checkedBy, testMethod, updated_by_user_id } = test;
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID tes tidak valid.'));
        if (!specimen_id?.trim()) return reject(new Error("ID spesimen tidak boleh kosong."));

        const sql = `UPDATE concrete_tests SET 
            specimen_id = ?, testing_date = ?, age_days = ?, input_data_json = ?, 
            result_data_json = ?, specimen_shape = ?, curing_method = ?, status = ?, 
            casting_date = ?, testedBy = ?, checkedBy = ?, testMethod = ? 
            WHERE id = ?`;
        db.run(sql, [
            specimen_id.trim(), testing_date, age_days, input_data_json, result_data_json, 
            specimen_shape, curing_method, status, casting_date, 
            testedBy?.trim() || '', checkedBy?.trim() || '', testMethod?.trim() || '', id
        ], (err) => {
            if (handleDbError(err, reject, { operation: 'updateConcreteTest', testId: id })) return;
            
            // TAHAP 2: Buat log "Telah Diuji" jika status berubah menjadi 'Telah Diuji'
            if (status === 'Telah Diuji') {
                const result = JSON.parse(result_data_json || '{}');
                const details = `Hasil: ${result.strength_MPa?.toFixed(2) || 'N/A'} MPa. Diperiksa oleh: ${checkedBy || 'N/A'}`;
                createSpecimenLog(db, id, updated_by_user_id, 'Telah Diuji', details);
            }

            log.info(`Concrete test with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-concrete-test', async (event, id) => new Promise((resolve, reject) => {
        if (typeof id !== 'number' || id <= 0) return reject(new Error('ID tes tidak valid.'));
        db.run("DELETE FROM concrete_tests WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject, { operation: 'deleteConcreteTest', testId: id })) return;
            log.info(`Concrete test with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    // --- Global Search & Reporting ---
    ipcMain.handle('db:global-search', async (event, query) => {
        const cleanQuery = typeof query === 'string' ? query.trim() : '';
        if (cleanQuery.length < 2) return { projects: [], trials: [], materials: [] };
        const searchQuery = `%${cleanQuery}%`;
        
        try {
            const projectsPromise = new Promise((resolve, reject) => { db.all("SELECT * FROM projects WHERE projectName LIKE ? LIMIT 5", [searchQuery], (err, rows) => err ? reject(err) : resolve(rows)); });
            const trialsPromise = new Promise((resolve, reject) => { const sql = `SELECT pt.*, p.projectName FROM project_trials pt JOIN projects p ON pt.project_id = p.id WHERE pt.trial_name LIKE ? LIMIT 5`; db.all(sql, [searchQuery], (err, rows) => err ? reject(err) : resolve(rows)); });
            const materialsPromise = new Promise((resolve, reject) => { db.all("SELECT * FROM materials WHERE name LIKE ? LIMIT 5", [searchQuery], (err, rows) => err ? reject(err) : resolve(rows)); });
            const [projects, trials, materials] = await Promise.all([projectsPromise, trialsPromise, materialsPromise]);
            return { projects, trials, materials };
        } catch (error) {
            log.error('Global search failed:', error);
            return { projects: [], trials: [], materials: [] };
        }
    });

    ipcMain.handle('report:get-full-data', async (event, projectId) => {
        if (typeof projectId !== 'number' || projectId <= 0) return Promise.reject(new Error('ID proyek tidak valid.'));

        log.info(`Fetching full report data for project ID: ${projectId}`);
        const getProjectDetails = new Promise((resolve, reject) => { db.get("SELECT * FROM projects WHERE id = ?", [projectId], (err, row) => err ? reject(err) : resolve(row)); });
        const getProjectTrials = new Promise((resolve, reject) => { db.all("SELECT * FROM project_trials WHERE project_id = ?", [projectId], (err, rows) => err ? reject(err) : resolve(rows)); });
        try {
            const [project, trials] = await Promise.all([getProjectDetails, getProjectTrials]);
            if (!project) { throw new Error("Proyek tidak ditemukan"); }
            for (let i = 0; i < trials.length; i++) {
                const trial = trials[i];
                const tests = await new Promise((resolve, reject) => { db.all("SELECT * FROM concrete_tests WHERE trial_id = ?", [trial.id], (err, rows) => err ? reject(err) : resolve(rows)); });
                trials[i].design_input = JSON.parse(trial.design_input_json || '{}');
                trials[i].design_result = JSON.parse(trial.design_result_json || '{}');
                trials[i].tests = tests.map(t => ({ ...t, input_data: JSON.parse(t.input_data_json || '{}'), result_data: JSON.parse(t.result_data_json || '{}'), }));
            }
            return { ...project, trials };
        } catch (error) {
            log.error(`Failed to get report data for project ID ${projectId}:`, error);
            throw error;
        }
    });
}

module.exports = { registerProjectHandlers };
