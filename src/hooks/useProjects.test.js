// Lokasi file: src/hooks/useProjects.test.js
// Deskripsi: Unit test untuk custom hook useProjects.

import { renderHook, act } from '@testing-library/react-hooks';
import { useProjects } from './useProjects';
import * as api from '../api/electronAPI';

// Mock modul 'electronAPI' dan 'useNotifier'
jest.mock('../api/electronAPI');
jest.mock('./useNotifier', () => ({
  useNotifier: () => ({
    notify: {
      success: jest.fn(),
      error: jest.fn(),
    },
  }),
}));

describe('useProjects', () => {
  beforeEach(() => {
    // Reset mock implementasi sebelum setiap tes
    api.getProjects.mockClear();
    api.addProject.mockClear();
    api.deleteProject.mockClear();
  });

  it('should fetch projects on initial render when api is ready', async () => {
    const mockData = [{ id: 1, projectName: 'Proyek A' }];
    api.getProjects.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(() => useProjects(true));

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.projects).toEqual(mockData);
    expect(api.getProjects).toHaveBeenCalledTimes(1);
  });

  it('should not fetch projects if api is not ready', () => {
    renderHook(() => useProjects(false));
    expect(api.getProjects).not.toHaveBeenCalled();
  });

  it('should add a project and refetch the list', async () => {
    api.getProjects.mockResolvedValueOnce([]); // Fetch awal
    api.addProject.mockResolvedValue({ success: true });
    api.getProjects.mockResolvedValueOnce([{ id: 1, projectName: 'Proyek Baru' }]); // Fetch setelah add

    const { result, waitForNextUpdate } = renderHook(() => useProjects(true));
    await waitForNextUpdate(); // Tunggu fetch awal selesai

    await act(async () => {
      await result.current.addProject({ projectName: 'Proyek Baru' });
    });

    expect(api.addProject).toHaveBeenCalledWith({ projectName: 'Proyek Baru' });
    expect(api.getProjects).toHaveBeenCalledTimes(2); // 1 awal, 1 setelah add
    expect(result.current.projects).toEqual([{ id: 1, projectName: 'Proyek Baru' }]);
  });

  it('should delete a project and refetch the list', async () => {
    const initialProjects = [{ id: 1, projectName: 'Proyek A' }];
    api.getProjects.mockResolvedValueOnce(initialProjects); // Fetch awal
    api.deleteProject.mockResolvedValue({ success: true });
    api.getProjects.mockResolvedValueOnce([]); // Fetch setelah delete

    const { result, waitForNextUpdate } = renderHook(() => useProjects(true));
    await waitForNextUpdate(); // Tunggu fetch awal

    expect(result.current.projects).toEqual(initialProjects);

    await act(async () => {
      await result.current.deleteProject(1);
    });

    expect(api.deleteProject).toHaveBeenCalledWith(1);
    expect(api.getProjects).toHaveBeenCalledTimes(2);
    expect(result.current.projects).toEqual([]);
  });
});
