// Lokasi file: src/features/Settings/SettingsPage.js
// Deskripsi: Versi lengkap dengan tombol untuk memulai ulang tur aplikasi.

import React, { useState, useEffect } from 'react';
import { UploadCloud, DatabaseBackup, DatabaseZap, Info, Loader2, PlayCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import * as api from '../../api/electronAPI';

const AboutDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [appInfo, setAppInfo] = useState({ name: '', version: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = async () => {
        setIsLoading(true);
        try {
            const info = await api.getAppInfo();
            setAppInfo(info);
        } catch (error) {
            console.error("Failed to get app info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={handleOpen}>
                    <Info size={16} className="mr-2" />
                    Tentang Aplikasi & Changelog
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tentang {appInfo.name || 'BetonLAB'}</DialogTitle>
                    <DialogDescription>
                        Versi {appInfo.version || 'N/A'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <div>
                            <h4 className="font-semibold mb-2">Changelog (v{appInfo.version})</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li>Implementasi fitur catatan pada setiap trial mix.</li>
                                <li>Peningkatan validasi input pada form pengujian.</li>
                                <li>Peningkatan UX: Indikator loading pada tombol & empty state yang lebih baik.</li>
                                <li>Penambahan fitur "Tentang Aplikasi" dan changelog.</li>
                                <li>Perbaikan minor pada backend dan database handling.</li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-6">
                                BetonLAB dikembangkan untuk membantu para profesional beton dalam mengelola data dan perhitungan.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


const SettingsPage = ({ settings, onUpdate, onSelectLogo, onBackup, onRestore, onStartTour }) => {
    return (
        <>
            <DialogHeader>
                <DialogTitle>Pengaturan Aplikasi</DialogTitle>
                <DialogDescription>
                    Atur preferensi aplikasi, informasi lab, dan manajemen data.
                </DialogDescription>
            </DialogHeader>
            <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Lab/Perusahaan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="companyName">Nama Lab/Perusahaan</Label>
                                <Input 
                                    type="text" 
                                    id="companyName" 
                                    value={settings.companyName || ''} 
                                    onChange={(e) => onUpdate('companyName', e.target.value)} 
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={settings.logoPath ? `data:image/png;base64,${settings.logoBase64}` : 'https://placehold.co/100x100/e2e8f0/e2e8f0?text='} 
                                        alt="Logo" 
                                        className="w-20 h-20 object-contain bg-muted rounded-md border" 
                                    />
                                    <Button onClick={onSelectLogo} variant="outline">
                                        <UploadCloud size={16} className="mr-2"/>Pilih File
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Bantuan & Panduan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={onStartTour} className="w-full" variant="secondary">
                                <PlayCircle size={16} className="mr-2" />
                                Mulai Ulang Tur Aplikasi
                            </Button>
                             <AboutDialog />
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Manajemen Data</CardTitle>
                            <CardDescription>
                                Cadangkan data Anda secara berkala untuk mencegah kehilangan data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={onBackup} className="w-full">
                                <DatabaseBackup size={16} className="mr-2" />
                                Backup Data Sekarang
                            </Button>
                             <Button onClick={onRestore} variant="destructive" className="w-full">
                                <DatabaseZap size={16} className="mr-2" />
                                Restore Data dari Backup
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Tampilan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dark-mode" className="font-medium">
                                    Tema Gelap (Dark Mode)
                                </Label>
                                <Switch
                                    id="dark-mode"
                                    checked={settings.theme === 'dark'}
                                    onCheckedChange={(checked) => onUpdate('theme', checked ? 'dark' : 'light')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;