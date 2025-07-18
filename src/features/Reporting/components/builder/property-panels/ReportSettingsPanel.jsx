// src/features/Reporting/components/builder/property-panels/ReportSettingsPanel.jsx
// Deskripsi: Berisi UI untuk pengaturan global laporan, seperti ukuran kertas dan orientasi.

import React from 'react';
import { Label } from '../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Settings2 } from 'lucide-react';

const ReportSettingsPanel = ({ pageSettings, onPageSettingChange }) => (
    <div className="p-4 space-y-4">
        <div className="flex items-center text-lg font-semibold"><Settings2 className="mr-2 h-5 w-5" />Pengaturan Laporan</div>
        <p className="text-sm text-muted-foreground">Atur properti global untuk seluruh halaman laporan Anda.</p>
        <div className="space-y-2">
            <Label>Ukuran Kertas</Label>
            <Select value={pageSettings.size} onValueChange={v => onPageSettingChange('size', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label>Orientasi</Label>
            <Select value={pageSettings.orientation} onValueChange={v => onPageSettingChange('orientation', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="portrait">Potret</SelectItem>
                    <SelectItem value="landscape">Lanskap</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
);

export default ReportSettingsPanel;
