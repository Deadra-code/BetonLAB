// src/features/Formulas/components/FormulaHistoryDialog.jsx
// Deskripsi: Komponen baru untuk menampilkan riwayat perubahan sebuah formula dalam dialog modal.

import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Loader2, History } from 'lucide-react';
import * as api from '../../../api/electronAPI';
import { useNotifier } from '../../../hooks/useNotifier';

export const FormulaHistoryDialog = ({ formulaId, formulaName, trigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotifier();

    useEffect(() => {
        const fetchHistory = async () => {
            if (isOpen && formulaId) {
                setLoading(true);
                try {
                    const historyData = await api.getFormulaHistory(formulaId);
                    setHistory(historyData);
                } catch (error) {
                    notify.error(`Gagal memuat riwayat: ${error.message}`);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchHistory();
    }, [isOpen, formulaId, notify]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Riwayat Perubahan: {formulaName}</DialogTitle>
                    <DialogDescription>
                        Menampilkan semua perubahan yang tercatat untuk formula ini, diurutkan dari yang terbaru.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-96 border rounded-md">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground">
                                <History className="h-12 w-12 mb-4" />
                                <p>Tidak ada riwayat perubahan yang tercatat untuk formula ini.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Tanggal Perubahan</TableHead>
                                        <TableHead className="w-[180px]">Diubah Oleh</TableHead>
                                        <TableHead>Nilai Sebelumnya</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                {new Date(entry.changed_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </TableCell>
                                            <TableCell>{entry.changed_by_user || 'Sistem'}</TableCell>
                                            <TableCell>
                                                <pre className="whitespace-pre-wrap bg-muted/50 p-2 rounded-sm text-xs font-mono">
                                                    <code>{entry.old_value}</code>
                                                </pre>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tutup</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
