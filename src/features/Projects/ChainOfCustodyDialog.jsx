// Lokasi file: src/features/Projects/ChainOfCustodyDialog.jsx
// Deskripsi: Dialog untuk menampilkan riwayat (chain of custody) dari sebuah benda uji.

import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Loader2, History } from 'lucide-react';
import * as api from '../../api/electronAPI';

export default function ChainOfCustodyDialog({ concreteTestId, trigger }) {
    const [isOpen, setIsOpen] = useState(false);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLog = async () => {
            if (isOpen && concreteTestId) {
                setLoading(true);
                try {
                    const logData = await api.getSpecimenLog(concreteTestId);
                    setLog(logData);
                } catch (error) {
                    console.error("Failed to fetch specimen log:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchLog();
    }, [isOpen, concreteTestId]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Riwayat Benda Uji (Chain of Custody)</DialogTitle>
                    <DialogDescription>Menampilkan semua aktivitas yang tercatat untuk benda uji ini.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96 mt-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <div className="space-y-4 pr-4">
                            {log.map(entry => (
                                <div key={entry.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground">
                                            <History size={16} />
                                        </div>
                                        <div className="flex-grow w-px bg-border my-1"></div>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{entry.action}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(entry.timestamp).toLocaleString('id-ID')} oleh {entry.user_name || 'Sistem'}
                                        </p>
                                        <p className="text-sm mt-1">{entry.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
