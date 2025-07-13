// Lokasi file: src/features/Reporting/ReportTemplateBuilder.js
// Deskripsi: Komponen UI untuk membuat dan mengelola template laporan.

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { useReportTemplates } from '../../hooks/useReportTemplates';
import { ScrollArea } from '../../components/ui/scroll-area';
import { PlusCircle, Trash2, GripVertical, FileText, BarChart2, PenLine, Type, Columns3, ChevronsUpDown, File, Heading1, Heading2 } from 'lucide-react';

const availableBlocks = [
    { id: 'coverPage', name: 'Halaman Cover', icon: <File size={16}/> },
    { id: 'header', name: 'Header Halaman', icon: <Heading1 size={16}/> },
    { id: 'footer', name: 'Footer Halaman', icon: <Heading2 size={16}/> },
    { id: 'projectInfo', name: 'Info Proyek', icon: <FileText size={16}/> },
    { id: 'jobMixTable', name: 'Tabel Job Mix', icon: <Columns3 size={16}/> },
    { id: 'materialTable', name: 'Tabel Data Material', icon: <Columns3 size={16}/> },
    { id: 'strengthChart', name: 'Grafik Uji Tekan', icon: <BarChart2 size={16}/> },
    { id: 'sqcChart', name: 'Grafik SQC', icon: <BarChart2 size={16}/> },
    { id: 'gradationChart', name: 'Grafik Gradasi', icon: <BarChart2 size={16}/> },
    { id: 'rawTestTable', name: 'Tabel Data Mentah', icon: <Columns3 size={16}/> },
    { id: 'signature', name: 'Kolom Tanda Tangan', icon: <PenLine size={16}/> },
    { id: 'customText', name: 'Teks Kustom', icon: <Type size={16}/> },
    { id: 'pageBreak', name: 'Pemisah Halaman', icon: <ChevronsUpDown size={16}/> },
];

const DraggableBlock = ({ block, index }) => (
    <Draggable draggableId={block.id} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`p-2 mb-2 rounded border flex items-center bg-card ${snapshot.isDragging ? 'shadow-lg' : ''}`}
            >
                <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
                {block.icon}
                <span className="ml-2 text-sm">{block.name}</span>
            </div>
        )}
    </Draggable>
);

const ReportBuilderUI = ({ onSave, onCancel, initialTemplate = null }) => {
    const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
    const [layout, setLayout] = useState(initialTemplate?.layout || []);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId === 'blocks' && destination.droppableId === 'layout') {
            const blockToAdd = { ...availableBlocks[source.index], instanceId: `${availableBlocks[source.index].id}-${new Date().getTime()}` };
            const newLayout = Array.from(layout);
            newLayout.splice(destination.index, 0, blockToAdd);
            setLayout(newLayout);
        } else if (source.droppableId === 'layout' && destination.droppableId === 'layout') {
            const newLayout = Array.from(layout);
            const [removed] = newLayout.splice(source.index, 1);
            newLayout.splice(destination.index, 0, removed);
            setLayout(newLayout);
        }
    };

    const handleRemoveBlock = (index) => {
        const newLayout = [...layout];
        newLayout.splice(index, 1);
        setLayout(newLayout);
    };

    const handleSave = () => {
        if (!templateName) {
            alert("Nama template harus diisi.");
            return;
        }
        onSave({ id: initialTemplate?.id, name: templateName, layout });
    };

    return (
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{initialTemplate ? 'Edit Template Laporan' : 'Buat Template Laporan Baru'}</DialogTitle>
                <DialogDescription>Atur tata letak laporan dengan menarik blok konten dari kiri ke kanan.</DialogDescription>
            </DialogHeader>
            <div className="py-2">
                <Label htmlFor="template-name">Nama Template</Label>
                <Input id="template-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
            {/* PERBAIKAN: Menggunakan flexbox dan min-h-0 untuk memastikan scrolling yang benar */}
            <div className="flex-grow grid grid-cols-3 gap-4 min-h-0">
                <DragDropContext onDragEnd={onDragEnd}>
                    {/* Kolom 1: Blok Konten */}
                    <div className="col-span-1 flex flex-col min-h-0">
                        <h3 className="font-semibold mb-2 flex-shrink-0">Blok Konten Tersedia</h3>
                        <ScrollArea className="flex-grow bg-muted p-2 rounded-md border">
                            <Droppable droppableId="blocks" isDropDisabled={true}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps}>
                                        {availableBlocks.map((block, index) => <DraggableBlock key={block.id} block={block} index={index} />)}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </ScrollArea>
                    </div>

                    {/* Kolom 2: Tata Letak */}
                    <div className="col-span-2 flex flex-col min-h-0">
                        <h3 className="font-semibold mb-2 flex-shrink-0">Tata Letak Laporan</h3>
                        <ScrollArea className="flex-grow p-2 rounded-md border-2 border-dashed">
                            <Droppable droppableId="layout">
                                {(provided, snapshot) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className={`h-full rounded-sm transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}`}>
                                        {layout.length === 0 && <p className="text-sm text-center text-muted-foreground py-10">Tarik blok dari kiri ke sini</p>}
                                        {layout.map((block, index) => (
                                            <Draggable key={block.instanceId} draggableId={block.instanceId} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} className="p-2 mb-2 rounded border flex justify-between items-center bg-card shadow-sm">
                                                        <div className="flex items-center">
                                                            <span {...provided.dragHandleProps}><GripVertical className="h-5 w-5 mr-2 text-muted-foreground cursor-grab" /></span>
                                                            {block.icon}
                                                            <span className="ml-2 text-sm">{block.name}</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveBlock(index)}><Trash2 size={14} /></Button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </ScrollArea>
                    </div>
                </DragDropContext>
            </div>
            <DialogFooter className="pt-4 flex-shrink-0">
                <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button onClick={handleSave}>Simpan Template</Button>
            </DialogFooter>
        </DialogContent>
    );
};


export default function ReportTemplateManager({ apiReady, children }) {
    const { templates, addTemplate, updateTemplate, deleteTemplate, loading } = useReportTemplates(apiReady);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const handleAddNew = () => {
        setEditingTemplate(null);
        setIsBuilderOpen(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setIsBuilderOpen(true);
    };

    const handleSave = async (templateData) => {
        if (templateData.id) {
            await updateTemplate(templateData);
        } else {
            await addTemplate(templateData);
        }
        setIsBuilderOpen(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Kelola Template Laporan</DialogTitle>
                    <DialogDescription>Buat, edit, atau hapus template laporan kustom Anda.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Button onClick={handleAddNew} className="w-full mb-4"><PlusCircle className="mr-2 h-4 w-4" /> Buat Template Baru</Button>
                    <ScrollArea className="h-60">
                        <div className="space-y-2">
                            {loading && <p>Memuat...</p>}
                            {templates.map(template => (
                                <div key={template.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <p className="font-medium">{template.name}</p>
                                    <div className="flex gap-1">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => deleteTemplate(template.id)}>Hapus</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                    <ReportBuilderUI onSave={handleSave} onCancel={() => setIsBuilderOpen(false)} initialTemplate={editingTemplate} />
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
