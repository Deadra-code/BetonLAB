// Lokasi file: src/hooks/useNotifier.js

import { toast } from 'react-hot-toast';
import { useMemo } from 'react'; // Import useMemo

/**
 * A custom hook to provide a simple and consistent notification API.
 * @returns {{notify: {success: function(message: string), error: function(message: string), info: function(message: string, options?: object)}}}
 */
export const useNotifier = () => {
    // PERBAIKAN: Menggunakan useMemo untuk memastikan objek 'notify' stabil
    // dan tidak dibuat ulang pada setiap render, sehingga mencegah infinite loop.
    const notify = useMemo(() => ({
        /**
         * Displays a success toast notification.
         * @param {string} message - The message to display.
         */
        success: (message) => {
            toast.success(message);
        },
        /**
         * Displays an error toast notification.
         * @param {string} message - The message to display.
         */
        error: (message) => {
            toast.error(message);
        },
        /**
         * Displays an informational toast notification.
         * @param {string} message - The message to display.
         * @param {object} [options] - Optional settings for the toast.
         */
        info: (message, options) => {
            toast(message, {
                ...options,
                icon: '🔔',
            });
        }
    }), []); // Dependency array kosong berarti objek hanya dibuat sekali.

    return { notify };
};
