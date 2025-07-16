// Lokasi file: src/App.jsx
// Deskripsi: Rombak total untuk mengintegrasikan alur otentikasi.
// Aplikasi sekarang akan menampilkan halaman Login jika pengguna belum terotentikasi.

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Beaker, FolderKanban, Settings, LayoutDashboard, BookOpen, FileSignature, Bell, AlertTriangle, LogOut, UserCog } from 'lucide-react';
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

// --- Impor untuk Otentikasi ---
import { useAuthStore } from './hooks/useAuth.js';
import LoginPage from './features/Auth/LoginPage.jsx';
import UserManagementPage from './features/Auth/UserManagementPage.jsx';

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
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifikasi</h4>
                        <p className="text-sm text-muted-foreground">
                            Pengingat pengujian benda uji yang akan datang.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => onNotificationClick(notif.context)}
                                    className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer"
                                >
                                    {notif.message}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Tidak ada notifikasi baru.</p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};


export default function App() {
    const [apiReady, setApiReady] = useState(false);
    const [mainView, setMainView] = useState('dashboard');
    const [activeProject, setActiveProject] = useState(null);
    const [activeTrial, setActiveTrial] = useState(null);
    const [isInitialStateLoaded, setIsInitialStateLoaded] = useState(false);
    const [comparisonTrials, setComparisonTrials] = useState([]);
    const [reportBuilderContext, setReportBuilderContext] = useState(null);
    const [isTourRunning, setIsTourRunning] = useState(false);
    
    // PERBAIKAN: State untuk menangani navigasi yang tertunda
    const [pendingNavigation, setPendingNavigation] = useState(null);

    const { isAuthenticated, user, logout } = useAuthStore();

    const { settings, handleUpdateSetting, handleSelectLogo, handleBackupDatabase, handleRestoreDatabase } = useSettings(apiReady);
    const { notifications } = useNotifications(apiReady);

    const needsBackupWarning = useMemo(() => {
        if (!settings.lastBackupDate) return true;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(settings.lastBackupDate) < thirtyDaysAgo;
    }, [settings.lastBackupDate]);

    useEffect(() => {
        const handleApiReady = () => setApiReady(true);
        if (window.api) handleApiReady();
        else window.addEventListener('api-ready', handleApiReady, { once: true });
        return () => window.removeEventListener('api-ready', handleApiReady);
    }, []);

    useEffect(() => {
        if (settings && !isInitialStateLoaded && isAuthenticated) {
            const lastView = settings.lastActiveView || 'dashboard';
            setMainView(lastView);
            if (!settings.hasCompletedTour) {
                setIsTourRunning(true);
            }
            setIsInitialStateLoaded(true);
        }
    }, [settings, isInitialStateLoaded, isAuthenticated]);
    
    const navigateTo = (view) => {
        setMainView(view);
        setActiveProject(null);
        setActiveTrial(null);
        setComparisonTrials([]);
        setReportBuilderContext(null);
        handleUpdateSetting('lastActiveView', view);
        handleUpdateSetting('lastActiveTrial', '');
    };
    
    const handleProjectSelect = (project) => {
        setActiveProject(project);
        navigateTo('projects');
    };

    const handleTrialSelect = (trial) => {
        setActiveTrial(trial);
        setComparisonTrials([]);
        handleUpdateSetting('lastActiveTrial', JSON.stringify(trial));
    };
    
    const handleNotificationClick = (context) => {
        navigateTo('projects');
        setPendingNavigation(context);
    };

    const handleCompareTrials = (trials) => { setComparisonTrials(trials); setActiveTrial(null); handleUpdateSetting('lastActiveTrial', ''); };
    const handleReturnToManager = () => { setActiveTrial(null); setComparisonTrials([]); handleUpdateSetting('lastActiveTrial', ''); };
    const handleNavigateToReportBuilder = (context) => { setReportBuilderContext(context); setMainView('report-builder'); handleUpdateSetting('lastActiveView', 'report-builder'); };
    
    const handleGlobalNavigate = (item, type) => {
        if (type === 'project') {
            handleProjectSelect(item);
        } else if (type === 'trial') {
            // PERBAIKAN: Gunakan state 'pendingNavigation' daripada setTimeout
            navigateTo('projects');
            setPendingNavigation({ type: 'trial', item });
        } else if (type === 'material') {
            navigateTo('materials');
        }
    };

    const handleTourEnd = () => {
        handleUpdateSetting('hasCompletedTour', true);
        setIsTourRunning(false);
    };

    const startTour = () => {
        navigateTo('dashboard');
        setTimeout(() => setIsTourRunning(true), 100);
    };

    const renderMainContent = () => {
        if (activeTrial && mainView === 'projects') {
            return <TrialMixView trial={activeTrial} onBack={handleReturnToManager} apiReady={apiReady} onNavigateToReportBuilder={handleNavigateToReportBuilder} />;
        }
        if (comparisonTrials.length > 0 && mainView === 'projects') {
            return <TrialComparisonView trials={comparisonTrials} onBack={handleReturnToManager} />;
        }
        
        switch (mainView) {
            case 'dashboard':
                return <Dashboard apiReady={apiReady} onNavigate={navigateTo} onProjectSelect={handleProjectSelect} />;
            case 'projects':
                // PERBAIKAN: Teruskan props untuk pending navigation
                return <ProjectManager 
                            apiReady={apiReady} 
                            onTrialSelect={handleTrialSelect} 
                            onCompareTrials={handleCompareTrials} 
                            onNavigateToReportBuilder={handleNavigateToReportBuilder} 
                            initialProject={activeProject} 
                            pendingNavigation={pendingNavigation} 
                            onPendingNavigationConsumed={() => setPendingNavigation(null)} 
                        />;
            case 'materials':
                return <MaterialTestingManager apiReady={apiReady} />;
            case 'references':
                return <ReferenceLibraryManager apiReady={apiReady} />;
            case 'report-builder':
                return <ReportBuilderPage context={reportBuilderContext} apiReady={apiReady} />;
            case 'user-management':
                return <UserManagementPage apiReady={apiReady} currentUser={user} />;
            default:
                return <Dashboard apiReady={apiReady} onNavigate={navigateTo} onProjectSelect={handleProjectSelect} />;
        }
    };

    if (!apiReady) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground"><Loader2 className="h-8 w-8 animate-spin mr-3" />Memuat Aplikasi...</div>;
    }
    
    if (!isAuthenticated) {
        return (
             <div className={`flex h-screen font-sans ${settings.theme || 'light'}`}>
                <ToasterProvider />
                <LoginPage />
             </div>
        )
    }

    return (
        <TooltipProvider delayDuration={0}>
            <ToasterProvider />
            <AppTour run={isTourRunning} onTourEnd={handleTourEnd} />
            <div className={`flex h-screen font-sans ${settings.theme}`}>
                <div className="flex h-full w-full bg-background text-foreground">
                    <nav className="w-20 border-r bg-card p-4 flex flex-col items-center flex-shrink-0">
                        <div className="mb-8"><img src={settings.logoPath ? `data:image/png;base64,${settings.logoBase64}` : 'https://placehold.co/40x40/e2e8f0/303030?text=BL'} alt="Logo" className="w-10 h-10 object-contain rounded-lg"/></div>
                        <div className="space-y-3 flex flex-col items-center">
                            <Tooltip><TooltipTrigger asChild><Button className="nav-dashboard" variant={mainView === 'dashboard' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('dashboard')}><LayoutDashboard className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Dashboard</TooltipContent></Tooltip>
                            { (user.role === 'admin' || user.role === 'penyelia') && <Tooltip><TooltipTrigger asChild><Button className="nav-projects" variant={mainView === 'projects' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('projects')}><FolderKanban className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Proyek</TooltipContent></Tooltip> }
                            <Tooltip><TooltipTrigger asChild><Button className="nav-materials" variant={mainView === 'materials' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('materials')}><Beaker className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Pengujian Material</TooltipContent></Tooltip>
                            { (user.role === 'admin' || user.role === 'penyelia') && <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'report-builder' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('report-builder')}><FileSignature className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Report Builder</TooltipContent></Tooltip> }
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'references' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('references')}><BookOpen className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Pustaka Referensi</TooltipContent></Tooltip>
                        </div>
                        <div className="mt-auto flex flex-col items-center space-y-2">
                             { user.role === 'admin' && <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'user-management' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('user-management')}><UserCog className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Pengguna</TooltipContent></Tooltip> }
                             <Dialog><Tooltip><TooltipTrigger asChild><DialogTrigger asChild>
                                <Button variant='ghost' size="icon" className="relative">
                                    <Settings className="h-5 w-5"/>
                                    {needsBackupWarning && (
                                        <div className="absolute top-1 right-1">
                                            <AlertTriangle className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        </div>
                                    )}
                                </Button>
                             </DialogTrigger></TooltipTrigger><TooltipContent side="right">
                                Pengaturan
                                {needsBackupWarning && <p className="text-yellow-500">Backup data disarankan</p>}
                             </TooltipContent></Tooltip><DialogContent className="max-w-4xl"><SettingsPage settings={settings} onUpdate={handleUpdateSetting} onSelectLogo={handleSelectLogo} onBackup={handleBackupDatabase} onRestore={handleRestoreDatabase} onStartTour={startTour}/></DialogContent></Dialog>
                             <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={logout}><LogOut className="h-5 w-5 text-destructive"/></Button></TooltipTrigger><TooltipContent side="right">Keluar</TooltipContent></Tooltip>
                        </div>
                    </nav>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="flex-shrink-0 h-16 bg-card border-b flex items-center justify-between px-6">
                           <GlobalSearch onNavigate={handleGlobalNavigate} />
                           <div className="flex items-center gap-4">
                               <div className="text-right">
                                   <p className="text-sm font-semibold">{user.full_name}</p>
                                   <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                               </div>
                               <NotificationBell notifications={notifications} onNotificationClick={handleNotificationClick} />
                           </div>
                        </header>
                        <main className="flex-grow overflow-y-auto">
                            <ErrorBoundary>{renderMainContent()}</ErrorBoundary>
                        </main>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
