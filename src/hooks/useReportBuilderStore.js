// src/hooks/useReportBuilderStore.js
// DESKRIPSI: Menambahkan logika "rehydration" pada `initializeLayout`.
// Saat layout dimuat dari database, setiap komponen akan digabungkan dengan
// definisi lengkapnya (termasuk properti 'rules') untuk mencegah error.
// PERBAIKAN: Mengganti panggilan `toast.info` yang salah menjadi `toast`.

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
    header: null,
    components: [],
    footer: null,
});

const PAGE_DIMENSIONS = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
};
const PAGE_VERTICAL_MARGIN_MM = 40; 

// ========================================================================
// === FUNGSI BARU: Rehydration Logic ===
// ========================================================================
const rehydrateNode = (node) => {
    if (!node || !node.id) return node;

    const definition = AVAILABLE_COMPONENTS.flatMap(g => g.items).find(c => c.id === node.id);
    if (!definition) {
        console.warn(`Component definition not found for id: ${node.id}`);
        return node;
    }

    // Gabungkan definisi default dengan data instance, data instance lebih diutamakan
    const rehydratedNode = {
        ...definition,
        ...node,
        properties: { ...definition.properties, ...node.properties },
    };

    // Lakukan rehidrasi secara rekursif untuk children
    if (node.children && Array.isArray(node.children)) {
        if (node.id === 'columns') {
            rehydratedNode.children = node.children.map(column => Array.isArray(column) ? column.map(rehydrateNode) : []);
        } else {
            rehydratedNode.children = node.children.map(rehydrateNode);
        }
    }

    return rehydratedNode;
};

const rehydrateLayout = (layoutData) => {
    if (!Array.isArray(layoutData)) return [];
    return layoutData.map(page => ({
        header: page.header ? rehydrateNode(page.header) : null,
        components: Array.isArray(page.components) ? page.components.map(rehydrateNode) : [],
        footer: page.footer ? rehydrateNode(page.footer) : null,
    }));
};


