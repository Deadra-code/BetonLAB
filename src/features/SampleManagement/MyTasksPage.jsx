// Lokasi file: src/features/SampleManagement/MyTasksPage.jsx
// Deskripsi: Halaman baru untuk Teknisi melihat daftar tugas pengujian mereka.

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../hooks/useAuth';
import * as api from '../../api/electronAPI';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { SpecimenForm } from '../Projects/CompressiveStrengthTest'; // Impor SpecimenForm
import { useConcreteTests } from '../../hooks/useConcreteTests'; // Impor hook untuk update

export default function MyTasksPage({ apiReady }) {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const { updateTest } = useConcreteTests(null); // trialId null, karena kita hanya butuh fungsi update

    const fetchTasks = async () => {
        if (!apiReady || !user) return;
        setLoading(true);
        try {
            const taskList = await api.getMyTasks(user.id);
            const parsedList = taskList.map(task => ({
                ...task,
                input_data: JSON.parse(task.input_data_json || '{}'),
                result_data: JSON.parse(task.result_data_json || '{}'),
            }));
            setTasks(parsedList);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [apiReady, user]);

    const handleTestUpdated = () => {
        fetchTasks(); // Refresh daftar tugas setelah satu tugas selesai/diupdate
    };

    const getStatusBadge = (test) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const testDate = new Date(test.testing_date).setHours(0, 0, 0, 0);
        if (today > testDate) {
            return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Terlambat</Badge>;
        }
        if (today === testDate) {
            return <Badge variant="warning"><AlertCircle className="mr-1 h-3 w-3" /> Siap Uji</Badge>;
        }
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Dalam Perawatan</Badge>;
    };

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-3xl font-bold">Daftar Tugas Saya</h1>
                <p className="text-muted-foreground">Berikut adalah semua benda uji yang ditugaskan kepada Anda.</p>
            </header>
            <div className="flex-grow overflow-y-auto border rounded-lg">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>ID Lab</TableHead>
                                <TableHead>Proyek</TableHead>
                                <TableHead>Trial Mix</TableHead>
                                <TableHead>Tanggal Uji</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell>{getStatusBadge(task)}</TableCell>
                                    <TableCell className="font-medium">{task.lab_id}</TableCell>
                                    <TableCell>{task.projectName}</TableCell>
                                    <TableCell>{task.trial_name}</TableCell>
                                    <TableCell>{new Date(task.testing_date).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="text-right">
                                        <SpecimenForm onSave={async (data) => {
                                            const success = await updateTest(data);
                                            if (success) handleTestUpdated();
                                            return success;
                                        }} isEditing={true} initialData={task} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
