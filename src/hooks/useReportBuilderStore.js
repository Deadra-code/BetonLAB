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


const storeLogic = (set, get) => ({
    // === STATE ===
    layout: [[]],
    pageSettings: { size: 'a4', orientation: 'portrait' },
    selectedComponentId: null,
    draggingComponent: null,

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
        for (const page of draft.layout) { if (findAndUpdate(page)) break; }

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
        for (const page of draft.layout) { if (removeById(page)) break; }
        if (draft.selectedComponentId === instanceIdToDelete) { draft.selectedComponentId = null; }
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

        set(produce(draft => {
            const findContainerInfo = (droppableId) => {
                if (droppableId.startsWith('page-')) {
                    const pageIndex = parseInt(droppableId.split('-')[1]);
                    // PERBAIKAN: Tambahkan properti `rules` ke definisi kontainer halaman.
                    const pageDef = { id: 'page', name: 'Halaman', rules: { invalidChildren: [] } };
                    return { containerArray: draft.layout[pageIndex], containerDef: pageDef, pageIndex };
                }
                
                for (let pageIndex = 0; pageIndex < draft.layout.length; pageIndex++) {
                    const page = draft.layout[pageIndex];
                    let found = null;
                    const findRecursive = (nodes) => {
                        for (const node of nodes) {
                            if (node.instanceId === droppableId) { found = { containerArray: node.children, containerDef: node, pageIndex }; return; }
                            if (node.id === 'trial-loop' && `loop-${node.instanceId}` === droppableId) { found = { containerArray: node.children, containerDef: node, pageIndex }; return; }
                            if (node.id === 'columns' && droppableId.startsWith(node.instanceId)) {
                                const colIndex = parseInt(droppableId.split('-col-')[1]);
                                if (node.children[colIndex]) { found = { containerArray: node.children[colIndex], containerDef: node, pageIndex }; return; }
                            }
                            if (Array.isArray(node.children)) {
                                if (node.id === 'columns') {
                                    for (const col of node.children) { findRecursive(col); if (found) return; }
                                } else {
                                    findRecursive(node.children); if (found) return;
                                }
                            }
                        }
                    };
                    findRecursive(page);
                    if (found) return found;
                }
                return { containerArray: null, containerDef: null, pageIndex: -1 };
            };

            const { containerArray: destContainer, containerDef: destContainerDef, pageIndex: destPageIndex } = findContainerInfo(destination.droppableId);

            if (!destContainer) return;

            const destType = destContainerDef.id === 'columns' ? 'columns' : destContainerDef.id;

            if (!draggingComponent.rules.validParents.includes(destType)) {
                toast.error(`Komponen "${draggingComponent.name}" tidak dapat diletakkan di dalam "${destContainerDef.name}".`);
                return;
            }

            if (destContainerDef.rules?.invalidChildren.includes(draggingComponent.id)) {
                toast.error(`"${destContainerDef.name}" tidak dapat berisi komponen "${draggingComponent.name}".`);
                return;
            }
            
            if (draggingComponent.rules.isTopLevelOnly && destType !== 'page') {
                toast.error(`Komponen "${draggingComponent.name}" hanya dapat diletakkan langsung di halaman.`);
                return;
            }

            if (draggingComponent.rules.maxInstancesPerPage) {
                const page = draft.layout[destPageIndex];
                const count = page.filter(c => c.id === draggingComponent.id).length;
                if (count >= draggingComponent.rules.maxInstancesPerPage) {
                    toast.error(`Hanya boleh ada ${draggingComponent.rules.maxInstancesPerPage} komponen "${draggingComponent.name}" per halaman.`);
                    return;
                }
            }

            let movedItem;
            if (source.droppableId.startsWith('library-group')) {
                const componentToClone = draggingComponent;
                movedItem = { 
                    ...componentToClone, 
                    instanceId: `${componentToClone.id}-${Date.now()}`, 
                    children: componentToClone.children ? JSON.parse(JSON.stringify(componentToClone.children)) : undefined, 
                    properties: componentToClone.properties ? JSON.parse(JSON.stringify(componentToClone.properties)) : {} 
                };
            } else {
                const { containerArray: sourceContainer } = findContainerInfo(source.droppableId);
                if (sourceContainer) {
                    [movedItem] = sourceContainer.splice(source.index, 1);
                }
            }

            if (movedItem) {
                // Logika kustom untuk header dan footer
                const isPageDrop = destContainerDef.id === 'page';
                if (isPageDrop && movedItem.id === 'header') {
                    destContainer.unshift(movedItem);
                } else if (isPageDrop && movedItem.id === 'footer') {
                    destContainer.push(movedItem);
                } else {
                    destContainer.splice(destination.index, 0, movedItem);
                }
            }
        }));
    },
});

export const useReportBuilderStore = create(temporal(storeLogic));
