// src/hooks/useReportBuilderStore.js
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
    
    // ========================================================================
    // PERBAIKAN LOGIKA DRAG & DROP
    // ========================================================================
    onDragEnd: (result) => {
        const { source, destination } = result;
        if (!destination) return;

        set(produce(draft => {
            const findContainerById = (nodes, droppableId) => {
                for (const node of nodes) {
                    if (node.instanceId === droppableId) return node.children;
                    if (node.id === 'trial-loop' && `loop-${node.instanceId}` === droppableId) return node.children;
                    
                    if (node.id === 'columns' && droppableId.startsWith(node.instanceId)) {
                        const colIndex = parseInt(droppableId.split('-col-')[1]);
                        if (Array.isArray(node.children) && node.children[colIndex] !== undefined) {
                            return node.children[colIndex];
                        }
                    }

                    if (Array.isArray(node.children)) {
                        // For columns, we need to check each column array
                        if (node.id === 'columns') {
                            for (const col of node.children) {
                                const found = findContainerById(col, droppableId);
                                if (found) return found;
                            }
                        } else {
                            const found = findContainerById(node.children, droppableId);
                            if (found) return found;
                        }
                    }
                }
                return null;
            };
            
            const findTargetContainer = (pages, id) => {
                if (id.startsWith('page-')) {
                    const pageIndex = parseInt(id.split('-')[1]);
                    return pages[pageIndex];
                }
                for (const page of pages) {
                    const found = findContainerById(page, id);
                    if (found) return found;
                }
                return null;
            };

            let movedItem;
            if (source.droppableId.startsWith('library-group')) {
                const groupIndex = parseInt(source.droppableId.split('-')[2]);
                const itemIndex = source.index;
                const componentToClone = AVAILABLE_COMPONENTS[groupIndex].items[itemIndex];
                movedItem = { 
                    ...componentToClone, 
                    instanceId: `${componentToClone.id}-${Date.now()}`, 
                    children: componentToClone.children ? JSON.parse(JSON.stringify(componentToClone.children)) : undefined, 
                    properties: componentToClone.properties ? JSON.parse(JSON.stringify(componentToClone.properties)) : {} 
                };
            } else {
                const sourceContainer = findTargetContainer(draft.layout, source.droppableId);
                if (sourceContainer) {
                    [movedItem] = sourceContainer.splice(source.index, 1);
                }
            }

            if (!movedItem) return;

            const destContainer = findTargetContainer(draft.layout, destination.droppableId);
            if (destContainer) {
                destContainer.splice(destination.index, 0, movedItem);
            } else {
                const sourceContainer = findTargetContainer(draft.layout, source.droppableId);
                if (sourceContainer) {
                    sourceContainer.splice(source.index, 0, movedItem);
                }
            }
        }));
    },
});

export const useReportBuilderStore = create(temporal(storeLogic));
