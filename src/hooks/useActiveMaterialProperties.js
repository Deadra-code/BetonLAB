import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/electronAPI';

export const useActiveMaterialProperties = (apiReady) => {
    const [activeProperties, setActiveProperties] = useState({
        cements: [],
        fineAggregates: [],
        coarseAggregates: [],
    });
    const [loading, setLoading] = useState(false);

    const fetchAndProcessData = useCallback(async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const materialsWithTests = await api.getMaterialsWithActiveTests();
            
            const processedData = {
                cements: [],
                fineAggregates: [],
                coarseAggregates: [],
            };

            for (const material of materialsWithTests) {
                const activeTests = {};
                if (material.active_tests) {
                    const testsStr = material.active_tests.split('|||');
                    testsStr.forEach(testPair => {
                        const [type, json, date] = testPair.split(':::');
                        if (type && json) {
                            activeTests[type] = {
                                ...JSON.parse(json),
                                test_date: date 
                            };
                        }
                    });
                }
                
                // PEMANTAPAN: Menyertakan tabel saringan lengkap
                const materialWithProps = {
                    id: material.id,
                    name: material.name,
                    properties: {
                        sg: activeTests.specific_gravity?.bj_ssd || 0,
                        sg_date: activeTests.specific_gravity?.test_date,
                        absorption: activeTests.specific_gravity?.absorption || 0,
                        absorption_date: activeTests.specific_gravity?.test_date,
                        moisture: activeTests.moisture?.moisture_content || 0,
                        moisture_date: activeTests.moisture?.test_date,
                        silt: activeTests.silt?.silt_content || 0,
                        silt_date: activeTests.silt?.test_date,
                        bulk_density: activeTests.bulk_density?.bulk_density || 0,
                        bulk_density_date: activeTests.bulk_density?.test_date,
                        fm: activeTests.sieve_analysis?.finenessModulus || 0,
                        fm_date: activeTests.sieve_analysis?.test_date,
                        sieve_table: activeTests.sieve_analysis?.table || null, // Data baru untuk grafik
                        abrasion: activeTests.los_angeles?.abrasion_value || 0,
                        abrasion_date: activeTests.los_angeles?.test_date,
                        organic: activeTests.organic_content?.conclusion || 'Belum diuji',
                        organic_date: activeTests.organic_content?.test_date,
                    }
                };

                if (material.material_type === 'cement') {
                    materialWithProps.properties.sg = activeTests.specific_gravity?.bj_ssd || 3.15;
                    processedData.cements.push(materialWithProps);
                } else if (material.material_type === 'fine_aggregate') {
                    processedData.fineAggregates.push(materialWithProps);
                } else if (material.material_type === 'coarse_aggregate') {
                    processedData.coarseAggregates.push(materialWithProps);
                }
            }
            setActiveProperties(processedData);
        } catch (error) {
            console.error("Failed to fetch or process active material properties:", error);
        } finally {
            setLoading(false);
        }
    }, [apiReady]);

    useEffect(() => {
        fetchAndProcessData();
    }, [fetchAndProcessData]);

    return { activeProperties, loading, refresh: fetchAndProcessData };
};
