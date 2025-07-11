// Lokasi file: src/electron/database.js
// Deskripsi: Mengelola koneksi, migrasi, dan instance database SQLite.
// PERUBAHAN: Menghapus migrasi untuk tabel `report_templates` (sistem lama).

const { app } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log');

const dbPath = path.join(app.getPath('userData'), 'betonlab_v4.db');
// Versi database tetap 10 karena sistem `report_layouts` sudah ada.
const LATEST_DB_VERSION = 10;
let db;

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
                    log.info('Migration to v1: Initial tables created.');
                }
                if (currentVersion < 2) {
                    await new Promise((res, rej) => {
                        db.run(`ALTER TABLE project_trials ADD COLUMN notes TEXT`, (err) => {
                            if (err && !err.message.includes('duplicate column name')) { log.error('Migration to v2 failed:', err); return rej(err); }
                            log.info('Migration to v2: Added "notes" column to project_trials.');
                            res();
                        });
                    });
                }
                if (currentVersion < 3) {
                    log.info('Migration to v3: No schema changes, version bump.');
                }
                if (currentVersion < 4) {
                     await new Promise((res, rej) => {
                        db.run(`ALTER TABLE material_tests ADD COLUMN image_path TEXT`, (err) => {
                            if (err && !err.message.includes('duplicate column name')) { log.error('Migration to v4 failed:', err); return rej(err); }
                            log.info('Migration to v4: Added "image_path" column to material_tests.');
                            res();
                        });
                    });
                }
                if (currentVersion < 5) {
                    const columns = [
                        { name: 'curing_method', type: 'TEXT' },
                        { name: 'specimen_shape', type: 'TEXT' },
                        { name: 'status', type: 'TEXT' }
                    ];
                    for (const col of columns) {
                        await new Promise((res, rej) => {
                            db.run(`ALTER TABLE concrete_tests ADD COLUMN ${col.name} ${col.type}`, (err) => {
                                if (err && !err.message.includes('duplicate column name')) {
                                    log.error(`Migration to v5 (adding ${col.name}) failed:`, err);
                                    return rej(err);
                                }
                                log.info(`Migration to v5: Added "${col.name}" column to concrete_tests.`);
                                res();
                            });
                        });
                    }
                }
                if (currentVersion < 6) {
                    await new Promise((res, rej) => {
                        db.run(`CREATE TABLE IF NOT EXISTS test_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, template_name TEXT NOT NULL, material_type TEXT NOT NULL, tests_json TEXT NOT NULL)`, (err) => {
                            if (err) {
                                log.error('Migration to v6 failed:', err);
                                return rej(err);
                            }
                            log.info('Migration to v6: Created "test_templates" table.');
                            res();
                        });
                    });
                }
                if (currentVersion < 7) {
                    await new Promise((res, rej) => {
                        db.run(`CREATE TABLE IF NOT EXISTS reference_documents (id INTEGER PRIMARY KEY AUTOINCREMENT, document_number TEXT, title TEXT NOT NULL, file_path TEXT NOT NULL)`, (err) => {
                            if (err) {
                                log.error('Migration to v7 failed:', err);
                                return rej(err);
                            }
                            log.info('Migration to v7: Created "reference_documents" table.');
                            res();
                        });
                    });
                }
                if (currentVersion < 8) {
                    // Migrasi v8 untuk tabel report_templates (sistem lama) telah dihapus.
                    log.info('Migration to v8: Skipped legacy report_templates table.');
                }
                if (currentVersion < 9) {
                    log.info('Migration to v9: Adding status columns for archiving...');
                    await new Promise((res, rej) => {
                        db.run(`ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'active'`, (err) => {
                            if (err && !err.message.includes('duplicate column name')) { log.error('Migration to v9 (projects) failed:', err); return rej(err); }
                            res();
                        });
                    });
                    await new Promise((res, rej) => {
                        db.run(`ALTER TABLE materials ADD COLUMN status TEXT DEFAULT 'active'`, (err) => {
                            if (err && !err.message.includes('duplicate column name')) { log.error('Migration to v9 (materials) failed:', err); return rej(err); }
                            res();
                        });
                    });
                    log.info('Migration to v9: Status columns added.');
                }
                if (currentVersion < 10) {
                    log.info('Migration to v10: Creating report_layouts table for Report Builder v2.0...');
                    await new Promise((res, rej) => {
                        db.run(`CREATE TABLE IF NOT EXISTS report_layouts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, layout_object_json TEXT NOT NULL)`, (err) => {
                            if (err) { log.error('Migration to v10 failed:', err); return rej(err); }
                            log.info('Migration to v10: Created "report_layouts" table.');
                            res();
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
