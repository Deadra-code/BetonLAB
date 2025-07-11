// Lokasi file: src/utils/csvExporter.test.js
// Deskripsi: Unit test untuk fungsionalitas ekspor CSV.

import { exportTrialToCsv, exportComparisonToCsv } from './csvExporter';
import * as api from '../api/electronAPI';
import Papa from 'papaparse';

// Mock modul 'electronAPI' untuk mengisolasi tes dari proses main Electron
jest.mock('../api/electronAPI', () => ({
  saveCsv: jest.fn(),
}));

// Mock 'papaparse' untuk mengontrol output CSV
jest.mock('papaparse', () => ({
  unparse: jest.fn(),
}));

describe('csvExporter', () => {
  // Reset semua mock setelah setiap tes
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tes untuk fungsi ekspor satu trial
  describe('exportTrialToCsv', () => {
    const mockTrial = {
      projectName: 'Proyek Uji',
      trial_name: 'Trial-01',
      design_input: { fc: 30, stdDev: 4 },
      design_result: { fcr: 36.56, wcRatio: 0.48 },
    };

    it('should call api.saveCsv with correctly formatted data', async () => {
      Papa.unparse.mockReturnValue('csv,content');
      api.saveCsv.mockResolvedValue({ success: true, path: 'test.csv' });
      global.alert = jest.fn(); // Mock window.alert

      await exportTrialToCsv({ trial: mockTrial });

      // Verifikasi bahwa Papa.unparse dipanggil dengan data yang benar
      expect(Papa.unparse).toHaveBeenCalledWith(expect.any(Array));
      
      // Verifikasi bahwa api.saveCsv dipanggil dengan nama file dan konten yang diharapkan
      expect(api.saveCsv).toHaveBeenCalledWith({
        defaultName: 'Export-Proyek Uji-Trial-01',
        content: 'csv,content',
      });

      // Verifikasi bahwa notifikasi sukses ditampilkan
      expect(global.alert).toHaveBeenCalledWith('Data berhasil diekspor ke: test.csv');
    });

    it('should show an alert if data is incomplete', async () => {
        global.alert = jest.fn();
        await exportTrialToCsv({ trial: {} });
        expect(global.alert).toHaveBeenCalledWith("Data desain atau hasil tidak lengkap untuk diekspor.");
        expect(api.saveCsv).not.toHaveBeenCalled();
    });
  });

  // Tes untuk fungsi ekspor perbandingan
  describe('exportComparisonToCsv', () => {
    const mockTrials = [
      { id: 1, trial_name: 'Trial-A', design_result: { cementContent: 400 } },
      { id: 2, trial_name: 'Trial-B', design_result: { cementContent: 420 } },
    ];

    it('should format data correctly for comparison and call saveCsv', async () => {
        Papa.unparse.mockReturnValue('Parameter,Trial-A,Trial-B\nSemen (kg/m³),400.00,420.00');
        api.saveCsv.mockResolvedValue({ success: true, path: 'compare.csv' });
        global.alert = jest.fn();

        await exportComparisonToCsv({ trials: mockTrials });

        // Verifikasi bahwa header CSV benar
        expect(Papa.unparse).toHaveBeenCalledWith(expect.objectContaining({
            fields: ['Parameter', 'Trial-A', 'Trial-B']
        }));

        // Verifikasi bahwa api.saveCsv dipanggil
        expect(api.saveCsv).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('Data perbandingan berhasil diekspor ke: compare.csv');
    });
  });
});
