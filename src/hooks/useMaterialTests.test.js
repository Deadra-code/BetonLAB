// Lokasi file: src/hooks/useMaterialTests.test.js
// Deskripsi: File pengujian baru untuk hook useMaterialTests.

import { renderHook, act } from '@testing-library/react-hooks';
import { useMaterialTests } from './useMaterialTests';
import * as api from '../api/electronAPI';

// Mock modul api
jest.mock('../api/electronAPI');

describe('useMaterialTests', () => {
  beforeEach(() => {
    // Bersihkan semua mock sebelum setiap tes
    api.getTestsForMaterial.mockClear();
    api.addMaterialTest.mockClear();
    api.setActiveMaterialTest.mockClear();
  });

  it('should not fetch tests if materialId is null', () => {
    renderHook(() => useMaterialTests(null));
    expect(api.getTestsForMaterial).not.toHaveBeenCalled();
  });

  it('should fetch and parse tests when materialId is provided', async () => {
    const mockTests = [
      { id: 1, test_type: 'sieve_analysis', result_data_json: '{"finenessModulus": 2.8}' }
    ];
    api.getTestsForMaterial.mockResolvedValue(mockTests);

    const { result, waitForNextUpdate } = renderHook(() => useMaterialTests(123));

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.tests.length).toBe(1);
    expect(result.current.tests[0].result_data.finenessModulus).toBe(2.8);
    expect(api.getTestsForMaterial).toHaveBeenCalledWith(123);
  });

  it('should handle addTest correctly and refetch', async () => {
    api.getTestsForMaterial.mockResolvedValue([]); // Fetch awal
    api.addMaterialTest.mockResolvedValue({ success: true });
    api.getTestsForMaterial.mockResolvedValueOnce([{ id: 2, test_type: 'silt' }]); // Fetch setelah add

    const { result, waitForNextUpdate } = renderHook(() => useMaterialTests(123));
    await waitForNextUpdate();

    await act(async () => {
      await result.current.addTest({ test_type: 'silt' });
    });

    expect(api.addMaterialTest).toHaveBeenCalledWith({ material_id: 123, test_type: 'silt' });
    expect(api.getTestsForMaterial).toHaveBeenCalledTimes(2);
    expect(result.current.tests.length).toBe(1);
  });

  it('should handle setActiveTest correctly and refetch', async () => {
    const initialTests = [{ id: 1, test_type: 'sieve_analysis', is_active_for_design: 0 }];
    const updatedTests = [{ id: 1, test_type: 'sieve_analysis', is_active_for_design: 1 }];
    api.getTestsForMaterial.mockResolvedValueOnce(initialTests);
    api.setActiveMaterialTest.mockResolvedValue({ success: true });
    api.getTestsForMaterial.mockResolvedValueOnce(updatedTests);

    const { result, waitForNextUpdate } = renderHook(() => useMaterialTests(123));
    await waitForNextUpdate();

    expect(result.current.tests[0].is_active_for_design).toBe(0);

    await act(async () => {
      await result.current.setActiveTest({ testType: 'sieve_analysis', testId: 1 });
    });

    expect(api.setActiveMaterialTest).toHaveBeenCalledWith({ materialId: 123, testType: 'sieve_analysis', testId: 1 });
    expect(api.getTestsForMaterial).toHaveBeenCalledTimes(2);
    expect(result.current.tests[0].is_active_for_design).toBe(1);
  });
});
