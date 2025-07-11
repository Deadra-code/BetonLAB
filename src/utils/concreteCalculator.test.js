import { calculateMixDesign } from './concreteCalculator';
import { defaultInputs } from '../data/sniData';

// Mock sniData dependencies to ensure tests are isolated
// PERBAIKAN: Menghapus jest.fn() yang tidak perlu dan langsung menyediakan implementasi fungsi.
jest.mock('../data/sniData', () => ({
  ...jest.requireActual('../data/sniData'),
  getWCRatio: (fcr) => {
    if (fcr >= 45) return 0.38;
    if (fcr >= 40) return 0.43;
    if (fcr >= 35) return 0.48;
    if (fcr >= 30) return 0.55;
    if (fcr >= 25) return 0.62;
    if (fcr >= 20) return 0.69;
    return 0.75;
  },
}));

describe('calculateMixDesign', () => {

  // Test Case 1: Standard "Happy Path" Calculation
  test('should calculate mix design correctly with standard inputs', () => {
    const inputs = {
      ...defaultInputs,
      fc: 30,
      stdDev: 4,
      slump: 90,
      maxAggrSize: '20',
      finenessModulus: '2.80',
      sgCement: 3.15,
      sgCoarse: 2.68,
      sgFine: 2.64,
      dryRoddedWeightCoarse: 1600,
      moistureCoarse: 1.5,
      absorptionCoarse: 0.5,
      moistureFine: 4.0,
      absorptionFine: 1.0,
    };

    const results = calculateMixDesign(inputs);

    // Verifikasi hasil utama
    expect(results.fcr).toBeCloseTo(36.56); // 30 + 1.64 * 4
    expect(results.wcRatio).toBe(0.48);
    expect(results.waterContent).toBe(193); // Dari tabel untuk slump 90 & ag. 20mm
    expect(results.cementContent).toBeCloseTo(402.08); // 193 / 0.48
    
    // Verifikasi berat agregat (SSD)
    // Faktor volume ag. kasar untuk 20mm & FM 2.80 adalah 0.62
    expect(results.coarseAggrWeightSSD).toBeCloseTo(992); // 0.62 * 1600
    // Verifikasi berat agregat halus (berdasarkan volume absolut)
    const volWater = 193 / 1000;
    const volCement = 402.08 / (3.15 * 1000);
    const volCoarse = 992 / (2.68 * 1000);
    const volAir = 1.5 / 100; // Untuk ag. 20mm
    const volFine = 1 - volWater - volCement - volCoarse - volAir;
    const expectedFineWeight = volFine * 2.64 * 1000;
    expect(results.fineAggrWeightSSD).toBeCloseTo(expectedFineWeight); // ~779.6 kg

    // Verifikasi proporsi terkoreksi
    const waterInCoarse = 992 * (0.015 - 0.005);
    const waterInFine = expectedFineWeight * (0.04 - 0.01);
    expect(results.correctedWater).toBeCloseTo(193 - waterInCoarse - waterInFine);
    expect(results.correctedCoarseWeight).toBeCloseTo(992 * 1.015);
    expect(results.correctedFineWeight).toBeCloseTo(expectedFineWeight * 1.04);
  });

  // Test Case 2: Error on Missing Input
  test('should throw an error if a required input is missing', () => {
    const inputs = { ...defaultInputs, fc: '' };
    expect(() => calculateMixDesign(inputs)).toThrow('Input tidak valid atau kosong untuk: fc');
  });

  // Test Case 3: Error on Invalid Slump Range
  test('should throw an error for a slump value outside defined ranges', () => {
    const inputs = { ...defaultInputs, slump: 250 };
    expect(() => calculateMixDesign(inputs)).toThrow('Nilai slump 250 di luar rentang SNI.');
  });
  
  // Test Case 4: Error on unrealistic moisture content
  test('should throw an error for unrealistic moisture content', () => {
    const inputs = { ...defaultInputs, moistureFine: 30 };
    expect(() => calculateMixDesign(inputs)).toThrow('Kadar air agregat halus (30%) tidak realistis.');
  });
  
  // Test Case 5: Error on unrealistic absorption
  test('should throw an error for unrealistic absorption', () => {
    const inputs = { ...defaultInputs, absorptionCoarse: 25 };
    expect(() => calculateMixDesign(inputs)).toThrow('Nilai penyerapan agregat kasar (25%) tidak realistis.');
  });

  // Test Case 6: High-Strength Concrete
  test('should handle high-strength concrete calculations', () => {
    const inputs = { ...defaultInputs, fc: 50, stdDev: 5 };
    const results = calculateMixDesign(inputs);
    expect(results.fcr).toBe(58.2);
    expect(results.wcRatio).toBe(0.38); // W/C ratio terendah
    expect(results.cementContent).toBeGreaterThan(500); // Konten semen tinggi
  });

  // Test Case 7: Zero Standard Deviation
  test('should calculate correctly when standard deviation is zero', () => {
    const inputs = { ...defaultInputs, fc: 25, stdDev: 0 };
    const results = calculateMixDesign(inputs);
    expect(results.fcr).toBe(25);
    expect(results.wcRatio).toBe(0.62);
  });
});
