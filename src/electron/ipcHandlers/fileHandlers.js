// Lokasi file: src/electron/ipcHandlers/fileHandlers.js
// Deskripsi: Penambahan handler untuk menyimpan file surat permohonan.

const { app, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

function registerFileHandlers(ipcMain, db) {
    ipcMain.handle('dialog:open-image', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
        });
        if (!canceled) return filePaths[0];
    });

    ipcMain.handle('dialog:open-pdf', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
        });
        if (!canceled) return filePaths[0];
    });

    ipcMain.handle('file:save-logo', async (event, filePath) => {
        const userDataPath = app.getPath('userData');
        const logoDir = path.join(userDataPath, 'logos');
        if (!fs.existsSync(logoDir)) {
            fs.mkdirSync(logoDir, { recursive: true });
        }
        const newPath = path.join(logoDir, path.basename(filePath));
        fs.copyFileSync(filePath, newPath);
        return newPath;
    });

    ipcMain.handle('file:save-test-image', async (event, filePath) => {
        const userDataPath = app.getPath('userData');
        const imageDir = path.join(userDataPath, 'test_images');
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newPath = path.join(imageDir, uniqueSuffix + path.extname(filePath));
        fs.copyFileSync(filePath, newPath);
        return newPath;
    });

    ipcMain.handle('file:read-base64', async (event, filePath) => {
        try {
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, { encoding: 'base64' });
            }
        } catch (error) {
            log.error(`Failed to read file at ${filePath}:`, error);
        }
        return null;
    });

    ipcMain.handle('file:save-csv', async (event, { defaultName, content }) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            defaultPath: `${defaultName}.csv`,
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        });
        if (!canceled && filePath) {
            try {
                fs.writeFileSync(filePath, content);
                return { success: true, path: filePath };
            } catch (error) {
                log.error('Failed to save CSV file:', error);
                return { success: false, error: error.message };
            }
        }
        return { success: false, error: 'Save dialog canceled' };
    });

    ipcMain.handle('shell:open-path', async (event, path) => {
        try {
            await shell.openPath(path);
            return { success: true };
        } catch (error) {
            log.error(`Failed to open path ${path}:`, error);
            return { success: false, error: error.message };
        }
    });

    // --- BARU: Handler untuk menyimpan surat permohonan ---
    ipcMain.handle('file:save-request-letter', async (event, filePath) => {
        const userDataPath = app.getPath('userData');
        const letterDir = path.join(userDataPath, 'request_letters');
        if (!fs.existsSync(letterDir)) {
            fs.mkdirSync(letterDir, { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newPath = path.join(letterDir, uniqueSuffix + '-' + path.basename(filePath));
        fs.copyFileSync(filePath, newPath);
        log.info(`Request letter saved: ${newPath}`);
        return newPath;
    });

    const getAssetsDir = () => {
        const userDataPath = app.getPath('userData');
        const assetsDir = path.join(userDataPath, 'report_assets');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }
        return assetsDir;
    };

    ipcMain.handle('file:save-report-asset', async (event, filePath) => {
        const assetsDir = getAssetsDir();
        const fileName = path.basename(filePath);
        const newPath = path.join(assetsDir, fileName);
        
        if (fs.existsSync(newPath)) {
            throw new Error(`File dengan nama "${fileName}" sudah ada.`);
        }
        
        fs.copyFileSync(filePath, newPath);
        log.info(`Report asset saved: ${newPath}`);
        return newPath;
    });

    ipcMain.handle('file:list-report-assets', async () => {
        const assetsDir = getAssetsDir();
        const files = fs.readdirSync(assetsDir);
        return files.map(file => ({
            name: file,
            path: path.join(assetsDir, file)
        }));
    });

    ipcMain.handle('file:delete-report-asset', async (event, filePath) => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            log.info(`Report asset deleted: ${filePath}`);
            return { success: true };
        }
        return { success: false, error: 'File tidak ditemukan.' };
    });
}

module.exports = { registerFileHandlers };
