// Lokasi file: src/utils/concreteCalculator.test.js
// Deskripsi: Versi lengkap yang memperluas cakupan pengujian untuk skenario edge case.

import { calculateMixDesign } from './concreteCalculator';
import { defaultInputs } from '../data/sniData';

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

    expect(results.fcr).toBeCloseTo(36.56);
    expect(results.wcRatio).toBe(0.48);
    expect(results.waterContent).toBe(193);
    expect(results.cementContent).toBeCloseTo(402.08);
    expect(results.coarseAggrWeightSSD).toBeCloseTo(992);
    const volWater = 193 / 1000;
    const volCement = 402.08 / (3.15 * 1000);
    const volCoarse = 992 / (2.68 * 1000);
    const volAir = 1.5 / 100;
    const volFine = 1 - volWater - volCement - volCoarse - volAir;
    const expectedFineWeight = volFine * 2.64 * 1000;
    expect(results.fineAggrWeightSSD).toBeCloseTo(expectedFineWeight);
    const waterInCoarse = 992 * (0.015 - 0.005);
    const waterInFine = expectedFineWeight * (0.04 - 0.01);
    expect(results.correctedWater).toBeCloseTo(193 - waterInCoarse - waterInFine);
    expect(results.correctedCoarseWeight).toBeCloseTo(992 * 1.015);
    expect(results.correctedFineWeight).toBeCloseTo(expectedFineWeight * 1.04);
  });

  test('should throw an error if a required input is missing', () => {
    const inputs = { ...defaultInputs, fc: '' };
    expect(() => calculateMixDesign(inputs)).toThrow('Input tidak valid atau kosong untuk: fc');
  });

  test('should throw an error for a slump value outside defined ranges', () => {
    const inputs = { ...defaultInputs, slump: 250 };
    expect(() => calculateMixDesign(inputs)).toThrow('Nilai slump 250 di luar rentang SNI.');
  });
  
  test('should throw an error for unrealistic moisture content', () => {
    const inputs = { ...defaultInputs, moistureFine: 30 };
    expect(() => calculateMixDesign(inputs)).toThrow('Kadar air agregat halus (30%) tidak realistis.');
  });
  
  test('should throw an error for unrealistic absorption', () => {
    const inputs = { ...defaultInputs, absorptionCoarse: 25 };
    expect(() => calculateMixDesign(inputs)).toThrow('Nilai penyerapan agregat kasar (25%) tidak realistis.');
  });

  test('should handle high-strength concrete calculations', () => {
    const inputs = { ...defaultInputs, fc: 50, stdDev: 5 };
    const results = calculateMixDesign(inputs);
    expect(results.fcr).toBe(58.2);
    expect(results.wcRatio).toBe(0.38);
    expect(results.cementContent).toBeGreaterThan(500);
  });

  test('should calculate correctly when standard deviation is zero', () => {
    const inputs = { ...defaultInputs, fc: 25, stdDev: 0 };
    const results = calculateMixDesign(inputs);
    expect(results.fcr).toBe(25);
    expect(results.wcRatio).toBe(0.62);
  });

  test('should calculate correctly for slump value at a boundary (e.g., 30)', () => {
    const inputs = { ...defaultInputs, slump: 30 };
    const results = calculateMixDesign(inputs);
    expect(results.waterContent).toBe(170);
  });
  
  test('should calculate correctly for slump value just above a boundary (e.g., 31)', () => {
    const inputs = { ...defaultInputs, slump: 31 };
    const results = calculateMixDesign(inputs);
    expect(results.waterContent).toBe(180);
  });

  test('should throw an error for negative fine aggregate volume', () => {
    const inputs = { ...defaultInputs, dryRoddedWeightCoarse: 3000 };
    expect(() => calculateMixDesign(inputs)).toThrow(/Volume agregat halus negatif/);
  });

  test('should correctly apply admixture water reduction', () => {
    const inputs = {
      ...defaultInputs,
      admixture: { name: 'SuperP', waterReduction: 10 }
    };
    const expectedWaterContent = 193 * (1 - 0.10);
    const results = calculateMixDesign(inputs);
    expect(results.waterContent).toBeCloseTo(expectedWaterContent);
  });
});
