// Lokasi file: src/electron/ipcHandlers/userHandlers.js
// Deskripsi: File baru untuk menangani semua logika terkait otentikasi dan manajemen pengguna.

const log = require('electron-log');
const crypto = require('crypto');

// Helper untuk hash password
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// Helper untuk verifikasi password
const verifyPassword = (password, storedHash) => {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
};

function registerUserHandlers(ipcMain, db) {
    // Handler untuk proses login
    ipcMain.handle('auth:login', async (event, { username, password }) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
                if (err) {
                    log.error('Login error - db query failed:', err);
                    return reject(new Error('Terjadi kesalahan pada server.'));
                }
                if (!user) {
                    return reject(new Error('Nama pengguna atau kata sandi salah.'));
                }

                if (verifyPassword(password, user.password_hash)) {
                    log.info(`User ${username} logged in successfully.`);
                    // Jangan kirim hash password ke frontend
                    const { password_hash, ...userWithoutPassword } = user;
                    resolve({ success: true, user: userWithoutPassword });
                } else {
                    log.warn(`Failed login attempt for user: ${username}`);
                    reject(new Error('Nama pengguna atau kata sandi salah.'));
                }
            });
        });
    });

    // Handler untuk mendapatkan semua pengguna (hanya untuk Admin)
    ipcMain.handle('users:get-all', async () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, username, full_name, role FROM users", [], (err, users) => {
                if (err) {
                    log.error('Get all users error:', err);
                    return reject(new Error('Gagal mengambil data pengguna.'));
                }
                resolve(users);
            });
        });
    });

    // Handler untuk menambah pengguna baru (hanya untuk Admin)
    ipcMain.handle('users:add', async (event, { username, password, fullName, role }) => {
        return new Promise((resolve, reject) => {
            // PERBAIKAN: Validasi input backend
            if (!username || !password || !fullName || !['admin', 'penyelia', 'teknisi'].includes(role)) {
                return reject(new Error('Data pengguna yang dikirim tidak lengkap atau tidak valid.'));
            }
            
            const passwordHash = hashPassword(password);
            db.run("INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
                [username, passwordHash, fullName, role],
                function (err) {
                    if (err) {
                        log.error('Add user error:', err);
                        return reject(new Error(err.code === 'SQLITE_CONSTRAINT' ? 'Nama pengguna sudah ada.' : 'Gagal menambah pengguna.'));
                    }
                    log.info(`User ${username} created with ID: ${this.lastID}`);
                    resolve({ success: true, id: this.lastID });
                }
            );
        });
    });

    // Handler untuk menghapus pengguna (hanya untuk Admin)
    ipcMain.handle('users:delete', async (event, id) => {
        return new Promise((resolve, reject) => {
            // PERBAIKAN: Validasi input backend
            if (typeof id !== 'number' || id <= 0) {
                return reject(new Error('ID pengguna tidak valid.'));
            }
            
            // Pencegahan: jangan biarkan pengguna admin default dihapus
            if (id === 1) {
                return reject(new Error('Pengguna admin default tidak dapat dihapus.'));
            }
            db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
                if (err) {
                    log.error('Delete user error:', err);
                    return reject(new Error('Gagal menghapus pengguna.'));
                }
                if (this.changes === 0) {
                     return reject(new Error('Pengguna tidak ditemukan.'));
                }
                log.info(`User with ID ${id} deleted.`);
                resolve({ success: true });
            });
        });
    });
}

module.exports = { registerUserHandlers };
