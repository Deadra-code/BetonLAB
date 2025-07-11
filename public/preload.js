// Lokasi file: public/preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Projects
    getProjects: (showArchived) => ipcRenderer.invoke('db:get-projects', showArchived),
    addProject: (project) => ipcRenderer.invoke('db:add-project', project),
    updateProject: (project) => ipcRenderer.invoke('db:update-project', project),
    deleteProject: (id) => ipcRenderer.invoke('db:delete-project', id),
    setProjectStatus: (data) => ipcRenderer.invoke('db:set-project-status', data),

    // Trials
    getTrialsForProject: (projectId) => ipcRenderer.invoke('db:get-trials-for-project', projectId),
    addTrial: (trial) => ipcRenderer.invoke('db:add-trial', trial),
    updateTrial: (trial) => ipcRenderer.invoke('db:update-trial', trial),
    deleteTrial: (id) => ipcRenderer.invoke('db:delete-trial', id),

    // Materials
    getMaterials: (showArchived) => ipcRenderer.invoke('db:get-materials', showArchived),
    getMaterialsWithActiveTests: () => ipcRenderer.invoke('db:get-materials-with-active-tests'),
    addMaterial: (material) => ipcRenderer.invoke('db:add-material', material),
    updateMaterial: (material) => ipcRenderer.invoke('db:update-material', material),
    deleteMaterial: (id) => ipcRenderer.invoke('db:delete-material', id),
    setMaterialStatus: (data) => ipcRenderer.invoke('db:set-material-status', data),

    // Material Tests
    getTestsForMaterial: (materialId) => ipcRenderer.invoke('db:get-tests-for-material', materialId),
    addMaterialTest: (test) => ipcRenderer.invoke('db:add-material-test', test),
    setActiveMaterialTest: (ids) => ipcRenderer.invoke('db:set-active-material-test', ids),
    deleteMaterialTest: (id) => ipcRenderer.invoke('db:delete-material-test', id),

    // Concrete Tests
    getTestsForTrial: (trialId) => ipcRenderer.invoke('db:get-tests-for-trial', trialId),
    addConcreteTest: (test) => ipcRenderer.invoke('db:add-concrete-test', test),
    updateConcreteTest: (test) => ipcRenderer.invoke('db:update-concrete-test', test),
    deleteConcreteTest: (id) => ipcRenderer.invoke('db:delete-concrete-test', id),
    
    // Settings & Files
    getSettings: () => ipcRenderer.invoke('settings:get-all'),
    setSetting: (key, value) => ipcRenderer.invoke('settings:set', { key, value }),
    openImageDialog: () => ipcRenderer.invoke('dialog:open-image'),
    openPdfDialog: () => ipcRenderer.invoke('dialog:open-pdf'),
    saveLogoFile: (filePath) => ipcRenderer.invoke('file:save-logo', filePath),
    saveTestImageFile: (filePath) => ipcRenderer.invoke('file:save-test-image', filePath),
    saveReferencePdf: (filePath) => ipcRenderer.invoke('file:save-reference-pdf'),
    readFileAsBase64: (filePath) => ipcRenderer.invoke('file:read-base64', filePath),
    saveCsv: (data) => ipcRenderer.invoke('file:save-csv', data),

    // Logging
    log: (logEntry) => ipcRenderer.send('log:write', logEntry),

    // DB Management
    backupDatabase: () => ipcRenderer.invoke('db:backup'),
    restoreDatabase: () => ipcRenderer.invoke('db:restore'),

    // App Info
    getAppInfo: () => ipcRenderer.invoke('app:get-info'),
    
    // Global Search
    globalSearch: (query) => ipcRenderer.invoke('db:global-search', query),

    // Test Templates
    getTestTemplates: () => ipcRenderer.invoke('db:get-test-templates'),
    addTestTemplate: (template) => ipcRenderer.invoke('db:add-test-template', template),
    deleteTestTemplate: (id) => ipcRenderer.invoke('db:delete-test-template', id),
    
    // Notifications
    getDueSpecimens: () => ipcRenderer.invoke('db:get-due-specimens'),

    // Reference Library
    getReferenceDocuments: () => ipcRenderer.invoke('db:get-reference-documents'),
    addReferenceDocument: (doc) => ipcRenderer.invoke('db:add-reference-document', doc),
    deleteReferenceDocument: (id) => ipcRenderer.invoke('db:delete-reference-document', id),
    openPath: (path) => ipcRenderer.invoke('shell:open-path', path),

    // Reporting
    getFullReportData: (projectId) => ipcRenderer.invoke('report:get-full-data', projectId),

    // Report Templates (v1 - Lama)
    getReportTemplates: () => ipcRenderer.invoke('db:get-report-templates'),
    addReportTemplate: (template) => ipcRenderer.invoke('db:add-report-template', template),
    updateReportTemplate: (template) => ipcRenderer.invoke('db:update-report-template', template),
    deleteReportTemplate: (id) => ipcRenderer.invoke('db:delete-report-template', id),

    // BARU: Report Layouts (v2 - Baru)
    getReportLayouts: () => ipcRenderer.invoke('db:get-report-layouts'),
    addReportLayout: (layout) => ipcRenderer.invoke('db:add-report-layout', layout),
    updateReportLayout: (layout) => ipcRenderer.invoke('db:update-report-layout', layout),
    deleteReportLayout: (id) => ipcRenderer.invoke('db:delete-report-layout', id),
});

window.dispatchEvent(new Event('api-ready'));
