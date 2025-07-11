import { getWCRatio, waterAndAirContentData, coarseAggregateVolumeData } from '../data/sniData';

/**
 * Calculates the concrete mix design based on SNI standards.
 * @param {object} inputs - The design parameters and material properties.
 * @returns {object} The calculated mix design results.
 * @throws {Error} If inputs are invalid or calculation cannot be completed.
 */
export function calculateMixDesign(inputs) {
    // 1. Validate that all necessary inputs are filled and are numbers
    const requiredFields = ['fc', 'stdDev', 'slump', 'maxAggrSize', 'sgCement', 'sgCoarse', 'sgFine', 'dryRoddedWeightCoarse', 'finenessModulus'];
    for (const field of requiredFields) {
        if (inputs[field] === '' || isNaN(parseFloat(inputs[field]))) {
            throw new Error(`Input tidak valid atau kosong untuk: ${field}`);
        }
    }
    
    if (parseFloat(inputs.moistureFine) > 20) {
        throw new Error(`Kadar air agregat halus (${inputs.moistureFine}%) tidak realistis.`);
    }
    if (parseFloat(inputs.moistureCoarse) > 20) {
        throw new Error(`Kadar air agregat kasar (${inputs.moistureCoarse}%) tidak realistis.`);
    }
    if (parseFloat(inputs.absorptionFine) > 20) {
        throw new Error(`Nilai penyerapan agregat halus (${inputs.absorptionFine}%) tidak realistis.`);
    }
    if (parseFloat(inputs.absorptionCoarse) > 20) {
        throw new Error(`Nilai penyerapan agregat kasar (${inputs.absorptionCoarse}%) tidak realistis.`);
    }


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

    // PEMANTAPAN: Integrasi Admixture - Mengurangi kebutuhan air
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