const storeLogic = (set, get) => ({
    // === STATE ===
    layout: [createNewPage()],
    pageSettings: { size: 'a4', orientation: 'portrait' },
    selectedComponentId: null,
    draggingComponent: null,

    // === ACTIONS ===
    initializeLayout: (initialData) => {
        let layoutToProcess = initialData?.layout;
        if (!layoutToProcess || !Array.isArray(layoutToProcess) || layoutToProcess.length === 0 || !layoutToProcess[0].hasOwnProperty('components')) {
             layoutToProcess = [createNewPage()];
        }

        // PERBAIKAN: Panggil fungsi rehidrasi di sini
        const hydratedLayout = rehydrateLayout(layoutToProcess);
        
        const pageSettings = initialData?.pageSettings || { size: 'a4', orientation: 'portrait' };
        
        const temporalState = get().temporal;
        if (temporalState && temporalState.clear) {
            temporalState.clear();
        }

        set({
            layout: hydratedLayout,
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
            draft.layout[0] = createNewPage();
        }
    })),

    updateProperty: (instanceId, propPath, value) => set(produce(draft => {
        let componentToUpdate = null;
        const findAndUpdate = (nodes) => {
            for (let i = 0; i < nodes.length; i++) {
                const component = nodes[i];
                if (!component) continue;
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
            if (page.header && page.header.instanceId === instanceId) {
                setNestedValue(page.header, propPath, value);
                return;
            }
             if (page.footer && page.footer.instanceId === instanceId) {
                setNestedValue(page.footer, propPath, value);
                return;
            }
            if (findAndUpdate(page.components)) return;
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
        for (const page of draft.layout) {
            if (page.header && page.header.instanceId === instanceIdToDelete) page.header = null;
            if (page.footer && page.footer.instanceId === instanceIdToDelete) page.footer = null;
            if (removeById(page.components)) break;
        }
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
            const findContainerInfo = (droppableId, pageIndexHint = -1) => {
                 if (droppableId.startsWith('page-')) {
                    const pageIndex = parseInt(droppableId.split('-')[1]);
                    const pageDef = { id: 'page', name: 'Halaman', rules: { invalidChildren: [] } };
                    return { containerArray: draft.layout[pageIndex].components, containerDef: pageDef, pageIndex };
                }
                
                const searchScope = pageIndexHint !== -1 ? [draft.layout[pageIndexHint]] : draft.layout;
                const pageOffset = pageIndexHint !== -1 ? pageIndexHint : 0;

                for (let i = 0; i < searchScope.length; i++) {
                    const pageIndex = i + pageOffset;
                    const page = searchScope[i];
                    let found = null;

                    if (page.header?.instanceId === droppableId) return { containerArray: [page.header], containerDef: {id: 'header-container'}, pageIndex};
                    if (page.footer?.instanceId === droppableId) return { containerArray: [page.footer], containerDef: {id: 'footer-container'}, pageIndex};

                    const findRecursive = (nodes) => {
                        for (const node of nodes) {
                            if (!node) continue;
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
                    findRecursive(page.components);
                    if (found) return found;
                }
                return { containerArray: null, containerDef: null, pageIndex: -1 };
            };

            const { containerArray: destContainer, containerDef: destContainerDef, pageIndex: destPageIndex } = findContainerInfo(destination.droppableId);

            if (!destContainerDef) return;

            const destType = destContainerDef.id;

            if (draggingComponent.id === 'header' || draggingComponent.id === 'footer') {
                if(destType !== 'page') {
                    toast.error(`Header/Footer hanya bisa diletakkan di halaman.`);
                    return;
                }
            } else {
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
            }
            
            if (draggingComponent.rules.maxInstancesPerPage) {
                const page = draft.layout[destPageIndex];
                let count = page.components.filter(c => c.id === draggingComponent.id).length;
                if (page.header?.id === draggingComponent.id) count++;
                if (page.footer?.id === draggingComponent.id) count++;
                
                if (count >= draggingComponent.rules.maxInstancesPerPage) {
                    toast.error(`Hanya boleh ada ${draggingComponent.rules.maxInstancesPerPage} instance "${draggingComponent.name}" per halaman.`);
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
                 const { containerArray: sourceContainer, pageIndex: sourcePageIndex } = findContainerInfo(source.droppableId);
                if (sourceContainer) {
                    const sourcePage = draft.layout[sourcePageIndex];
                    if(sourcePage.header?.instanceId === source.draggableId) {
                        movedItem = sourcePage.header;
                        sourcePage.header = null;
                    } else if (sourcePage.footer?.instanceId === source.draggableId) {
                        movedItem = sourcePage.footer;
                        sourcePage.footer = null;
                    } else {
                        [movedItem] = sourceContainer.splice(source.index, 1);
                    }
                }
            }

            if (movedItem) {
                const destPage = draft.layout[destPageIndex];
                if (movedItem.id === 'header') {
                    if (destPage.header) {
                        destPage.components.unshift(destPage.header);
                    }
                    destPage.header = movedItem;
                } else if (movedItem.id === 'footer') {
                     if (destPage.footer) {
                        destPage.components.push(destPage.footer);
                    }
                    destPage.footer = movedItem;
                } else {
                    destContainer.splice(destination.index, 0, movedItem);
                }

                const pageSettings = draft.pageSettings;
                const pageDimensions = PAGE_DIMENSIONS[pageSettings.size] || PAGE_DIMENSIONS.a4;
                const maxContentHeight = (pageSettings.orientation === 'portrait' ? pageDimensions.height : pageDimensions.width) - PAGE_VERTICAL_MARGIN_MM;

                const calculatePageHeight = (page) => {
                    let totalHeight = 0;
                    if (page.header) totalHeight += page.header.estimatedHeight || 0;
                    if (page.footer) totalHeight += page.footer.estimatedHeight || 0;
                    totalHeight += page.components.reduce((sum, comp) => sum + (comp.estimatedHeight || 0), 0);
                    return totalHeight;
                };

                let currentPageIndex = destPageIndex;
                let currentPage = draft.layout[currentPageIndex];
                let currentHeight = calculatePageHeight(currentPage);

                if (destContainer === currentPage.components && currentHeight > maxContentHeight) {
                    const overflowingComponent = destContainer.splice(destination.index, 1)[0];
                    let nextPage = draft.layout[currentPageIndex + 1];
                    if (!nextPage) {
                        draft.layout.push(createNewPage());
                        nextPage = draft.layout[currentPageIndex + 1];
                    }
                    nextPage.components.unshift(overflowingComponent);
                    toast(`Konten penuh, komponen dipindahkan ke halaman ${currentPageIndex + 2}.`, { icon: '➡️' });
                }
            }
        }));
    },
});

export const useReportBuilderStore = create(temporal(storeLogic));
