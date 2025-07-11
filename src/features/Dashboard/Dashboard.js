import React, { useState, useMemo } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useMaterials } from '../../hooks/useMaterials';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Folder, Clock, Beaker, User, FilterX } from 'lucide-react';

// PERUBAHAN: onProjectSelect sekarang akan dipanggil dengan objek proyek lengkap
const RecentProjects = ({ projects, onProjectSelect, title = "Proyek Terakhir Dikerjakan" }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
            <CardTitle className="flex items-center text-lg">
                <Clock className="mr-3 h-5 w-5 text-primary" /> {title}
            </CardTitle>
            {projects.length === 0 && <CardDescription>Tidak ada proyek yang cocok dengan filter.</CardDescription>}
        </CardHeader>
        <CardContent>
            {projects.length > 0 ? (
                <div className="space-y-3">
                    {projects.slice(0, 4).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center">
                                <Folder className="mr-3 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-semibold">{p.projectName}</p>
                                    <p className="text-xs text-muted-foreground flex items-center">
                                        <User className="mr-1.5 h-3 w-3" /> {p.clientName || 'Tanpa Klien'}
                                    </p>
                                </div>
                            </div>
                            {/* PERUBAIKAN: Memanggil onProjectSelect dengan seluruh objek 'p' */}
                            <Button variant="ghost" size="sm" onClick={() => onProjectSelect(p)}>
                                Buka Proyek
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">Belum ada proyek yang dibuat.</p>
            )}
        </CardContent>
    </Card>
);

// Komponen lain tidak berubah
const MaterialLibrarySummary = ({ materials }) => {
    const summary = materials.reduce((acc, mat) => {
        if (mat.material_type === 'fine_aggregate') acc.fine += 1;
        else if (mat.material_type === 'coarse_aggregate') acc.coarse += 1;
        else if (mat.material_type === 'cement') acc.cement += 1;
        return acc;
    }, { fine: 0, coarse: 0, cement: 0 });

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Package className="mr-3 h-5 w-5 text-primary" /> Ringkasan Pustaka Material
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center pt-2">
                <div><p className="text-3xl font-bold">{summary.fine}</p><p className="text-sm font-medium text-muted-foreground">Ag. Halus</p></div>
                <div><p className="text-3xl font-bold">{summary.coarse}</p><p className="text-sm font-medium text-muted-foreground">Ag. Kasar</p></div>
                <div><p className="text-3xl font-bold">{summary.cement}</p><p className="text-sm font-medium text-muted-foreground">Semen</p></div>
            </CardContent>
        </Card>
    );
};

const TrialMixStats = ({ projects, onBarClick }) => {
    const data = useMemo(() => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const monthlyData = projects.reduce((acc, proj) => {
            const monthIndex = new Date(proj.createdAt).getMonth();
            if (!acc[monthIndex]) {
                acc[monthIndex] = { name: monthNames[monthIndex], monthIndex: monthIndex, trials: 0 };
            }
            acc[monthIndex].trials += 1; 
            return acc;
        }, {});
        
        for(let i = 0; i < 12; i++) {
            if (!monthlyData[i]) {
                monthlyData[i] = { name: monthNames[i], monthIndex: i, trials: 0 };
            }
        }
        
        return Object.values(monthlyData).sort((a, b) => a.monthIndex - b.monthIndex);
    }, [projects]);

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <CardHeader>
                <CardTitle className="flex items-center text-lg"><Beaker className="mr-3 h-5 w-5 text-primary" /> Aktivitas Proyek per Bulan</CardTitle>
                <CardDescription>Klik pada bar untuk memfilter proyek di bulan tersebut.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis allowDecimals={false} fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="trials" fill="hsl(var(--primary))" name="Jumlah Proyek" radius={[4, 4, 0, 0]} onClick={onBarClick} cursor="pointer" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// PERUBAHAN: onProjectSelect sekarang menerima objek proyek penuh
export default function Dashboard({ apiReady, onNavigate, onProjectSelect }) {
    const { projects, loading: projectsLoading } = useProjects(apiReady);
    const { materials, loading: materialsLoading } = useMaterials(apiReady);
    const [filterMonth, setFilterMonth] = useState(null);

    const handleBarClick = (data) => {
        if (data && data.monthIndex !== undefined) {
            setFilterMonth(data.monthIndex);
        }
    };
    
    const resetFilter = () => {
        setFilterMonth(null);
    };

    const filteredProjects = useMemo(() => {
        if (filterMonth === null) {
            return projects;
        }
        return projects.filter(p => new Date(p.createdAt).getMonth() === filterMonth);
    }, [projects, filterMonth]);
    
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const filterTitle = filterMonth !== null ? `Proyek di Bulan ${monthNames[filterMonth]}` : "Proyek Terakhir Dikerjakan";

    if (projectsLoading || materialsLoading) {
        return <div className="p-6">Memuat data dashboard...</div>;
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Selamat datang kembali! Berikut adalah ringkasan aktivitas Anda.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <RecentProjects projects={filteredProjects} onProjectSelect={onProjectSelect} title={filterTitle} />
                    {filterMonth !== null && (
                        <Button onClick={resetFilter} variant="outline" className="w-full">
                            <FilterX className="mr-2 h-4 w-4" /> Reset Filter Bulan
                        </Button>
                    )}
                    <MaterialLibrarySummary materials={materials} />
                </div>
                <div>
                    <TrialMixStats projects={projects} onBarClick={handleBarClick} />
                </div>
            </div>
        </div>
    );
}
