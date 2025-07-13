// Lokasi file: src/hooks/useConcreteTests.test.js
// Deskripsi: File pengujian baru untuk hook useConcreteTests.

import { renderHook, act } from '@testing-library/react-hooks';
import { useConcreteTests } from './useConcreteTests';
import * as api from '../api/electronAPI';

// Mock modul api dan notifier
jest.mock('../api/electronAPI');
jest.mock('./useNotifier', () => ({
  useNotifier: () => ({
    notify: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }),
}));

describe('useConcreteTests', () => {
  beforeEach(() => {
    api.getTestsForTrial.mockClear();
    api.addConcreteTest.mockClear();
    api.deleteConcreteTest.mockClear();
  });

  it('should fetch tests when trialId is valid', async () => {
    const mockData = [
      { id: 1, specimen_id: 'A1', result_data_json: '{"strength_MPa": 30}' }
    ];
    api.getTestsForTrial.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(() => useConcreteTests(1));

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.tests.length).toBe(1);
    expect(result.current.tests[0].result_data.strength_MPa).toBe(30);
    expect(api.getTestsForTrial).toHaveBeenCalledWith(1);
  });

  it('should call addConcreteTest and refetch data', async () => {
    api.getTestsForTrial.mockResolvedValue([]);
    api.addConcreteTest.mockResolvedValue({ success: true });
    api.getTestsForTrial.mockResolvedValueOnce([{ id: 1, specimen_id: 'A1' }]);

    const { result, waitForNextUpdate } = renderHook(() => useConcreteTests(1));
    await waitForNextUpdate();

    await act(async () => {
      await result.current.addTest({ specimen_id: 'A1' });
    });

    expect(api.addConcreteTest).toHaveBeenCalledWith({ trial_id: 1, specimen_id: 'A1' });
    expect(api.getTestsForTrial).toHaveBeenCalledTimes(2);
    expect(result.current.tests.length).toBe(1);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Gagal memuat data.';
    api.getTestsForTrial.mockRejectedValue(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useConcreteTests(1));
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual([]);
    expect(result.current.testError).toContain('Gagal memuat data uji beton');
  });
});
