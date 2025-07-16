// Lokasi file: src/features/Auth/LoginPage.jsx
// Deskripsi: Halaman login untuk otentikasi pengguna.

import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useAuthStore } from '../../hooks/useAuth.js';
import { useNotifier } from '../../hooks/useNotifier';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const { notify } = useNotifier();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            notify.error("Nama pengguna dan kata sandi harus diisi.");
            return;
        }
        setIsLoading(true);
        const result = await login({ username, password });
        if (!result.success) {
            notify.error(result.error || "Login gagal.");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center h-screen w-full bg-muted">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Selamat Datang di BetonLAB</CardTitle>
                    <CardDescription>Silakan masuk untuk melanjutkan</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="username">Nama Pengguna</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password">Kata Sandi</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                            Masuk
                        </Button>
                        <p className="text-xs text-center text-muted-foreground pt-2">
                           Pengguna default: admin | Kata sandi: admin123
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
