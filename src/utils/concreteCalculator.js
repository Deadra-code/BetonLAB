// src/utils/concreteCalculator.js
// Deskripsi: Direfaktor total untuk menggunakan formula dinamis dari database.

/**
 * Mengevaluasi ekspresi matematika dengan aman.
 * @param {string} expression - String ekspresi, misal "fc + 1.64 * stdDev".
 * @param {object} context - Objek berisi nilai variabel, misal { fc: 30, stdDev: 4 }.
 * @returns {number} Hasil perhitungan.
 */
function evaluateExpression(expression, context) {
    try {
        const variableNames = Object.keys(context);
        const variableValues = Object.values(context);
        const func = new Function(...variableNames, `return ${expression}`);
        const result = func(...variableValues);
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error(`Hasil tidak valid: ${result}`);
        }
        return result;
    } catch (e) {
        console.error("Gagal mengevaluasi ekspresi:", expression, "dengan konteks:", context, "Error:", e);
        throw new Error(`Sintaks formula tidak valid: "${expression}"`);
    }
}

/**
 * Mencari nilai dalam tabel lookup JSON.
 * @param {object} table - Tabel data yang sudah di-parse.
 * @param {number} key - Kunci untuk mencari.
 * @returns {any} Nilai yang ditemukan.
 */
function lookupJsonTable(table, key) {
    const sortedKeys = Object.keys(table).map(parseFloat).sort((a, b) => b - a);
    for (const tableKey of sortedKeys) {
        if (key >= tableKey) {
            return table[tableKey];
        }
    }
    return table["default"] || null;
}


/**
 * Calculates the concrete mix design based on dynamic formulas.
 * @param {object} inputs - The design parameters and material properties.
 * @param {object} formulas - The formulas object fetched from the database.
 * @returns {object} The calculated mix design results.
 * @throws {Error} If inputs are invalid or calculation cannot be completed.
 */
export function calculateMixDesign(inputs, formulas) {
    // 1. Validasi input dasar
    const requiredFields = ['fc', 'stdDev', 'slump', 'maxAggrSize', 'sgCement', 'sgCoarse', 'sgFine', 'dryRoddedWeightCoarse', 'finenessModulus'];
    for (const field of requiredFields) {
        if (inputs[field] === '' || inputs[field] === null || isNaN(parseFloat(inputs[field]))) {
            throw new Error(`Input tidak valid atau kosong untuk: ${field}`);
        }
    }
    
    // 2. Hitung f'cr menggunakan formula dinamis
    const fcr = evaluateExpression(
        formulas.fcr_formula.formula_value, 
        { fc: parseFloat(inputs.fc), stdDev: parseFloat(inputs.stdDev) }
    );

    // 3. Tentukan Rasio Air/Semen dari tabel dinamis
    const wcRatioTable = JSON.parse(formulas.wc_ratio_table.formula_value);
    const wcRatio = lookupJsonTable(wcRatioTable, fcr);
    if (wcRatio === null) throw new Error("Tidak dapat menentukan Rasio Air/Semen.");

    // 4. Tentukan Kebutuhan Air & Udara dari tabel dinamis
    const waterAirTable = JSON.parse(formulas.water_air_table.formula_value);
    const slumpVal = parseFloat(inputs.slump);
    const slumpRange = (s => {
        if (s >= 10 && s <= 30) return '10-30'; if (s > 30 && s <= 50) return '30-50';
        if (s > 50 && s <= 100) return '80-100'; if (s > 100 && s <= 180) return '150-180';
        return null;
    })(slumpVal);
    if (!slumpRange) throw new Error(`Nilai slump ${inputs.slump} di luar rentang.`);
    
    const waterAndAir = waterAirTable[inputs.maxAggrSize];
    if (!waterAndAir) throw new Error(`Ukuran agregat maksimum ${inputs.maxAggrSize}mm tidak valid.`);
    
    let waterContent = waterAndAir.slump[slumpRange];
    const airContent = waterAndAir.air;

    const waterReductionPercent = parseFloat(inputs.admixture?.waterReduction) || 0;
    if (waterReductionPercent > 0) {
        waterContent *= (1 - waterReductionPercent / 100);
    }

    // 5. Hitung Kadar Semen
    const cementContent = waterContent / wcRatio;

    // 6. Hitung Kadar Agregat Kasar dari tabel dinamis
    const coarseAggVolTable = JSON.parse(formulas.coarse_agg_vol_table.formula_value);
    const coarseAggrVolFactor = coarseAggVolTable[inputs.maxAggrSize]?.[inputs.finenessModulus];
    if (!coarseAggrVolFactor) throw new Error(`Modulus kehalusan ${inputs.finenessModulus} tidak valid.`);
    const coarseAggrWeightSSD = coarseAggrVolFactor * parseFloat(inputs.dryRoddedWeightCoarse);

    // 7. Hitung Kadar Agregat Halus menggunakan formula dinamis
    const volWater = waterContent / 1000;
    const volCement = cementContent / (parseFloat(inputs.sgCement) * 1000);
    const volCoarseSSD = coarseAggrWeightSSD / (parseFloat(inputs.sgCoarse) * 1000);
    const volAir = airContent / 100;

    const fineAggrWeightSSD = evaluateExpression(
        formulas.fine_agg_weight.formula_value,
        { volWater, volCement, volCoarseSSD, volAir, sgFine: parseFloat(inputs.sgFine) }
    );
     if (fineAggrWeightSSD <= 0) {
        throw new Error("Volume agregat halus negatif. Periksa kembali properti material (BJ, Berat Isi).");
    }

    // 8. Sesuaikan proporsi dengan kadar air menggunakan formula dinamis
    const context = {
        waterContent,
        coarseAggrWeightSSD,
        fineAggrWeightSSD,
        moistureCoarse: parseFloat(inputs.moistureCoarse),
        absorptionCoarse: parseFloat(inputs.absorptionCoarse),
        moistureFine: parseFloat(inputs.moistureFine),
        absorptionFine: parseFloat(inputs.absorptionFine),
    };

    const correctedCoarseWeight = evaluateExpression(formulas.corrected_coarse_weight.formula_value, context);
    const correctedFineWeight = evaluateExpression(formulas.corrected_fine_weight.formula_value, context);
    const correctedWater = evaluateExpression(formulas.corrected_water.formula_value, context);

    return {
        fcr, wcRatio, waterContent, cementContent, coarseAggrWeightSSD,
        fineAggrWeightSSD, airContent, correctedCoarseWeight,
        correctedFineWeight, correctedWater,
        volumes: { volWater, volCement, volCoarseSSD, volFineSSD: (fineAggrWeightSSD / (parseFloat(inputs.sgFine) * 1000)), volAir }
    };
}
