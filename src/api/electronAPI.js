// Lokasi file: src/api/electronAPI.js
// Deskripsi: Menambahkan fungsi pembungkus untuk API manajemen peralatan.

const isApiReady = () => {
    if (window.api) return true;
    console.warn("Electron API (window.api) is not ready yet.");
    return false;
};

// Auth & Users
export const login = (credentials) => isApiReady() ? window.api.login(credentials) : Promise.reject(new Error("API not ready"));
export const getUsers = () => isApiReady() ? window.api.getUsers() : Promise.resolve([]);
export const addUser = (userData) => isApiReady() ? window.api.addUser(userData) : Promise.reject(new Error("API not ready"));
export const deleteUser = (id) => isApiReady() ? window.api.deleteUser(id) : Promise.reject(new Error("API not ready"));

// Sample Management
export const createSampleReception = (data) => isApiReady() ? window.api.createSampleReception(data) : Promise.reject(new Error("API not ready"));
export const getMyTasks = (technicianId) => isApiReady() ? window.api.getMyTasks(technicianId) : Promise.resolve([]);

// TAHAP 2: Equipment & Specimen Log API
export const getEquipment = () => isApiReady() ? window.api.getEquipment() : Promise.resolve([]);
export const addEquipment = (equipment) => isApiReady() ? window.api.addEquipment(equipment) : Promise.reject(new Error("API not ready"));
export const updateEquipment = (equipment) => isApiReady() ? window.api.updateEquipment(equipment) : Promise.reject(new Error("API not ready"));
export const deleteEquipment = (id) => isApiReady() ? window.api.deleteEquipment(id) : Promise.reject(new Error("API not ready"));
export const getSpecimenLog = (concreteTestId) => isApiReady() ? window.api.getSpecimenLog(concreteTestId) : Promise.resolve([]);

// Projects
export const getProjects = (showArchived) => isApiReady() ? window.api.getProjects(showArchived) : Promise.resolve([]);
export const addProject = (project) => isApiReady() ? window.api.addProject(project) : Promise.reject(new Error("API not ready"));
export const updateProject = (project) => isApiReady() ? window.api.updateProject(project) : Promise.reject(new Error("API not ready"));
export const deleteProject = (id) => isApiReady() ? window.api.deleteProject(id) : Promise.reject(new Error("API not ready"));
export const setProjectStatus = (data) => isApiReady() ? window.api.setProjectStatus(data) : Promise.reject(new Error("API not ready"));
export const duplicateProject = (id) => isApiReady() ? window.api.duplicateProject(id) : Promise.reject(new Error("API not ready"));
export const getProjectStatusCounts = () => isApiReady() ? window.api.getProjectStatusCounts() : Promise.resolve({ active: 0, archived: 0 });

