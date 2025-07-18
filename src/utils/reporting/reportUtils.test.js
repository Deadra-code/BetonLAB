// Lokasi file: src/utils/reporting/reportUtils.test.js
// Deskripsi: Unit test untuk fungsi utilitas pelaporan.

import { describe, it, expect } from 'vitest';
import { replacePlaceholders, checkConditions } from './reportUtils';

// Data mock untuk pengujian
const mockReportData = {
    projectName: 'Proyek Jembatan Mahakam',
    clientName: 'PT. Karya Abadi',
    trials: [
        {
            trial_name: 'TM-01',
            design_input: { fc: 30, slump: 120 },
            design_result: { fcr: 38.2, wcRatio: 0.45, cementContent: 420 }
        }
    ]
};

describe('reportUtils', () => {
    // Pengujian untuk fungsi replacePlaceholders
    describe('replacePlaceholders', () => {
        it('should replace known placeholders correctly', () => {
            const text = 'Laporan untuk {{nama_proyek}} dengan fcr {{fcr}}';
            const result = replacePlaceholders(text, mockReportData, {});
            expect(result).toBe('Laporan untuk Proyek Jembatan Mahakam dengan fcr 38.20');
        });

        it('should not replace unknown placeholders', () => {
            const text = 'Ini adalah {{placeholder_tidak_dikenal}}';
            const result = replacePlaceholders(text, mockReportData, {});
            expect(result).toBe('Ini adalah {{placeholder_tidak_dikenal}}');
        });

        it('should handle empty report data gracefully', () => {
            const text = 'Proyek: {{nama_proyek}}';
            const result = replacePlaceholders(text, {}, {});
            expect(result).toBe('Proyek: ');
        });
    });

    // Pengujian untuk fungsi checkConditions
    describe('checkConditions', () => {
        it('should return true if no conditions are provided', () => {
            expect(checkConditions([], mockReportData)).toBe(true);
            expect(checkConditions(undefined, mockReportData)).toBe(true);
        });

        it('should return true when a ">" condition is met', () => {
            const conditions = [{ field: 'fcr', operator: '>', value: '35' }];
            expect(checkConditions(conditions, mockReportData)).toBe(true);
        });

        it('should return false when a ">" condition is not met', () => {
            const conditions = [{ field: 'fcr', operator: '>', value: '40' }];
            expect(checkConditions(conditions, mockReportData)).toBe(false);
        });

        it('should return true when a "<" condition is met', () => {
            const conditions = [{ field: 'wcRatio', operator: '<', value: '0.5' }];
            expect(checkConditions(conditions, mockReportData)).toBe(true);
        });

        it('should return true for "==" with correct value', () => {
            const conditions = [{ field: 'cementContent', operator: '==', value: '420' }];
            expect(checkConditions(conditions, mockReportData)).toBe(true);
        });

        it('should handle multiple conditions (AND logic)', () => {
            const conditions = [
                { field: 'fcr', operator: '>', value: '38' },
                { field: 'wcRatio', operator: '<', value: '0.46' }
            ];
            expect(checkConditions(conditions, mockReportData)).toBe(true);
        });

        it('should fail if one of multiple conditions is not met', () => {
            const conditions = [
                { field: 'fcr', operator: '>', value: '38' },
                { field: 'wcRatio', operator: '>', value: '0.5' } // Ini akan gagal
            ];
            expect(checkConditions(conditions, mockReportData)).toBe(false);
        });
    });
});
