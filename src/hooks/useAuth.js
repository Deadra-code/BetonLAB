// Lokasi file: src/hooks/useAuth.js
// Deskripsi: Hook baru menggunakan Zustand untuk state management otentikasi global.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as api from '../api/electronAPI';

// Membuat store Zustand dengan middleware 'persist' untuk menyimpan state
// di sessionStorage, sehingga state hilang saat tab ditutup (keamanan).
export const useAuthStore = create(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null, // Akan berisi { id, username, full_name, role }
            
            // Aksi untuk login
            login: async (credentials) => {
                try {
                    const { user } = await api.login(credentials);
                    set({ isAuthenticated: true, user: user });
                    return { success: true };
                } catch (error) {
                    console.error("Login failed:", error);
                    return { success: false, error: error.message };
                }
            },
            
            // Aksi untuk logout
            logout: () => {
                set({ isAuthenticated: false, user: null });
            },
        }),
        {
            name: 'auth-storage', // nama item di storage
            storage: createJSONStorage(() => sessionStorage), // menggunakan sessionStorage
        }
    )
);
