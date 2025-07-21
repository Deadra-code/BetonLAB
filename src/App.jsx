// src/App.jsx
// Implementasi: Rancangan #6 - Dasbor Berbasis Tindakan
// Deskripsi: Menambahkan state management untuk dialog edit benda uji global.
// Ini memungkinkan notifikasi di dasbor untuk langsung membuka form input hasil.

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Beaker, FolderKanban, Settings, LayoutDashboard, BookOpen, FileSignature, Bell, AlertTriangle, LogOut, UserCog, Calculator, TestTube, Warehouse } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import ProjectManager from './features/Projects/ProjectManager.jsx';
import MaterialTestingManager from './features/MaterialTesting/MaterialTestingManager.jsx';
import SettingsPage from './features/Settings/SettingsPage.jsx';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger } from './components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Badge } from './components/ui/badge';
import ToasterProvider from './components/ui/ToasterProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import TrialMixView from './features/Projects/TrialMixView.jsx';
import Dashboard from './features/Dashboard/Dashboard.jsx';
import TrialComparisonView from './features/Projects/TrialComparisonView.jsx';
import GlobalSearch from './components/GlobalSearch.jsx';
import { useNotifications } from './hooks/useNotifications';
import ReferenceLibraryManager from './features/ReferenceLibrary/ReferenceLibraryManager.jsx';
import ReportBuilderPage from './features/Reporting/ReportBuilderPage.jsx';
import AppTour from './features/Onboarding/AppTour.jsx';
import { useAuthStore } from './hooks/useAuth.js';
import LoginPage from './features/Auth/LoginPage.jsx';
import UserManagementPage from './features/Auth/UserManagementPage.jsx';
import FormulaManagerPage from './features/Formulas/FormulaManagerPage.jsx';
import SampleReceptionPage from './features/SampleManagement/SampleReceptionPage.jsx';
import MyTasksPage from './features/SampleManagement/MyTasksPage.jsx';
import EquipmentManagerPage from './features/Equipment/EquipmentManagerPage.jsx';
import { SpecimenForm } from './features/Projects/CompressiveStrengthTest.jsx';
import { useConcreteTests } from './hooks/useConcreteTests.js';
import * as api from './api/electronAPI';

