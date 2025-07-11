// Lokasi file: src/electron/ipcHandlers/referenceHandlers.js
// Deskripsi: Handler untuk pustaka referensi.

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
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

function registerReferenceHandlers(ipcMain, db) {
    ipcMain.handle('file:save-reference-pdf', async (event, filePath) => {
        const userDataPath = app.getPath('userData');
        const pdfDir = path.join(userDataPath, 'sni_library');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newPath = path.join(pdfDir, uniqueSuffix + '-' + path.basename(filePath));
        fs.copyFileSync(filePath, newPath);
        return newPath;
    });

    ipcMain.handle('db:get-reference-documents', async () => new Promise((resolve, reject) => {
        db.all("SELECT * FROM reference_documents ORDER BY document_number", [], (err, rows) => {
            if (handleDbError(err, reject)) return;
            resolve(rows);
        });
    }));

    ipcMain.handle('db:add-reference-document', async (event, doc) => new Promise((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO reference_documents (document_number, title, file_path) VALUES (?, ?, ?)");
        stmt.run(doc.document_number, doc.title, doc.file_path, function(err) {
            if (handleDbError(err, reject)) return;
            log.info(`Reference document added successfully. ID: ${this.lastID}`);
            resolve({ id: this.lastID, ...doc });
        });
        stmt.finalize();
    }));

    ipcMain.handle('db:delete-reference-document', async (event, id) => new Promise((resolve, reject) => {
        db.get("SELECT file_path FROM reference_documents WHERE id = ?", [id], (err, row) => {
            if (err) return reject(err);
            if (row && row.file_path && fs.existsSync(row.file_path)) {
                try {
                    fs.unlinkSync(row.file_path);
                    log.info(`Associated file deleted: ${row.file_path}`);
                } catch (unlinkErr) {
                    log.error(`Failed to delete associated file: ${row.file_path}`, unlinkErr);
                }
            }
            db.run("DELETE FROM reference_documents WHERE id = ?", [id], (err) => {
                if (handleDbError(err, reject)) return;
                log.info(`Reference document with ID: ${id} deleted successfully.`);
                resolve({ success: true });
            });
        });
    }));
}

module.exports = { registerReferenceHandlers };
