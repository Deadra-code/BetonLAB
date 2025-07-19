// Lokasi file: src/electron/database.js
// Deskripsi: Memperbaiki struktur JMD_TEMPLATE_JSON agar sesuai dengan format
// layout yang diharapkan oleh useReportBuilderStore.

const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');
const crypto = require('crypto');

const dbPath = path.join(app.getPath('userData'), 'betonlab_v4.db');
const LATEST_DB_VERSION = 19;
let db;

// Helper untuk hash password
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// ========================================================================
// === PERBAIKAN UTAMA DI SINI ===
// Struktur 'layout' diubah dari array-of-arrays menjadi array-of-objects
// untuk mencocokkan state shape dari useReportBuilderStore.
// Setiap halaman sekarang adalah objek { header, components, footer }.
// ========================================================================
const JMD_TEMPLATE_JSON = JSON.stringify({
  "layout": [
    // Halaman 1
    {
      "header": { "id": "header", "instanceId": "header-1718683201", "properties": {} },
      "components": [
        { "id": "custom-text", "instanceId": "custom-text-1718683202", "properties": { "content": "LAPORAN RENCANA CAMPURAN BETON\n(JOB MIX DESIGN)", "fontSize": 18, "isBold": true, "align": "center" } },
        { "id": "vertical-spacer", "instanceId": "vertical-spacer-1718683203", "properties": { "height": 20 } },
        { "id": "columns", "instanceId": "columns-1718683204", "properties": { "columnCount": 2 }, "children": [ [ { "id": "client-info-block", "instanceId": "client-info-block-1718683205", "properties": {} } ], [ { "id": "trial-info-block", "instanceId": "trial-info-block-1718683206", "properties": {} } ] ] },
        { "id": "vertical-spacer", "instanceId": "vertical-spacer-1718683207", "properties": { "height": 10 } },
        { "id": "custom-text", "instanceId": "custom-text-1718683208", "properties": { "content": "Ringkasan Hasil Utama:", "fontSize": 12, "isBold": true } },
        { "id": "columns", "instanceId": "columns-1718683209", "properties": { "columnCount": 2 }, "children": [ [ { "id": "dynamic-placeholder", "instanceId": "dynamic-placeholder-1718683210", "properties": { "label": "Faktor Air/Semen (FAS): ", "placeholder": "{{fas}}", "isBold": true } } ], [ { "id": "dynamic-placeholder", "instanceId": "dynamic-placeholder-1718683211", "properties": { "label": "Kadar Semen: ", "placeholder": "{{cementContent}}", "suffix": " kg/m³", "isBold": true } } ] ] },
        { "id": "signature-block", "instanceId": "signature-block-1718683212", "properties": { "columnCount": 2, "label1": "Disiapkan oleh,", "name1": "", "position1": "Teknisi Lab", "label2": "Diperiksa oleh,", "name2": "", "position2": "Penyelia" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683213", "properties": {} }
    },
    // Halaman 2
    {
      "header": { "id": "header", "instanceId": "header-1718683214", "properties": {} },
      "components": [
        { "id": "material-properties-table", "instanceId": "material-properties-table-1718683215", "properties": { "title": "1. Properti Material yang Digunakan" } },
        { "id": "jmd-table", "instanceId": "jmd-table-1718683216", "properties": { "title": "2. Proporsi Rencana Campuran per 1 m³" } },
        { "id": "combined-gradation-chart", "instanceId": "combined-gradation-chart-1718683217", "properties": { "title": "3. Grafik Gradasi Gabungan Agregat" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683218", "properties": {} }
    },
    // Halaman 3
    {
      "header": { "id": "header", "instanceId": "header-1718683219", "properties": {} },
      "components": [
        { "id": "strength-chart", "instanceId": "strength-chart-1718683220", "properties": { "title": "4. Grafik Perkembangan Kuat Tekan Beton" } },
        { "id": "strength-summary-table", "instanceId": "strength-summary-table-1718683221", "properties": { "title": "5. Ringkasan Hasil Uji Kuat Tekan Rata-rata" } },
        { "id": "raw-strength-table", "instanceId": "raw-strength-table-1718683222", "properties": { "title": "6. Data Mentah Hasil Uji Kuat Tekan" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683223", "properties": {} }
    },
    // Halaman 4
    {
      "header": { "id": "header", "instanceId": "header-1718683224", "properties": {} },
      "components": [
        { "id": "custom-text", "instanceId": "custom-text-1718683225", "properties": { "content": "7. Catatan & Kesimpulan\n\n- ...\n- ...\n- ...", "fontSize": 12, "isBold": true } },
        { "id": "vertical-spacer", "instanceId": "vertical-spacer-1718683226", "properties": { "height": 40 } },
        { "id": "signature-block", "instanceId": "signature-block-1718683227", "properties": { "columnCount": 2, "label1": "Menyetujui,", "name1": "", "position1": "Kepala Laboratorium", "label2": "", "name2": "", "position2": "" } },
      ],
      "footer": { "id": "footer", "instanceId": "footer-1718683228", "properties": {} }
    }
  ],
  "pageSettings": { "size": "a4", "orientation": "portrait" }
});


async function runMigrations(currentVersion) {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                // ... (Semua migrasi sebelumnya tetap sama) ...
                if (currentVersion < 1) {
                    log.info('Migration to v1: Creating initial tables...');
                    db.run(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, projectName TEXT NOT NULL, clientName TEXT, createdAt TEXT NOT NULL)`);
                    db.run(`CREATE TABLE IF NOT EXISTS materials (id INTEGER PRIMARY KEY AUTOINCREMENT, material_type TEXT NOT NULL, name TEXT NOT NULL UNIQUE, source TEXT, is_blend INTEGER DEFAULT 0, blend_components_json TEXT, created_at TEXT NOT NULL)`);
                    db.run(`CREATE TABLE IF NOT EXISTS project_trials (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, trial_name TEXT NOT NULL, design_input_json TEXT, design_result_json TEXT, created_at TEXT NOT NULL, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE)`);
                    db.run(`CREATE TABLE IF NOT EXISTS material_tests (id INTEGER PRIMARY KEY AUTOINCREMENT, material_id INTEGER NOT NULL, test_type TEXT NOT NULL, test_date TEXT NOT NULL, input_data_json TEXT, result_data_json TEXT, is_active_for_design INTEGER DEFAULT 0, FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE)`);
                    db.run(`CREATE TABLE IF NOT EXISTS concrete_tests (id INTEGER PRIMARY KEY AUTOINCREMENT, trial_id INTEGER NOT NULL, specimen_id TEXT NOT NULL, test_type TEXT NOT NULL, casting_date TEXT, testing_date TEXT, age_days INTEGER, input_data_json TEXT, result_data_json TEXT, FOREIGN KEY (trial_id) REFERENCES project_trials(id) ON DELETE CASCADE)`);
                    db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
                }
                if (currentVersion < 2) {
                    await new Promise((res, rej) => db.run(`ALTER TABLE project_trials ADD COLUMN notes TEXT`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                }
                if (currentVersion < 4) {
                    await new Promise((res, rej) => db.run(`ALTER TABLE material_tests ADD COLUMN image_path TEXT`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                }
                if (currentVersion < 5) {
                    const columns_v5 = [{ name: 'curing_method', type: 'TEXT' }, { name: 'specimen_shape', type: 'TEXT' }, { name: 'status', type: 'TEXT' }];
                    for (const col of columns_v5) {
                        await new Promise((res, rej) => db.run(`ALTER TABLE concrete_tests ADD COLUMN ${col.name} ${col.type}`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                    }
                }
                if (currentVersion < 6) {
                    await new Promise((res, rej) => db.run(`CREATE TABLE IF NOT EXISTS test_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, template_name TEXT NOT NULL, material_type TEXT NOT NULL, tests_json TEXT NOT NULL)`, (err) => err ? rej(err) : res()));
                }
                if (currentVersion < 7) {
                    await new Promise((res, rej) => db.run(`CREATE TABLE IF NOT EXISTS reference_documents (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, title TEXT NOT NULL, file_path TEXT NOT NULL)`, (err) => err ? rej(err) : res()));
                }
                if (currentVersion < 9) {
                    await new Promise((res, rej) => db.run(`ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'active'`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                    await new Promise((res, rej) => db.run(`ALTER TABLE materials ADD COLUMN status TEXT DEFAULT 'active'`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                }
                if (currentVersion < 10) {
                    await new Promise((res, rej) => db.run(`CREATE TABLE IF NOT EXISTS report_layouts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, layout_object_json TEXT NOT NULL)`, (err) => err ? rej(err) : res()));
                }
                if (currentVersion < 11) {
                    const columns_v11 = [
                        { name: 'clientAddress', type: 'TEXT' }, { name: 'clientContactPerson', type: 'TEXT' },
                        { name: 'clientContactNumber', type: 'TEXT' }, { name: 'requestNumber', type: 'TEXT' },
                        { name: 'requestDate', type: 'TEXT' }, { name: 'projectNotes', type: 'TEXT' }
                    ];
                    for (const col of columns_v11) {
                        await new Promise((res, rej) => db.run(`ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                    }
                }
                if (currentVersion < 12) {
                    const columns_v12 = [{ name: 'testingRequests', type: 'TEXT' }, { name: 'requestLetterPath', type: 'TEXT' }];
                    for (const col of columns_v12) {
                        await new Promise((res, rej) => db.run(`ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                    }
                }
                if (currentVersion < 13) {
                    await new Promise((res, rej) => db.run(`ALTER TABLE projects ADD COLUMN assignedTo TEXT`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                }
                if (currentVersion < 14) {
                    const columnsToAdd = [
                        { name: 'testedBy', type: 'TEXT' }, { name: 'checkedBy', type: 'TEXT' }, { name: 'testMethod', type: 'TEXT' }
                    ];
                    const tablesToUpdate = ['material_tests', 'concrete_tests'];
                    for (const table of tablesToUpdate) {
                        for (const col of columnsToAdd) {
                            await new Promise((res, rej) => {
                                db.run(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type}`, (err) => {
                                    if (err && !err.message.includes('duplicate column name')) return rej(err);
                                    res();
                                });
                            });
                        }
                    }
                }
                if (currentVersion < 15) {
                    log.info('Migration to v15: Adding LIMS foundation tables (users, audit_log)...');
                    await new Promise((res, rej) => db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, full_name TEXT, role TEXT NOT NULL CHECK(role IN ('admin', 'penyelia', 'teknisi')))`, (err) => err ? rej(err) : res()));
                    await new Promise((res, rej) => db.run(`CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, timestamp TEXT NOT NULL, action TEXT NOT NULL, details TEXT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL)`, (err) => err ? rej(err) : res()));
                    const tablesToUpdateWithUserId = ['projects', 'materials', 'project_trials', 'material_tests', 'concrete_tests'];
                    for (const table of tablesToUpdateWithUserId) {
                         await new Promise((res, rej) => db.run(`ALTER TABLE ${table} ADD COLUMN created_by_user_id INTEGER`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                         await new Promise((res, rej) => db.run(`ALTER TABLE ${table} ADD COLUMN updated_by_user_id INTEGER`, (err) => err && !err.message.includes('duplicate column') ? rej(err) : res()));
                    }
                    db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
                        if (err) return reject(err);
                        if (row.count === 0) {
                            log.info('No users found. Creating default admin user...');
                            const defaultPasswordHash = hashPassword('admin123');
                            db.run("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)", ['admin', defaultPasswordHash, 'Administrator', 'admin'], (err) => { if (err) reject(err); });
                        }
                    });
                }
                if (currentVersion < 16) {
                    log.info('Migration to v16: Adding Sample Lifecycle tables and columns...');
                    await new Promise((res, rej) => db.run(`
                        CREATE TABLE IF NOT EXISTS sample_receptions (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            project_id INTEGER NOT NULL,
                            reception_date TEXT NOT NULL,
                            received_by_user_id INTEGER,
                            submitted_by TEXT,
                            notes TEXT,
                            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                            FOREIGN KEY (received_by_user_id) REFERENCES users(id) ON DELETE SET NULL
                        )
                    `, (err) => err ? rej(err) : res()));
                    const columnsToAdd = [
                        { name: 'sample_reception_id', type: 'INTEGER' },
                        { name: 'lab_id', type: 'TEXT' },
                        { name: 'assigned_technician_id', type: 'INTEGER' },
                        { name: 'storage_location', type: 'TEXT' }
                    ];
                    for (const col of columnsToAdd) {
                        await new Promise((res, rej) => {
                            db.run(`ALTER TABLE concrete_tests ADD COLUMN ${col.name} ${col.type}`, (err) => {
                                if (err && !err.message.includes('duplicate column')) return rej(err);
                                res();
                            });
                        });
                    }
                }
                if (currentVersion < 17) {
                    log.info('Migration to v17: Creating equipment table...');
                    await new Promise((res, rej) => db.run(`
                        CREATE TABLE IF NOT EXISTS equipment (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            serial_number TEXT UNIQUE,
                            last_calibrated_date TEXT,
                            next_calibration_date TEXT NOT NULL,
                            status TEXT NOT NULL,
                            notes TEXT
                        )
                    `, (err) => err ? rej(err) : res()));
                }
                if (currentVersion < 18) {
                    log.info('Migration to v18: Creating specimen log table...');
                    await new Promise((res, rej) => db.run(`
                        CREATE TABLE IF NOT EXISTS specimen_log (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            concrete_test_id INTEGER NOT NULL,
                            timestamp TEXT NOT NULL,
                            user_id INTEGER,
                            action TEXT NOT NULL,
                            details TEXT,
                            FOREIGN KEY (concrete_test_id) REFERENCES concrete_tests(id) ON DELETE CASCADE,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                        )
                    `, (err) => err ? rej(err) : res()));
                }

                if (currentVersion < 19) {
                    log.info('Migration to v19: Seeding default JMD report template...');
                    await new Promise((res, rej) => {
                        const templateName = "Laporan JMD Beton (Bawaan)";
                        db.get("SELECT COUNT(*) as count FROM report_layouts WHERE name = ?", [templateName], (err, row) => {
                            if (err) return rej(err);
                            if (row.count === 0) {
                                db.run("INSERT INTO report_layouts (name, layout_object_json) VALUES (?, ?)", 
                                    [templateName, JMD_TEMPLATE_JSON], 
                                    (err) => {
                                        if (err) return rej(err);
                                        log.info(`Default template "${templateName}" seeded successfully.`);
                                        res();
                                    }
                                );
                            } else {
                                log.info(`Default template "${templateName}" already exists. Skipping.`);
                                res();
                            }
                        });
                    });
                }


                db.run(`PRAGMA user_version = ${LATEST_DB_VERSION}`, resolve);
            } catch (err) {
                reject(err);
            }
        });
    });
}

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                log.error('Error opening database', err.message);
                return reject(err);
            }
            log.info('Database connected at', dbPath);
            db.get('PRAGMA user_version', async (err, row) => {
                if (err) {
                    log.error('Failed to get DB version:', err);
                    return reject(err);
                }
                const currentVersion = row ? row.user_version : 0;
                log.info(`Current DB version: ${currentVersion}, Latest DB version: ${LATEST_DB_VERSION}`);
                if (currentVersion < LATEST_DB_VERSION) {
                    log.info('Database schema is outdated. Running migrations...');
                    try {
                        await runMigrations(currentVersion);
                        log.info('Migrations completed successfully.');
                    } catch (migrationError) {
                        log.error('Migration failed:', migrationError);
                        return reject(migrationError);
                    }
                }
                db.exec('PRAGMA foreign_keys = ON;', (err) => {
                    if (err) {
                        log.error("Could not enable foreign keys", err);
                    } else {
                        log.info("Foreign key support enabled.");
                    }
                    resolve(db);
                });
            });
        });
    });
}

function getDbInstance() {
    return db;
}

function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                log.error('Error closing database', err.message);
            } else {
                log.info('Database connection closed.');
            }
        });
    }
}

module.exports = {
    initializeDatabase,
    getDbInstance,
    closeDatabase
};
