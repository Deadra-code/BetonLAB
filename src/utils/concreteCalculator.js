// Lokasi file: src/utils/concreteCalculator.js
// Deskripsi: Menambahkan validasi input yang lebih ketat untuk properti material.

import { getWCRatio, waterAndAirContentData, coarseAggregateVolumeData } from '../data/sniData';

/**
 * Calculates the concrete mix design based on SNI standards.
 * @param {object} inputs - The design parameters and material properties.
 * @returns {object} The calculated mix design results.
 * @throws {Error} If inputs are invalid or calculation cannot be completed.
 */
export function calculateMixDesign(inputs) {
    // 1. Validasi input dasar (harus ada dan numerik)
    const requiredFields = ['fc', 'stdDev', 'slump', 'maxAggrSize', 'sgCement', 'sgCoarse', 'sgFine', 'dryRoddedWeightCoarse', 'finenessModulus'];
    for (const field of requiredFields) {
        if (inputs[field] === '' || inputs[field] === null || isNaN(parseFloat(inputs[field]))) {
            throw new Error(`Input tidak valid atau kosong untuk: ${field}`);
        }
    }
    
    // --- PERBAIKAN: Validasi Logis & Rentang Nilai ---
    const validations = [
        { check: parseFloat(inputs.fc) <= 0, message: "Kuat tekan (f'c) harus lebih besar dari 0." },
        { check: parseFloat(inputs.sgCement) < 2.5 || parseFloat(inputs.sgCement) > 3.5, message: `Berat jenis semen (${inputs.sgCement}) tidak realistis.` },
        { check: parseFloat(inputs.sgCoarse) < 2.0 || parseFloat(inputs.sgCoarse) > 3.5, message: `Berat jenis agregat kasar (${inputs.sgCoarse}) tidak realistis.` },
        { check: parseFloat(inputs.sgFine) < 2.0 || parseFloat(inputs.sgFine) > 3.5, message: `Berat jenis agregat halus (${inputs.sgFine}) tidak realistis.` },
        { check: parseFloat(inputs.dryRoddedWeightCoarse) < 1000 || parseFloat(inputs.dryRoddedWeightCoarse) > 2000, message: `Berat isi agregat kasar (${inputs.dryRoddedWeightCoarse} kg/m³) tidak realistis.` },
        { check: parseFloat(inputs.moistureFine) > 20, message: `Kadar air agregat halus (${inputs.moistureFine}%) tidak realistis.` },
        { check: parseFloat(inputs.moistureCoarse) > 20, message: `Kadar air agregat kasar (${inputs.moistureCoarse}%) tidak realistis.` },
        { check: parseFloat(inputs.absorptionFine) > 10, message: `Nilai penyerapan agregat halus (${inputs.absorptionFine}%) sangat tinggi.` },
        { check: parseFloat(inputs.absorptionCoarse) > 10, message: `Nilai penyerapan agregat kasar (${inputs.absorptionCoarse}%) sangat tinggi.` },
    ];

    for (const v of validations) {
        if (v.check) throw new Error(v.message);
    }
    // --- Akhir Perbaikan ---

    // 2. Calculate Target Compressive Strength (f'cr)
    const fcr = parseFloat(inputs.fc) + 1.64 * parseFloat(inputs.stdDev);

    // 3. Determine Water-Cement Ratio (W/C Ratio or FAS)
    const wcRatio = getWCRatio(fcr);

    // 4. Determine Water and Air Content
    const slumpVal = parseFloat(inputs.slump);
    const slumpRange = (s => {
        if (s >= 10 && s <= 30) return '10-30';
        if (s > 30 && s <= 50) return '30-50';
        if (s > 50 && s <= 100) return '80-100';
        if (s > 100 && s <= 180) return '150-180';
        return null;
    })(slumpVal);
    if (!slumpRange) throw new Error(`Nilai slump ${inputs.slump} di luar rentang SNI.`);
    
    const waterAndAir = waterAndAirContentData[inputs.maxAggrSize];
    if (!waterAndAir) throw new Error(`Ukuran agregat maksimum ${inputs.maxAggrSize}mm tidak valid.`);
    
    let waterContent = waterAndAir.slump[slumpRange];
    const airContent = waterAndAir.air;

    const waterReductionPercent = parseFloat(inputs.admixture?.waterReduction) || 0;
    if (waterReductionPercent > 0) {
        waterContent *= (1 - waterReductionPercent / 100);
    }

    // 5. Calculate Cement Content
    const cementContent = waterContent / wcRatio;

    // 6. Calculate Coarse Aggregate Content
    const coarseAggrVolFactor = coarseAggregateVolumeData[inputs.maxAggrSize]?.[inputs.finenessModulus];
    if (!coarseAggrVolFactor) throw new Error(`Modulus kehalusan ${inputs.finenessModulus} tidak valid untuk agregat ${inputs.maxAggrSize}mm.`);
    const coarseAggrWeightSSD = coarseAggrVolFactor * parseFloat(inputs.dryRoddedWeightCoarse);

    // 7. Calculate Fine Aggregate Content using Absolute Volume Method
    const volWater = waterContent / 1000;
    const volCement = cementContent / (parseFloat(inputs.sgCement) * 1000);
    const volCoarseSSD = coarseAggrWeightSSD / (parseFloat(inputs.sgCoarse) * 1000);
    const volAir = airContent / 100;
    const volFineSSD = 1 - volWater - volCement - volCoarseSSD - volAir;
    
    if (volFineSSD <= 0) {
        throw new Error("Volume agregat halus negatif. Periksa kembali properti material (BJ, Berat Isi) karena menghasilkan volume yang tidak valid.");
    }
    
    const fineAggrWeightSSD = volFineSSD * parseFloat(inputs.sgFine) * 1000;

    // 8. Adjust for Moisture in Aggregates (Corrected Proportions)
    const correctedCoarseWeight = coarseAggrWeightSSD * (1 + parseFloat(inputs.moistureCoarse) / 100);
    const correctedFineWeight = fineAggrWeightSSD * (1 + parseFloat(inputs.moistureFine) / 100);
    const waterInCoarse = coarseAggrWeightSSD * (parseFloat(inputs.moistureCoarse) / 100 - parseFloat(inputs.absorptionCoarse) / 100);
    const waterInFine = fineAggrWeightSSD * (parseFloat(inputs.moistureFine) / 100 - parseFloat(inputs.absorptionFine) / 100);
    const correctedWater = waterContent - waterInCoarse - waterInFine;

    return {
        fcr,
        wcRatio,
        waterContent,
        cementContent,
        coarseAggrWeightSSD,
        fineAggrWeightSSD,
        airContent,
        correctedCoarseWeight,
        correctedFineWeight,
        correctedWater,
        volumes: { volWater, volCement, volCoarseSSD, volFineSSD, volAir }
    };
}
