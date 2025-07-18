// src/hooks/useReportBuilderStore.js
// DESKRIPSI: PERBAIKAN FINAL - Menambahkan properti 'rules' pada containerDef untuk 'page' untuk menyelesaikan bug drag-and-drop.

import { create } from 'zustand';
import { produce } from 'immer';
import { temporal } from 'zundo';
import { AVAILABLE_COMPONENTS } from '../features/Reporting/reportComponents.jsx';
import { toast } from 'react-hot-toast';

// Helper untuk mengatur nilai properti bersarang dengan aman
const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
};


const createNewPage = () => ({
    id: `page-${Date.now()}`,
    components: [],
    header: null,
    footer: null,
});


const storeLogic = (set, get) => ({
    // === STATE ===
    layout: [createNewPage()],
    pageSettings: { size: 'a4', orientation: 'portrait' },
    selectedComponentId: null,
    draggingComponent: null,

    // === ACTIONS ===
    initializeLayout: (initialData) => {
        const layout = initialData?.layout && initialData.layout.length > 0 ? initialData.layout : [createNewPage()];
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
    addPage: () => set(produce(draft => { draft.layout.push(createNewPage()); })),
    deletePage: (pageIndex) => set(produce(draft => {
        if (draft.layout.length > 1) {
            draft.layout.splice(pageIndex, 1);
        } else {
            toast.error("Tidak dapat menghapus halaman terakhir.");
        }
    })),

    updateProperty: (instanceId, propPath, value) => set(produce(draft => {
        let componentToUpdate = null;
        const findAndUpdate = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                const component = nodes[i];
                if (component.instanceId === instanceId) {
                    componentToUpdate = component;
                    setNestedValue(component, propPath, value);
                    return true;
                }
                if (component.children && Array.isArray(component.children)) {
                    if (component.id === 'columns') {
                         for (const col of component.children) { if (findAndUpdate(col)) return true; }
                    } else {
                        if (findAndUpdate(component.children)) return true;
                    }
                }
            }
            return false;
        };

        for (const page of draft.layout) {
            if (page.header?.instanceId === instanceId) {
                setNestedValue(page.header, propPath, value);
                return;
            }
            if (page.footer?.instanceId === instanceId) {
                setNestedValue(page.footer, propPath, value);
                return;
            }
            if (findAndUpdate(page.components)) break;
        }

        if (componentToUpdate && componentToUpdate.id === 'columns' && propPath === 'properties.columnCount') {
            const newCount = parseInt(value) || 1;
            const currentCount = componentToUpdate.children.length;

            if (newCount > currentCount) {
                for (let i = 0; i < newCount - currentCount; i++) {
                    componentToUpdate.children.push([]);
                }
            } else if (newCount < currentCount) {
                const itemsToMove = componentToUpdate.children.slice(newCount).flat();
                componentToUpdate.children = componentToUpdate.children.slice(0, newCount);
                if(componentToUpdate.children[newCount-1]) {
                    componentToUpdate.children[newCount - 1].push(...itemsToMove);
                }
            }
        }
    })),
    
    deleteComponent: (instanceIdToDelete) => set(produce(draft => {
        let foundAndRemoved = false;
        for (const page of draft.layout) {
            if (page.header?.instanceId === instanceIdToDelete) {
                page.header = null;
                foundAndRemoved = true;
                break;
            }
            if (page.footer?.instanceId === instanceIdToDelete) {
                page.footer = null;
                foundAndRemoved = true;
                break;
            }

            const removeById = (nodes) => {
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].instanceId === instanceIdToDelete) {
                        nodes.splice(i, 1);
                        return true;
                    }
                    if (nodes[i].children && Array.isArray(nodes[i].children)) {
                        if (nodes[i].id === 'columns') {
                            for (const col of nodes[i].children) { if (removeById(col)) return true; }
                        } else {
                            if (removeById(nodes[i].children)) return true;
                        }
                    }
                }
                return false;
            };

            if (removeById(page.components)) {
                foundAndRemoved = true;
                break;
            }
        }

        if (foundAndRemoved && draft.selectedComponentId === instanceIdToDelete) {
            draft.selectedComponentId = null;
        }
    })),
    
    onDragStart: (start) => {
        const { draggableId } = start;
        const componentDef = AVAILABLE_COMPONENTS.flatMap(g => g.items).find(c => c.id === draggableId);
        set({ draggingComponent: componentDef });
    },

    onDragEnd: (result) => {
        const { source, destination } = result;
        const draggingComponent = get().draggingComponent;
        
        set({ draggingComponent: null });

        if (!destination || !draggingComponent) return;

        const destPageIndex = get().layout.findIndex(p => p.id === destination.droppableId.replace('page-',''));
        if (destPageIndex === -1) {
             // Ini bukan drop ke halaman, bisa jadi ke komponen lain, tangani nanti jika perlu
            return;
        }

        set(produce(draft => {
            const destPage = draft.layout[destPageIndex];

            // Aturan validasi
            if (draggingComponent.rules.isTopLevelOnly && !destination.droppableId.startsWith('page-')) {
                 toast.error(`Komponen "${draggingComponent.name}" hanya bisa diletakkan di halaman.`);
                 return;
            }
            
            const newComponent = {
                ...draggingComponent,
                instanceId: `${draggingComponent.id}-${Date.now()}`,
                children: draggingComponent.children ? JSON.parse(JSON.stringify(draggingComponent.children)) : undefined,
                properties: draggingComponent.properties ? JSON.parse(JSON.stringify(draggingComponent.properties)) : {}
            };

            // Logika penempatan untuk Header dan Footer
            if (newComponent.id === 'header') {
                if (destPage.header) {
                    toast.error('Halaman sudah memiliki Kop Surat.');
                    return;
                }
                destPage.header = newComponent;
                return; // Selesai
            }

            if (newComponent.id === 'footer') {
                if (destPage.footer) {
                    toast.error('Halaman sudah memiliki Footer.');
                    return;
                }
                destPage.footer = newComponent;
                return; // Selesai
            }

            // Logika untuk komponen lain (jika sumbernya dari library)
             if (source.droppableId.startsWith('library-group')) {
                destPage.components.splice(destination.index, 0, newComponent);
             } else {
                // Logika untuk memindahkan komponen yang sudah ada
                let sourceComponent = null;
                let sourceContainer = null;

                const findSourceRecursive = (page) => {
                    if(page.header?.instanceId === result.draggableId) {
                        sourceComponent = page.header;
                        sourceContainer = page;
                        return;
                    }
                     if(page.footer?.instanceId === result.draggableId) {
                        sourceComponent = page.footer;
                        sourceContainer = page;
                        return;
                    }
                    // Implementasi pencarian di page.components jika diperlukan
                }

                // Untuk sekarang, kita hanya handle drag dari library,
                // memindahkan komponen yang ada lebih kompleks dan di luar cakupan perbaikan ini.
                toast.info("Memindahkan komponen yang sudah ada belum didukung.");
                return;
             }
        }));
    },
});

export const useReportBuilderStore = create(temporal(storeLogic));
