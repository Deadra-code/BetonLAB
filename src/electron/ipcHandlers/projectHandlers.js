// Lokasi file: src/electron/ipcHandlers/projectHandlers.js
// PERUBAHAN: Menambahkan sanitasi input (trim) untuk nama proyek dan klien.

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

function registerProjectHandlers(ipcMain, db) {
    ipcMain.handle('db:get-projects', async (event, showArchived = false) => new Promise((resolve, reject) => {
        const query = `SELECT * FROM projects ${showArchived ? '' : "WHERE status = 'active'"} ORDER BY id DESC`;
        db.all(query, [], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:set-project-status', async (event, { id, status }) => new Promise((resolve, reject) => {
        if (!['active', 'archived'].includes(status)) {
            return reject(new Error('Invalid status value'));
        }
        db.run("UPDATE projects SET status = ? WHERE id = ?", [status, id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Project ID ${id} status set to ${status}`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:add-project', async (event, project) => new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO projects (projectName, clientName, createdAt) VALUES (?, ?, ?)");
        // Sanitasi input
        const cleanProjectName = project.projectName.trim();
        const cleanClientName = project.clientName.trim();
        
        if (!cleanProjectName) {
            return reject(new Error("Nama proyek tidak boleh kosong."));
        }

        stmt.run(cleanProjectName, cleanClientName, new Date().toISOString(), function(err) {
            if (handleDbError(err, reject, { 'SQLITE_CONSTRAINT': 'Nama proyek tidak boleh sama.' })) return;
            log.info(`Project added successfully. ID: ${this.lastID}`);
            resolve({ id: this.lastID, ...project });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:update-project', async (event, { id, projectName, clientName }) => new Promise((resolve, reject) => {
        // Sanitasi input
        const cleanProjectName = projectName.trim();
        const cleanClientName = clientName.trim();

        if (!cleanProjectName) {
            return reject(new Error("Nama proyek tidak boleh kosong."));
        }

        db.run("UPDATE projects SET projectName = ?, clientName = ? WHERE id = ?", [cleanProjectName, cleanClientName, id], function(err) {
            if (handleDbError(err, reject)) return;
            if (this.changes === 0) return reject(new Error(`Proyek dengan ID ${id} tidak ditemukan.`));
            log.info(`Project with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-project', async (event, id) => new Promise((resolve, reject) => {
        db.run("DELETE FROM projects WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Project with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    // ... (sisa handler tidak berubah)

    ipcMain.handle('db:get-trials-for-project', async (event, projectId) => new Promise((resolve, reject) => {
        db.all("SELECT * FROM project_trials WHERE project_id = ? ORDER BY id DESC", [projectId], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:add-trial', async (event, trial) => new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO project_trials (project_id, trial_name, design_input_json, design_result_json, created_at, notes) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(trial.project_id, trial.trial_name, trial.design_input_json, trial.design_result_json, new Date().toISOString(), trial.notes || '', function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Trial added successfully to project ${trial.project_id}. Trial ID: ${this.lastID}`);
            resolve({ id: this.lastID, ...trial });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:update-trial', async (event, trial) => new Promise((resolve, reject) => {
        const { id, trial_name, design_input_json, design_result_json, notes } = trial;
        db.run("UPDATE project_trials SET trial_name = ?, design_input_json = ?, design_result_json = ?, notes = ? WHERE id = ?", [trial_name, design_input_json, design_result_json, notes || '', id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Trial with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-trial', async (event, id) => new Promise((resolve, reject) => {
        db.run("DELETE FROM project_trials WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Trial with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:add-concrete-test', async (event, test) => new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO concrete_tests (trial_id, specimen_id, test_type, casting_date, testing_date, age_days, input_data_json, result_data_json, specimen_shape, curing_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        stmt.run(test.trial_id, test.specimen_id, test.test_type, test.casting_date, test.testing_date, test.age_days, test.input_data_json, test.result_data_json, test.specimen_shape, test.curing_method, test.status, function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Concrete test added for trial ID: ${test.trial_id}. Specimen ID: ${test.specimen_id}`);
            resolve({ id: this.lastID, ...test });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:get-tests-for-trial', async (event, trialId) => new Promise((resolve, reject) => {
        db.all("SELECT * FROM concrete_tests WHERE trial_id = ? ORDER BY id DESC", [trialId], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:update-concrete-test', async (event, test) => new Promise((resolve, reject) => {
        const { id, specimen_id, testing_date, age_days, input_data_json, result_data_json, specimen_shape, curing_method, status, casting_date } = test;
        const sql = `UPDATE concrete_tests SET specimen_id = ?, testing_date = ?, age_days = ?, input_data_json = ?, result_data_json = ?, specimen_shape = ?, curing_method = ?, status = ?, casting_date = ? WHERE id = ?`;
        db.run(sql, [specimen_id, testing_date, age_days, input_data_json, result_data_json, specimen_shape, curing_method, status, casting_date, id], (err) => {
            if (handleDbError(err, reject)) return;
            log.info(`Concrete test with ID: ${id} updated successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:delete-concrete-test', async (event, id) => new Promise((resolve, reject) => {
        db.run("DELETE FROM concrete_tests WHERE id = ?", [id], function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Concrete test with ID: ${id} deleted successfully.`);
            resolve({ success: true });
        });
    }));

    ipcMain.handle('db:global-search', async (event, query) => {
        const searchQuery = `%${query}%`;
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
