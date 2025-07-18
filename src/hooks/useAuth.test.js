// Lokasi file: src/hooks/useAuth.test.js
// Deskripsi: Unit test untuk hook otentikasi (Zustand store).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from './useAuth';
import * as api from '../api/electronAPI';

// Mock modul api
vi.mock('../api/electronAPI');

describe('useAuthStore', () => {
    // Reset store ke state awal sebelum setiap tes
    beforeEach(() => {
        act(() => {
            useAuthStore.getState().logout();
        });
    });

    it('should have correct initial state', () => {
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });

    it('should handle successful login', async () => {
        const mockUser = { id: 1, username: 'admin', full_name: 'Admin User', role: 'admin' };
        api.login.mockResolvedValue({ user: mockUser });

        await act(async () => {
            await useAuthStore.getState().login({ username: 'admin', password: 'password' });
        });

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(api.login).toHaveBeenCalledWith({ username: 'admin', password: 'password' });
    });

    it('should handle failed login', async () => {
        const errorMessage = 'Password salah';
        api.login.mockRejectedValue(new Error(errorMessage));

        let result;
        await act(async () => {
            result = await useAuthStore.getState().login({ username: 'admin', password: 'wrongpassword' });
        });

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(result.success).toBe(false);
        expect(result.error).toBe(errorMessage);
    });

    it('should handle logout', async () => {
        // Login dulu
        const mockUser = { id: 1, username: 'admin', full_name: 'Admin User', role: 'admin' };
        api.login.mockResolvedValue({ user: mockUser });
        await act(async () => {
            await useAuthStore.getState().login({ username: 'admin', password: 'password' });
        });

        // Pastikan sudah login
        expect(useAuthStore.getState().isAuthenticated).toBe(true);

        // Lakukan logout
        act(() => {
            useAuthStore.getState().logout();
        });

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });
});
