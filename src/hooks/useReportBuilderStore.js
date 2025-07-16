// Lokasi file: src/hooks/useReportBuilderStore.js
// Deskripsi: Perbaikan kritis pada fungsi updateProperty untuk menangani properti bersarang.

import { create } from 'zustand';
import { produce } from 'immer';
import { temporal } from 'zundo';
import { AVAILABLE_COMPONENTS } from '../features/Reporting/reportComponents.jsx';

// Helper untuk mengatur nilai properti bersarang dengan aman
const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        // Buat objek baru jika path tidak ada
        if (current[key] === undefined || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
};


const storeLogic = (set, get) => ({
    // === STATE ===
    layout: [[]],
    pageSettings: { size: 'a4', orientation: 'portrait' },
    selectedComponentId: null,

    // === ACTIONS ===
    initializeLayout: (initialData) => {
        const layout = initialData?.layout || [[]];
        const pageSettings = initialData?.pageSettings || { size: 'a4', orientation: 'portrait' };
        
        const temporalState = get().temporal;
        if (temporalState && temporalState.clear) {
            temporalState.clear();
        }

        set({
            layout: layout,
            pageSettings: pageSettings,
            selectedComponentId: null,
        });
    },

    setSelectedComponentId: (id) => set({ selectedComponentId: id }),
    updatePageSettings: (key, value) => set(produce(draft => { draft.pageSettings[key] = value; })),
    addPage: () => set(produce(draft => { draft.layout.push([]); })),
    deletePage: (pageIndex) => set(produce(draft => {
        if (draft.layout.length > 1) {
            draft.layout.splice(pageIndex, 1);
        } else {
            draft.layout[0] = [];
        }
    })),

    // PERBAIKAN KUNCI: Menggunakan helper 'setNestedValue'
    updateProperty: (instanceId, propPath, value) => set(produce(draft => {
        const findAndUpdate = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                const component = nodes[i];
                if (component.instanceId === instanceId) {
                    setNestedValue(component, propPath, value);
                    return true;
                }
                if (component.children && Array.isArray(component.children)) {
                    if (component.id.startsWith('columns-')) {
                        for (const col of component.children) { if (findAndUpdate(col)) return true; }
                    } else {
                        if (findAndUpdate(component.children)) return true;
                    }
                }
            }
            return false;
        };
        for (const page of draft.layout) { if (findAndUpdate(page)) break; }
    })),
    
    deleteComponent: (instanceIdToDelete) => set(produce(draft => {
        const removeById = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].instanceId === instanceIdToDelete) {
                    nodes.splice(i, 1);
                    return true;
                }
                if (nodes[i].children && Array.isArray(nodes[i].children)) {
                    if (nodes[i].id.startsWith('columns-')) {
                        for (const col of nodes[i].children) { if (removeById(col)) return true; }
                    } else {
                        if (removeById(nodes[i].children)) return true;
                    }
                }
            }
            return false;
        };
        for (const page of draft.layout) { if (removeById(page)) break; }
        if (draft.selectedComponentId === instanceIdToDelete) { draft.selectedComponentId = null; }
    })),
    onDragEnd: (result) => {
        const { source, destination } = result;
        if (!destination) return;
        set(produce(draft => {
            const findContainer = (nodes, id) => {
                for (const node of nodes) {
                    if (node.instanceId === id && Array.isArray(node.children)) return node.children;
                    if (node.id === 'trial-loop' && `loop-${node.instanceId}` === id) return node.children;
                    if (node.id.startsWith('columns-') && id.startsWith(node.instanceId)) {
                        const colIndex = parseInt(id.split('-col-')[1]);
                        return node.children[colIndex];
                    }
                    if (node.children && Array.isArray(node.children)) {
                        if (node.id.startsWith('columns-')) {
                            for (const col of node.children) { const found = findContainer(col, id); if (found) return found; }
                        } else {
                            const found = findContainer(node.children, id); if (found) return found;
                        }
                    }
                }
                return null;
            };
            const findTopLevel = (pages, id) => {
                if (id.startsWith('page-')) return pages[parseInt(id.split('-')[1])];
                for (const page of pages) { const found = findContainer(page, id); if (found) return found; }
                return null;
            };
            let movedItem;
            if (source.droppableId.startsWith('library-group')) {
                const groupIndex = parseInt(source.droppableId.split('-')[2]);
                const itemIndex = source.index;
                const componentToClone = AVAILABLE_COMPONENTS[groupIndex].items[itemIndex];
                movedItem = { ...componentToClone, instanceId: `${componentToClone.id}-${Date.now()}`, children: componentToClone.children ? JSON.parse(JSON.stringify(componentToClone.children)) : undefined, properties: {} };
            } else {
                const sourceContainer = findTopLevel(draft.layout, source.droppableId);
                if (sourceContainer) [movedItem] = sourceContainer.splice(source.index, 1);
            }
            if (!movedItem) return;
            const destContainer = findTopLevel(draft.layout, destination.droppableId);
            if (destContainer) destContainer.splice(destination.index, 0, movedItem);
        }));
    },
});

export const useReportBuilderStore = create(temporal(storeLogic));
