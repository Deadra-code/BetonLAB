import { useState, useCallback } from 'react';

export const useValidation = () => {
    const [validationWarnings, setValidationWarnings] = useState({});

    const validateInputs = useCallback((currentInputs, currentResults) => {
        const warnings = {};
        if (currentInputs.fc > 80) warnings.fc = "Kuat tekan sangat tinggi, pastikan material mendukung.";
        if (currentInputs.fc < 10) warnings.fc = "Kuat tekan sangat rendah.";
        if (currentInputs.slump > 220) warnings.slump = "Nilai slump sangat tinggi, berpotensi terjadi segregasi.";
        if (currentResults) {
            if (currentResults.wcRatio > 0.75) warnings.wcRatio = "FAS tinggi, kekuatan & durabilitas mungkin rendah.";
            if (currentResults.wcRatio < 0.35) warnings.wcRatio = "FAS sangat rendah, pastikan kelecakan cukup.";
        }
        setValidationWarnings(warnings);
    }, []);

    return { validationWarnings, validateInputs, setValidationWarnings };
};
