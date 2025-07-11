import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useNotifier } from '../../hooks/useNotifier';
import { Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export const NotesTab = ({ trial, onSave }) => {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    // PEMANTAPAN: State untuk melacak perubahan yang belum disimpan
    const [isDirty, setIsDirty] = useState(false);
    const { notify } = useNotifier();

    useEffect(() => {
        setNotes(trial.notes || '');
        setIsDirty(false); // Reset status dirty saat trial berubah
    }, [trial.notes]);

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        setIsDirty(true);
    };

    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            await onSave({ ...trial, notes: notes });
            notify.success("Catatan berhasil disimpan.");
            setIsDirty(false); // Set status kembali ke "tidak ada perubahan"
        } catch (error) {
            console.error("Failed to save notes:", error);
            notify.error("Gagal menyimpan catatan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div>
                <Label htmlFor="trial-notes" className="text-lg font-semibold">Catatan & Dokumentasi</Label>
                <p className="text-sm text-muted-foreground">
                    Gunakan area ini untuk mencatat observasi, modifikasi, atau informasi penting lainnya terkait trial mix ini.
                </p>
            </div>
            <Textarea
                id="trial-notes"
                value={notes}
                onChange={handleNotesChange}
                rows={15}
                placeholder="Contoh: Admixture ditambahkan pada menit ke-5, terjadi bleeding ringan saat pengujian slump..."
                className="max-w-4xl"
            />
            <div className="flex items-center gap-4">
                <Button onClick={handleSaveNotes} disabled={isSaving || !isDirty}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isDirty ? <Save className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />)}
                    {isDirty ? 'Simpan Catatan' : 'Tersimpan'}
                </Button>
                {/* PEMANTAPAN: Indikator visual untuk perubahan yang belum disimpan */}
                {isDirty && !isSaving && (
                    <span className="text-sm text-yellow-600 flex items-center">
                        <AlertTriangle className="mr-1 h-4 w-4" /> Perubahan belum disimpan
                    </span>
                )}
            </div>
        </div>
    );
};
