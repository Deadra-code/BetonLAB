// Lokasi file: src/electron/windowManager.js
// Deskripsi: Mengelola pembuatan dan event BrowserWindow.

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, '../../public/preload.js'), // Path disesuaikan
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '../../public/favicon.ico'), // Path disesuaikan
        show: false
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../../build/index.html')}`;

    // Cukup muat URL secara langsung.
    // Perintah "wait-on" di package.json sudah memastikan server dev siap.
    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
}

module.exports = { createWindow };
