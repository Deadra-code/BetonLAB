// Lokasi file: vitest.config.js
// Deskripsi: File konfigurasi untuk Vitest, test runner.

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Menggunakan JSDOM untuk mensimulasikan lingkungan browser
    setupFiles: './src/test/setup.js', // File setup (jika diperlukan di masa depan)
  },
});