const NotificationBell = ({ notifications, onNotificationClick }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                            {notifications.length}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2"><h4 className="font-medium leading-none">Notifikasi</h4><p className="text-sm text-muted-foreground">Pengingat pengujian benda uji yang akan datang.</p></div>
                    <div className="grid gap-2">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} onClick={() => onNotificationClick(notif.context)} className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer">{notif.message}</div>
                            ))
                        ) : (<p className="text-sm text-muted-foreground text-center py-4">Tidak ada notifikasi baru.</p>)}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default function App() {
    const [apiReady, setApiReady] = useState(false);
    const [mainView, setMainView] = useState('dashboard');
    const [activeTrial, setActiveTrial] = useState(null);
    const [comparisonTrials, setComparisonTrials] = useState([]);
    const [reportBuilderContext, setReportBuilderContext] = useState(null);
    const [isTourRunning, setIsTourRunning] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // --- RANCANGAN #6: State untuk dialog edit global ---
    const [editingSpecimen, setEditingSpecimen] = useState(null);
    const { updateTest, refreshTestsForTrial } = useConcreteTests(editingSpecimen?.trial_id);
    
    const { isAuthenticated, user, logout } = useAuthStore();
    const { settings, handleUpdateSetting, handleSelectLogo, handleBackupDatabase, handleRestoreDatabase } = useSettings(apiReady);
    const { notifications } = useNotifications(apiReady);

    useEffect(() => {
        const handleApiReady = () => setApiReady(true);
        if (window.api) handleApiReady();
        else window.addEventListener('api-ready', handleApiReady, { once: true });
        return () => window.removeEventListener('api-ready', handleApiReady);
    }, []);

    const navigateTo = (view, context = {}) => {
        setMainView(view);
        setActiveTrial(null);
        setComparisonTrials([]);
        setReportBuilderContext(null);
        handleUpdateSetting('lastActiveView', view);
    };
    
    const handleTrialSelect = (trial) => { setActiveTrial(trial); setComparisonTrials([]); };
    const handleCompareTrials = (trials) => { setComparisonTrials(trials); setActiveTrial(null); };
    const handleReturnToManager = () => { setActiveTrial(null); setComparisonTrials([]); };
    const handleNavigateToReportBuilder = (context) => { setReportBuilderContext(context); setMainView('report-builder'); };
    const handleNavigateToReception = (projectId, trialId) => { navigateTo('sample-reception', { projectId, trialId }); };
    
    // --- RANCANGAN #6: Handler untuk membuka dialog dari dasbor ---
    const handleEditSpecimenFromDashboard = async (specimenId) => {
        // Kita perlu mengambil data lengkap benda uji karena notifikasi hanya berisi ID
        const allTrials = await api.getAllTrials();
        for (const trial of allTrials) {
            const tests = await api.getTestsForTrial(trial.id);
            const foundTest = tests.find(t => t.id === specimenId);
            if (foundTest) {
                setEditingSpecimen({
                    ...foundTest,
                    input_data: JSON.parse(foundTest.input_data_json || '{}'),
                    result_data: JSON.parse(foundTest.result_data_json || '{}'),
                });
                return;
            }
        }
    };

    const handleGlobalNavigate = (item, type) => {
        if (type === 'project') { navigateTo('projects', { initialProject: item }); } 
        else if (type === 'trial') { navigateTo('projects'); setPendingNavigation({ type: 'trial', item }); } 
        else if (type === 'material') { navigateTo('materials'); }
    };

    const handleTourEnd = () => { handleUpdateSetting('hasCompletedTour', true); setIsTourRunning(false); };
    const startTour = () => { navigateTo('dashboard'); setTimeout(() => setIsTourRunning(true), 100); };

    const renderMainContent = () => {
        if (activeTrial && mainView === 'projects') {
            return <TrialMixView trial={activeTrial} onBack={handleReturnToManager} apiReady={apiReady} onNavigateToReportBuilder={handleNavigateToReportBuilder} onNavigateToReception={handleNavigateToReception} />;
        }
        if (comparisonTrials.length > 0 && mainView === 'projects') {
            return <TrialComparisonView trials={comparisonTrials} onBack={handleReturnToManager} />;
        }
        
        switch (mainView) {
            case 'dashboard': return <Dashboard apiReady={apiReady} onNavigate={navigateTo} onProjectSelect={(p) => navigateTo('projects', { initialProject: p })} notifications={notifications} onEditSpecimen={handleEditSpecimenFromDashboard} />;
            case 'projects': return <ProjectManager apiReady={apiReady} onTrialSelect={handleTrialSelect} onCompareTrials={handleCompareTrials} onNavigateToReportBuilder={handleNavigateToReportBuilder} pendingNavigation={pendingNavigation} onPendingNavigationConsumed={() => setPendingNavigation(null)} />;
            case 'materials': return <MaterialTestingManager apiReady={apiReady} />;
            case 'sample-reception': return <SampleReceptionPage apiReady={apiReady} />;
            case 'my-tasks': return <MyTasksPage apiReady={apiReady} />;
            case 'equipment': return <EquipmentManagerPage apiReady={apiReady} />;
            case 'references': return <ReferenceLibraryManager apiReady={apiReady} />;
            case 'report-builder': return <ReportBuilderPage context={reportBuilderContext} apiReady={apiReady} />;
            case 'user-management': return <UserManagementPage apiReady={apiReady} currentUser={user} />;
            case 'formulas': return <FormulaManagerPage apiReady={apiReady} />;
            default: return <Dashboard apiReady={apiReady} onNavigate={navigateTo} onProjectSelect={(p) => navigateTo('projects', { initialProject: p })} notifications={notifications} onEditSpecimen={handleEditSpecimenFromDashboard} />;
        }
    };

    if (!apiReady) { return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground"><Loader2 className="h-8 w-8 animate-spin mr-3" />Memuat Aplikasi...</div>; }
    if (!isAuthenticated) { return (<div className={`flex h-screen font-sans ${settings.theme || 'light'}`}><ToasterProvider /><LoginPage /></div>); }

    return (
        <TooltipProvider delayDuration={0}>
            <ToasterProvider />
            <AppTour run={isTourRunning} onTourEnd={handleTourEnd} />
            <div className={`flex h-screen font-sans overflow-hidden ${settings.theme}`}>
                <div className="flex h-full w-full bg-background text-foreground">
                    <nav className="w-20 border-r bg-card p-4 flex flex-col items-center flex-shrink-0">
                        <div className="mb-8"><img src={settings.logoPath ? `data:image/png;base64,${settings.logoBase64}` : 'https://placehold.co/40x40/e2e8f0/303030?text=BL'} alt="Logo" className="w-10 h-10 object-contain rounded-lg"/></div>
                        <div className="space-y-3 flex flex-col items-center">
                            <Tooltip><TooltipTrigger asChild><Button className="nav-dashboard" variant={mainView === 'dashboard' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('dashboard')}><LayoutDashboard className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Dashboard</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'my-tasks' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('my-tasks')}><TestTube className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Tugas Saya</TooltipContent></Tooltip>
                            {(user.role === 'admin' || user.role === 'penyelia') && <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'sample-reception' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('sample-reception')}><Warehouse className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Penerimaan Sampel</TooltipContent></Tooltip>}
                            <Tooltip><TooltipTrigger asChild><Button className="nav-projects" variant={mainView === 'projects' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('projects')}><FolderKanban className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Proyek</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button className="nav-materials" variant={mainView === 'materials' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('materials')}><Beaker className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Pengujian Material</TooltipContent></Tooltip>
                            {(user.role === 'admin' || user.role === 'penyelia') && <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'equipment' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('equipment')}><Settings className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Peralatan</TooltipContent></Tooltip>}
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'references' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('references')}><BookOpen className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Pustaka Referensi</TooltipContent></Tooltip>
                            {user.role === 'admin' && <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'formulas' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('formulas')}><Calculator className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Rumus</TooltipContent></Tooltip>}
                        </div>
                        <div className="mt-auto flex flex-col items-center space-y-2">
                             {user.role === 'admin' && <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'user-management' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('user-management')}><UserCog className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Pengguna</TooltipContent></Tooltip>}
                             <Dialog><Tooltip><TooltipTrigger asChild><DialogTrigger asChild><Button variant='ghost' size="icon" className="relative"><Settings className="h-5 w-5"/>{settings.lastBackupDate && new Date(settings.lastBackupDate) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (<div className="absolute top-1 right-1"><AlertTriangle className="h-3 w-3 text-yellow-500 fill-yellow-500" /></div>)}</Button></DialogTrigger></TooltipTrigger><TooltipContent side="right">Pengaturan</TooltipContent></Tooltip><DialogContent className="max-w-4xl"><SettingsPage settings={settings} onUpdate={handleUpdateSetting} onSelectLogo={handleSelectLogo} onBackup={handleBackupDatabase} onRestore={handleRestoreDatabase} onStartTour={startTour}/></DialogContent></Dialog>
                             <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={logout}><LogOut className="h-5 w-5 text-destructive"/></Button></TooltipTrigger><TooltipContent side="right">Keluar</TooltipContent></Tooltip>
                        </div>
                    </nav>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="flex-shrink-0 h-16 bg-card border-b flex items-center justify-between px-6">
                           <GlobalSearch onNavigate={handleGlobalNavigate} />
                           <div className="flex items-center gap-4">
                               <div className="text-right"><p className="text-sm font-semibold">{user.full_name}</p><p className="text-xs text-muted-foreground capitalize">{user.role}</p></div>
                               <NotificationBell notifications={notifications} onNotificationClick={(context) => navigateTo('projects', { pendingNavigation: context })} />
                           </div>
                        </header>
                        <main className="flex-grow overflow-y-auto"><ErrorBoundary>{renderMainContent()}</ErrorBoundary></main>
                    </div>
                </div>
            </div>
            
            {/* --- RANCANGAN #6: Dialog Edit Global --- */}
            {editingSpecimen && (
                <SpecimenForm 
                    onSave={async (data) => {
                        const success = await updateTest(data);
                        if(success) {
                           setEditingSpecimen(null);
                           // Jika kita berada di halaman tugas, refresh
                           if(mainView === 'my-tasks') {
                               // Ini memerlukan cara untuk memicu refresh di MyTasksPage
                           }
                        }
                        return success;
                    }}
                    isEditing={true} 
                    initialData={editingSpecimen}
                    apiReady={apiReady}
                    // Prop khusus untuk mengontrol dialog dari luar
                    externalOpen={!!editingSpecimen}
                    onExternalClose={() => setEditingSpecimen(null)}
                />
            )}
        </TooltipProvider>
    );
}
