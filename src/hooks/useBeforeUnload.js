// src/hooks/useBeforeUnload.js
// Deskripsi: Hook kustom untuk menampilkan dialog konfirmasi browser
// jika pengguna mencoba meninggalkan halaman dengan perubahan yang belum disimpan.

import { useEffect, useRef } from 'react';

export const useBeforeUnload = (isDirty, message = 'Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?') => {
    const messageRef = useRef(message);

    useEffect(() => {
        messageRef.current = message;
    }, [message]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                // Standar untuk browser modern
                event.returnValue = messageRef.current;
                return messageRef.current;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);
};
