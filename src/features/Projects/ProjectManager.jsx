// Lokasi file: src/features/Projects/ProjectManager.jsx
// Deskripsi: Versi yang telah dimodularisasi. Komponen-komponen UI kini diimpor dari direktori terpisah.

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { PlusCircle, Folder, Search } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useProjects } from '../../hooks/useProjects';
import { SkeletonList } from '../../components/ui/SkeletonCard.jsx';
import { ProjectForm } from './components/ProjectForm';
import { ProjectItem } from './components/ProjectItem';

export default function ProjectManager({ apiReady, onTrialSelect, onCompareTrials, onNavigateToReportBuilder, initialProject, pendingNavigation, onPendingNavigationConsumed }) {
    const { projects, addProject, updateProject, deleteProject, loading, showArchived, setShowArchived, setProjectStatus, duplicateProject } = useProjects(apiReady);
    const [searchQuery, setSearchQuery] = useState('');
    const [openProjectId, setOpenProjectId] = useState(null);

    useEffect(() => {
        if (pendingNavigation) {
            const { type, item } = pendingNavigation;
            if (type === 'trial') {
                setOpenProjectId(item.project_id);
                setTimeout(() => {
                    const fullTrialData = {
                        ...item,
                        design_input: JSON.parse(item.design_input_json || '{}'),
                        design_result: JSON.parse(item.design_result_json || '{}'),
                    };
                    onTrialSelect(fullTrialData);
                    onPendingNavigationConsumed();
                }, 100);
            } else if (type === 'project') {
                 setOpenProjectId(item.id);
                 onPendingNavigationConsumed();
            }
        }
    }, [pendingNavigation, onTrialSelect, onPendingNavigationConsumed]);
    
    useEffect(() => {
        if (initialProject) {
            setOpenProjectId(initialProject.id);
        }
    }, [initialProject]);

    const filteredProjects = useMemo(() => {
        if (!searchQuery) return projects;
        return projects.filter(p =>
            p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    return (
        <div className="flex h-full bg-muted/30">
            <aside className="w-[450px] border-r p-4 bg-card flex flex-col flex-shrink-0">
                <div className="flex-shrink-0">
                    <h2 className="text-xl font-bold mb-4 px-2">Manajemen Proyek</h2>
                    <div className="px-2 mb-4 space-y-3">
                        <ProjectForm project={{ projectName: '', clientName: '' }} onSave={addProject}>
                            <Button className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Proyek Baru</Button>
                        </ProjectForm>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari proyek atau klien..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                            <Label htmlFor="show-archived">Tampilkan Proyek yang Diarsipkan</Label>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-grow min-h-0">
                    {loading ? (
                        <SkeletonList count={5} />
                    ) : filteredProjects.length > 0 ? (
                        filteredProjects.map(proj => (
                            <ProjectItem
                                key={proj.id}
                                project={proj}
                                onSelectTrial={onTrialSelect}
                                onCompareTrials={onCompareTrials}
                                onNavigateToReportBuilder={onNavigateToReportBuilder}
                                onUpdateProject={updateProject}
                                onDeleteProject={deleteProject}
                                onDuplicateProject={duplicateProject}
                                onSetProjectStatus={setProjectStatus}
                                initialOpen={proj.id === openProjectId}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Tidak ada proyek ditemukan.</p>
                        </div>
                    )}
                </ScrollArea>
            </aside>

            <main className="flex-grow bg-background flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <Folder size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Selamat Datang di Manajemen Proyek</h3>
                    <p>Buka sebuah proyek dan pilih trial dari daftar di samping untuk memulai.</p>
                </div>
            </main>
        </div>
    );
}
