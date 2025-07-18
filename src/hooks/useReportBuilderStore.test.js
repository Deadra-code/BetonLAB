// Lokasi file: src/hooks/useReportBuilderStore.test.js
// Deskripsi: Unit test otomatis untuk memvalidasi logika drag-and-drop di Report Builder.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useReportBuilderStore } from './useReportBuilderStore';
import { toast } from 'react-hot-toast';

// Mock modul toast untuk memeriksa notifikasi error
vi.mock('react-hot-toast');

// Helper untuk membuat hasil drag-and-drop
const createDragResult = (source, destination) => ({ source, destination });

describe('useReportBuilderStore - onDragEnd Validation', () => {

    beforeEach(() => {
        // Reset store ke state awal sebelum setiap tes
        act(() => {
            useReportBuilderStore.getState().initializeLayout();
        });
        vi.clearAllMocks();
    });

    it('should allow dropping a valid component into a page', () => {
        const { getState } = useReportBuilderStore;
        
        // Mulai drag komponen 'custom-text'
        act(() => getState().onDragStart({ draggableId: 'custom-text' }));
        
        // Selesaikan drag ke halaman 0, posisi 0
        const result = createDragResult({ droppableId: 'library-group-2', index: 0 }, { droppableId: 'page-0', index: 0 });
        act(() => getState().onDragEnd(result));

        expect(getState().layout[0]).toHaveLength(1);
        expect(getState().layout[0][0].id).toBe('custom-text');
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('should prevent dropping a top-level-only component (Header) into a nested container (Columns)', () => {
        const { getState } = useReportBuilderStore;

        // Setup: Tambahkan komponen kolom ke layout
        act(() => getState().onDragStart({ draggableId: 'columns' }));
        const addColumnsResult = createDragResult({ droppableId: 'library-group-0', index: 1 }, { droppableId: 'page-0', index: 0 });
        act(() => getState().onDragEnd(addColumnsResult));
        
        const columnsInstanceId = getState().layout[0][0].instanceId;

        // Mulai drag komponen 'header'
        act(() => getState().onDragStart({ draggableId: 'header' }));
        
        // Coba letakkan 'header' di dalam kolom
        const result = createDragResult({ droppableId: 'library-group-1', index: 1 }, { droppableId: `${columnsInstanceId}-col-0`, index: 0 });
        act(() => getState().onDragEnd(result));

        // Verifikasi
        expect(getState().layout[0][0].children[0]).toHaveLength(0); // Kolom harus tetap kosong
        expect(toast.error).toHaveBeenCalledWith('Komponen "Kop Surat" hanya dapat diletakkan langsung di halaman.');
    });

    it('should prevent dropping a component that violates an invalidChildren rule (e.g., Loop in Loop)', () => {
        const { getState } = useReportBuilderStore;

        // Setup: Tambahkan Loop Trial
        act(() => getState().onDragStart({ draggableId: 'trial-loop' }));
        const addLoopResult = createDragResult({ droppableId: 'library-group-1', index: 0 }, { droppableId: 'page-0', index: 0 });
        act(() => getState().onDragEnd(addLoopResult));

        const loopInstanceId = getState().layout[0][0].instanceId;

        // Mulai drag Loop Trial lain
        act(() => getState().onDragStart({ draggableId: 'trial-loop' }));

        // Coba letakkan di dalam loop yang sudah ada
        const result = createDragResult({ droppableId: 'library-group-1', index: 0 }, { droppableId: `loop-${loopInstanceId}`, index: 0 });
        act(() => getState().onDragEnd(result));
        
        // Verifikasi
        expect(getState().layout[0][0].children).toHaveLength(0); // Loop harus tetap kosong
        expect(toast.error).toHaveBeenCalledWith('"Loop Trial" tidak dapat berisi komponen "Loop Trial".');
    });

    it('should prevent dropping a second Header onto a page (maxInstancesPerPage rule)', () => {
        const { getState } = useReportBuilderStore;

        // Setup: Tambahkan Header pertama
        act(() => getState().onDragStart({ draggableId: 'header' }));
        const addHeader1Result = createDragResult({ droppableId: 'library-group-1', index: 1 }, { droppableId: 'page-0', index: 0 });
        act(() => getState().onDragEnd(addHeader1Result));

        expect(getState().layout[0]).toHaveLength(1);

        // Mulai drag Header kedua
        act(() => getState().onDragStart({ draggableId: 'header' }));

        // Coba letakkan Header kedua di halaman yang sama
        const addHeader2Result = createDragResult({ droppableId: 'library-group-1', index: 1 }, { droppableId: 'page-0', index: 1 });
        act(() => getState().onDragEnd(addHeader2Result));

        // Verifikasi
        expect(getState().layout[0]).toHaveLength(1); // Jumlah komponen tidak boleh bertambah
        expect(toast.error).toHaveBeenCalledWith('Hanya boleh ada 1 komponen "Kop Surat" per halaman.');
    });

    it('should correctly reorder components within the same page', () => {
        const { getState } = useReportBuilderStore;

        // Setup: Tambahkan dua komponen
        act(() => getState().onDragStart({ draggableId: 'custom-text' }));
        act(() => getState().onDragEnd(createDragResult({ droppableId: 'library-group-2', index: 0 }, { droppableId: 'page-0', index: 0 })));
        act(() => getState().onDragStart({ draggableId: 'horizontal-line' }));
        act(() => getState().onDragEnd(createDragResult({ droppableId: 'library-group-0', index: 2 }, { droppableId: 'page-0', index: 1 })));

        expect(getState().layout[0][0].id).toBe('custom-text');
        expect(getState().layout[0][1].id).toBe('horizontal-line');

        // Pindahkan komponen pertama ke posisi kedua
        act(() => getState().onDragStart({ draggableId: 'custom-text' })); // Tidak perlu karena store tidak menggunakannya untuk reorder
        const reorderResult = createDragResult({ droppableId: 'page-0', index: 0 }, { droppableId: 'page-0', index: 1 });
        act(() => getState().onDragEnd(reorderResult));

        // Verifikasi
        expect(getState().layout[0]).toHaveLength(2);
        expect(getState().layout[0][0].id).toBe('horizontal-line');
        expect(getState().layout[0][1].id).toBe('custom-text');
        expect(toast.error).not.toHaveBeenCalled();
    });
});
