// Lokasi file: src/electron/database.js
// Deskripsi: Memperbarui path impor untuk defaultFormulas agar konsisten dengan frontend.

const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');
const crypto = require('crypto');

const dbPath = path.join(app.getPath('userData'), 'betonlab_v4.db');
const LATEST_DB_VERSION = 21;
let db;

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// PERBAIKAN: Mengimpor dari lokasi baru di /data dan mengakses properti .default
const defaultFormulas = require('../data/defaultFormulas.js').default;
const JMD_TEMPLATE_JSON = require('./jmdTemplate.js');


async function runMigrations(currentVersion) {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
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

                if (currentVersion < 20) {
                    log.info('Migration to v20: Creating and seeding calculation_formulas table...');
                    await new Promise((res, rej) => db.run(`
                        CREATE TABLE IF NOT EXISTS calculation_formulas (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            formula_key TEXT NOT NULL UNIQUE,
                            formula_name TEXT NOT NULL,
                            formula_type TEXT NOT NULL,
                            formula_value TEXT NOT NULL,
                            variables TEXT,
                            notes TEXT,
                            is_editable INTEGER DEFAULT 1
                        )
                    `, (err) => err ? rej(err) : res()));

                    const stmt = db.prepare("INSERT INTO calculation_formulas (formula_key, formula_name, formula_type, formula_value, variables, notes, is_editable) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    for (const formula of defaultFormulas) {
                        await new Promise((res, rej) => {
                            stmt.run(
                                formula.formula_key,
                                formula.formula_name,
                                formula.formula_type,
                                formula.formula_value,
                                formula.variables,
                                formula.notes,
                                formula.is_editable,
                                (err) => err ? rej(err) : res()
                            );
                        });
                    }
                    stmt.finalize();
                    log.info('Finished seeding calculation_formulas table.');
                }
                
                if (currentVersion < 21) {
                    log.info('Migration to v21: Creating formula_history table...');
                    await new Promise((res, rej) => db.run(`
                        CREATE TABLE IF NOT EXISTS formula_history (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            formula_id INTEGER NOT NULL,
                            old_value TEXT NOT NULL,
                            changed_at TEXT NOT NULL,
                            changed_by_user_id INTEGER,
                            FOREIGN KEY (formula_id) REFERENCES calculation_formulas(id) ON DELETE CASCADE,
                            FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
                        )
                    `, (err) => err ? rej(err) : res()));
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
