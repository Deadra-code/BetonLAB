import React, { useState, useEffect } from 'react';
import { Loader2, Beaker, FolderKanban, Settings, LayoutDashboard, BookOpen, FileSignature, Bell } from 'lucide-react'; // Bell ditambahkan
import { useSettings } from './hooks/useSettings';
import ProjectManager from './features/Projects/ProjectManager';
import MaterialTestingManager from './features/MaterialTesting/MaterialTestingManager';
import SettingsPage from './features/Settings/SettingsPage.js';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger } from './components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover'; // Popover ditambahkan
import { Badge } from './components/ui/badge'; // Badge ditambahkan
import ToasterProvider from './components/ui/ToasterProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import TrialMixView from './features/Projects/TrialMixView';
import Dashboard from './features/Dashboard/Dashboard';
import TrialComparisonView from './features/Projects/TrialComparisonView';
import GlobalSearch from './components/GlobalSearch';
import { useNotifications } from './hooks/useNotifications';
import ReferenceLibraryManager from './features/ReferenceLibrary/ReferenceLibraryManager';
import ReportBuilderPage from './features/Reporting/ReportBuilderPage';

// BARU: Komponen untuk bel notifikasi
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
    const [pendingNavigation, setPendingNavigation] = useState(null); // Untuk notifikasi

    const { settings, handleUpdateSetting, handleSelectLogo, handleBackupDatabase, handleRestoreDatabase } = useSettings(apiReady);
    const { notifications } = useNotifications(apiReady);

    useEffect(() => {
        const handleApiReady = () => setApiReady(true);
        if (window.api) handleApiReady();
        else window.addEventListener('api-ready', handleApiReady, { once: true });
        return () => window.removeEventListener('api-ready', handleApiReady);
    }, []);

    useEffect(() => {
        if (settings && !isInitialStateLoaded) {
            const lastView = settings.lastActiveView || 'dashboard';
            setMainView(lastView);
            setIsInitialStateLoaded(true);
        }
    }, [settings, isInitialStateLoaded]);
    
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
    
    // BARU: Logika untuk menangani klik notifikasi
    const handleNotificationClick = (context) => {
        navigateTo('projects');
        // Simpan konteks navigasi, akan dieksekusi oleh ProjectManager
        setPendingNavigation(context);
    };

    // ... fungsi lain tetap sama ...
    const handleCompareTrials = (trials) => { setComparisonTrials(trials); setActiveTrial(null); handleUpdateSetting('lastActiveTrial', ''); };
    const handleReturnToManager = () => { setActiveTrial(null); setComparisonTrials([]); handleUpdateSetting('lastActiveTrial', ''); };
    const handleNavigateToReportBuilder = (context) => { setReportBuilderContext(context); setMainView('report-builder'); handleUpdateSetting('lastActiveView', 'report-builder'); };
    const handleGlobalNavigate = (item, type) => {
        if (type === 'project') { handleProjectSelect(item); } 
        else if (type === 'trial') { navigateTo('projects'); setTimeout(() => { setActiveProject(item); handleTrialSelect({ ...item, design_input: JSON.parse(item.design_input_json || '{}'), design_result: JSON.parse(item.design_result_json || '{}') }); }, 100); } 
        else if (type === 'material') { navigateTo('materials'); }
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
                return <ProjectManager apiReady={apiReady} onTrialSelect={handleTrialSelect} onCompareTrials={handleCompareTrials} onNavigateToReportBuilder={handleNavigateToReportBuilder} initialProject={activeProject} pendingNavigation={pendingNavigation} onPendingNavigationConsumed={() => setPendingNavigation(null)} />;
            case 'materials':
                return <MaterialTestingManager apiReady={apiReady} />;
            case 'references':
                return <ReferenceLibraryManager apiReady={apiReady} />;
            case 'report-builder':
                return <ReportBuilderPage context={reportBuilderContext} apiReady={apiReady} />;
            default:
                return <Dashboard apiReady={apiReady} onNavigate={navigateTo} onProjectSelect={handleProjectSelect} />;
        }
    };

    if (!apiReady || !isInitialStateLoaded) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground"><Loader2 className="h-8 w-8 animate-spin mr-3" />Memuat Aplikasi...</div>;
    }

    return (
        <TooltipProvider delayDuration={0}>
            <ToasterProvider />
            <div className={`flex h-screen font-sans ${settings.theme}`}>
                <div className="flex h-full w-full bg-background text-foreground">
                    <nav className="w-20 border-r bg-card p-4 flex flex-col items-center flex-shrink-0">
                        <div className="mb-8"><img src={settings.logoPath ? `file://${settings.logoPath}` : 'https://placehold.co/40x40/e2e8f0/303030?text=BL'} alt="Logo" className="w-10 h-10 object-contain rounded-lg"/></div>
                        <div className="space-y-3 flex flex-col items-center">
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'dashboard' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('dashboard')}><LayoutDashboard className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Dashboard</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'projects' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('projects')}><FolderKanban className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Manajemen Proyek</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'materials' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('materials')}><Beaker className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Pengujian Material</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'report-builder' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('report-builder')}><FileSignature className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Report Builder</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant={mainView === 'references' ? 'secondary' : 'ghost'} size="icon" onClick={() => navigateTo('references')}><BookOpen className="h-5 w-5"/></Button></TooltipTrigger><TooltipContent side="right">Pustaka Referensi</TooltipContent></Tooltip>
                        </div>
                        <div className="mt-auto flex flex-col items-center">
                             <Dialog><Tooltip><TooltipTrigger asChild><DialogTrigger asChild><Button variant='ghost' size="icon"><Settings className="h-5 w-5"/></Button></DialogTrigger></TooltipTrigger><TooltipContent side="right">Pengaturan</TooltipContent></Tooltip><DialogContent className="max-w-4xl"><SettingsPage settings={settings} onUpdate={handleUpdateSetting} onSelectLogo={handleSelectLogo} onBackup={handleBackupDatabase} onRestore={handleRestoreDatabase}/></DialogContent></Dialog>
                        </div>
                    </nav>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="flex-shrink-0 h-16 bg-card border-b flex items-center justify-between px-6">
                           <GlobalSearch onNavigate={handleGlobalNavigate} />
                           <NotificationBell notifications={notifications} onNotificationClick={handleNotificationClick} />
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