// ... sisa API tetap sama ...
export const getTrialsForProject = (projectId) => isApiReady() ? window.api.getTrialsForProject(projectId) : Promise.resolve([]);
export const getAllTrials = () => isApiReady() ? window.api.getAllTrials() : Promise.resolve([]);
export const addTrial = (trial) => isApiReady() ? window.api.addTrial(trial) : Promise.reject(new Error("API not ready"));
export const updateTrial = (trial) => isApiReady() ? window.api.updateTrial(trial) : Promise.reject(new Error("API not ready"));
export const deleteTrial = (id) => isApiReady() ? window.api.deleteTrial(id) : Promise.reject(new Error("API not ready"));
export const getMaterials = (showArchived) => isApiReady() ? window.api.getMaterials(showArchived) : Promise.resolve([]);
export const getMaterialsWithActiveTests = () => isApiReady() ? window.api.getMaterialsWithActiveTests() : Promise.resolve([]);
export const addMaterial = (material) => isApiReady() ? window.api.addMaterial(material) : Promise.reject(new Error("API not ready"));
export const updateMaterial = (material) => isApiReady() ? window.api.updateMaterial(material) : Promise.reject(new Error("API not ready"));
export const deleteMaterial = (id) => isApiReady() ? window.api.deleteMaterial(id) : Promise.reject(new Error("API not ready"));
export const setMaterialStatus = (data) => isApiReady() ? window.api.setMaterialStatus(data) : Promise.reject(new Error("API not ready"));
export const getTestsForMaterial = (materialId) => isApiReady() ? window.api.getTestsForMaterial(materialId) : Promise.resolve([]);
export const addMaterialTest = (test) => isApiReady() ? window.api.addMaterialTest(test) : Promise.reject(new Error("API not ready"));
export const setActiveMaterialTest = (ids) => isApiReady() ? window.api.setActiveMaterialTest(ids) : Promise.reject(new Error("API not ready"));
export const deleteMaterialTest = (id) => isApiReady() ? window.api.deleteMaterialTest(id) : Promise.reject(new Error("API not ready"));
export const getTestsForTrial = (trialId) => isApiReady() ? window.api.getTestsForTrial(trialId) : Promise.resolve([]);
export const addConcreteTest = (test) => isApiReady() ? window.api.addConcreteTest(test) : Promise.reject(new Error("API not ready"));
export const updateConcreteTest = (test) => isApiReady() ? window.api.updateConcreteTest(test) : Promise.reject(new Error("API not ready"));
export const deleteConcreteTest = (id) => isApiReady() ? window.api.deleteConcreteTest(id) : Promise.reject(new Error("API not ready"));
export const getSettings = () => isApiReady() ? window.api.getSettings() : Promise.resolve({});
export const setSetting = (key, value) => isApiReady() ? window.api.setSetting(key, value) : Promise.reject(new Error("API not ready"));
export const openImageDialog = () => isApiReady() ? window.api.openImageDialog() : Promise.resolve(null);
export const openPdfDialog = () => isApiReady() ? window.api.openPdfDialog() : Promise.resolve(null);
export const saveLogoFile = (filePath) => isApiReady() ? window.api.saveLogoFile(filePath) : Promise.reject(new Error("API not ready"));
export const saveTestImageFile = (filePath) => isApiReady() ? window.api.saveTestImageFile(filePath) : Promise.reject(new Error("API not ready"));
export const saveReferencePdf = (filePath) => isApiReady() ? window.api.saveReferencePdf(filePath) : Promise.reject(new Error("API not ready"));
export const saveRequestLetter = (filePath) => isApiReady() ? window.api.saveRequestLetter(filePath) : Promise.reject(new Error("API not ready"));
export const readFileAsBase64 = (filePath) => isApiReady() ? window.api.readFileAsBase64(filePath) : Promise.resolve(null);
export const saveCsv = (data) => isApiReady() ? window.api.saveCsv(data) : Promise.reject(new Error("API not ready"));
export const saveReportAsset = (filePath) => isApiReady() ? window.api.saveReportAsset(filePath) : Promise.reject(new Error("API not ready"));
export const listReportAssets = () => isApiReady() ? window.api.listReportAssets() : Promise.resolve([]);
export const deleteReportAsset = (filePath) => isApiReady() ? window.api.deleteReportAsset(filePath) : Promise.reject(new Error("API not ready"));
export const writeLog = (level, message) => { if (isApiReady()) { window.api.log({ level, message }); } };
export const backupDatabase = () => isApiReady() ? window.api.backupDatabase() : Promise.reject(new Error("API not ready"));
export const restoreDatabase = () => isApiReady() ? window.api.restoreDatabase() : Promise.reject(new Error("API not ready"));
export const getAppInfo = () => isApiReady() ? window.api.getAppInfo() : Promise.resolve({});
export const globalSearch = (query) => isApiReady() ? window.api.globalSearch(query) : Promise.resolve({ projects: [], trials: [], materials: [] });
export const getTestTemplates = () => isApiReady() ? window.api.getTestTemplates() : Promise.resolve([]);
export const addTestTemplate = (template) => isApiReady() ? window.api.addTestTemplate(template) : Promise.reject(new Error("API not ready"));
export const deleteTestTemplate = (id) => isApiReady() ? window.api.deleteTestTemplate(id) : Promise.reject(new Error("API not ready"));
export const getDueSpecimens = () => isApiReady() ? window.api.getDueSpecimens() : Promise.resolve([]);
export const getReferenceDocuments = () => isApiReady() ? window.api.getReferenceDocuments() : Promise.resolve([]);
export const addReferenceDocument = (doc) => isApiReady() ? window.api.addReferenceDocument(doc) : Promise.reject(new Error("API not ready"));
export const deleteReferenceDocument = (id) => isApiReady() ? window.api.deleteReferenceDocument(id) : Promise.reject(new Error("API not ready"));
export const openPath = (path) => isApiReady() ? window.api.openPath(path) : Promise.reject(new Error("API not ready"));
export const getFullReportData = (projectId) => isApiReady() ? window.api.getFullReportData(projectId) : Promise.reject(new Error("API not ready"));
export const getReportLayouts = () => isApiReady() ? window.api.getReportLayouts() : Promise.resolve([]);
export const addReportLayout = (layout) => isApiReady() ? window.api.addReportLayout(layout) : Promise.reject(new Error("API not ready"));
export const updateReportLayout = (layout) => isApiReady() ? window.api.updateReportLayout(layout) : Promise.reject(new Error("API not ready"));
export const deleteReportLayout = (id) => isApiReady() ? window.api.deleteReportLayout(id) : Promise.reject(new Error("API not ready"));
