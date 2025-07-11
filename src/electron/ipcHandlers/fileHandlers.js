// Lokasi file: src/electron/ipcHandlers/fileHandlers.js
// Deskripsi: Handler untuk dialog file dan operasi file system.

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
}

module.exports = { registerFileHandlers };
