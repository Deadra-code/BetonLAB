// Lokasi file: src/features/Auth/UserManagementPage.jsx
// Deskripsi: Halaman untuk mengelola pengguna (CRUD), hanya untuk admin.

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import * as api from '../../api/electronAPI';
import { useNotifier } from '../../hooks/useNotifier';
import { SecureDeleteDialog } from '../../components/ui/SecureDeleteDialog';

const AddUserDialog = ({ onUserAdded }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('teknisi');
    const { notify } = useNotifier();

    const handleSave = async () => {
        if (!username || !password || !fullName) {
            notify.error("Semua field harus diisi.");
            return;
        }
        try {
            await api.addUser({ username, password, fullName, role });
            notify.success("Pengguna baru berhasil ditambahkan.");
            onUserAdded();
            setIsOpen(false);
            setUsername(''); setPassword(''); setFullName(''); setRole('teknisi');
        } catch (error) {
            notify.error(`Gagal: ${error.message}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label>Nama Pengguna</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Label>Kata Sandi</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Label>Nama Lengkap</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <Label>Peran</Label>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="teknisi">Teknisi</SelectItem>
                            <SelectItem value="penyelia">Penyelia</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function UserManagementPage({ apiReady, currentUser }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotifier();

    const fetchUsers = async () => {
        if (!apiReady) return;
        setLoading(true);
        try {
            const userList = await api.getUsers();
            setUsers(userList);
        } catch (error) {
            notify.error("Gagal memuat daftar pengguna.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [apiReady]);

    const handleDeleteUser = async (id) => {
        try {
            await api.deleteUser(id);
            notify.success("Pengguna berhasil dihapus.");
            fetchUsers();
        } catch (error) {
            notify.error(`Gagal menghapus: ${error.message}`);
        }
    };
    
    if (currentUser?.role !== 'admin') {
        return <div className="p-8 text-center text-destructive">Akses Ditolak. Halaman ini hanya untuk Administrator.</div>
    }

    return (
        <div className="p-6 lg:p-8 h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
                <AddUserDialog onUserAdded={fetchUsers} />
            </header>
            
            <div className="flex-grow overflow-y-auto border rounded-lg">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Pengguna</TableHead>
                                <TableHead>Nama Lengkap</TableHead>
                                <TableHead>Peran</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.full_name}</TableCell>
                                    <TableCell className="capitalize">{user.role}</TableCell>
                                    <TableCell className="text-right">
                                        <SecureDeleteDialog
                                            trigger={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={user.id === 1}><Trash2 size={16} /></Button>}
                                            title="Hapus Pengguna?"
                                            description={`Anda yakin ingin menghapus pengguna "${user.username}"? Aksi ini tidak dapat dibatalkan.`}
                                            confirmationText="HAPUS"
                                            onConfirm={() => handleDeleteUser(user.id)}
                                        />
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
