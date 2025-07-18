// src/features/Reporting/reportComponents.jsx
// DESKRIPSI: Fitur "Edit di Tempat" kini diperluas ke komponen tabel JMD dan Properti Material.
// Mengklik tombol Edit pada tabel-tabel ini sekarang akan membuka dialog Job Mix Design.

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
    FileText, Columns3, BarChart2, PenLine, Type, ChevronsUpDown, Minus,
    Image as ImageIcon, GripVertical, Heading1, Box, Repeat,
    ListChecks, AreaChart, TableProperties, Info, ArrowUpDown, Table, Contact,
    QrCode, Pilcrow, Footprints, Pencil
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { checkConditions } from '../../utils/reporting/reportUtils.js';
import { useReportBuilderStore } from '../../hooks/useReportBuilderStore.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';


// Impor semua komponen render dan form
import HeaderComponent from './components/HeaderComponent.jsx';
import JmdTableComponent from './components/JmdTableComponent.jsx';
import CustomTextComponent from './components/CustomTextComponent.jsx';
import RawStrengthTestTable from './components/RawStrengthTestTable.jsx';
import CustomImageComponent from './components/CustomImageComponent.jsx';
import SignatureBlock from './components/SignatureBlock.jsx';
import TrialLoopingSection from './components/TrialLoopingSection.jsx';
import StrengthChartComponent from './components/StrengthChartComponent.jsx';
import SqcChartComponent from './components/SqcChartComponent.jsx';
import MaterialPropertiesTable from './components/MaterialPropertiesTable.jsx';
import CombinedGradationChart from './components/CombinedGradationChart.jsx';
import StrengthSummaryTable from './components/StrengthSummaryTable.jsx';
import TrialInfoBlock from './components/TrialInfoBlock.jsx';
import VerticalSpacer from './components/VerticalSpacer.jsx';
import CustomTableComponent from './components/CustomTableComponent.jsx';
import ClientInfoBlock from './components/ClientInfoBlock.jsx';
import FooterComponent from './components/FooterComponent.jsx';
import DynamicPlaceholderComponent from './components/DynamicPlaceholderComponent.jsx';
import QrCodeComponent from './components/QrCodeComponent.jsx';
import { ProjectForm } from '../Projects/components/ProjectForm.jsx';
// PERUBAHAN: Impor JobMixDesign untuk digunakan dalam dialog
import JobMixDesign from '../Projects/JobMixDesign.jsx';
import CompressiveStrengthTest from '../Projects/CompressiveStrengthTest.jsx';

const PlaceholderComponent = ({ name }) => <div className="p-4 text-center text-muted-foreground border-2 border-dashed">{name}</div>;

const commonRules = {
    validParents: ['page', 'section', 'columns', 'trial-loop'],
    invalidChildren: []
};

export const AVAILABLE_COMPONENTS = [
    {
        group: 'Struktur & Layout',
        items: [
            { id: 'section', name: 'Bagian', icon: <Box size={16}/>, type: 'layout', children: [], rules: { validParents: ['page', 'columns', 'trial-loop'], invalidChildren: ['header', 'footer', 'page-break'] } },
            { id: 'columns', name: 'Kolom', icon: <Columns3 size={16}/>, type: 'layout', children: [[], []], properties: { columnCount: 2 }, rules: { validParents: ['page', 'section', 'trial-loop'], invalidChildren: ['columns', 'trial-loop', 'header', 'footer', 'page-break'] } },
            { id: 'horizontal-line', name: 'Garis Horizontal', icon: <Minus size={16}/>, type: 'layout', rules: commonRules },
            { id: 'vertical-spacer', name: 'Spasi Vertikal', icon: <ArrowUpDown size={16}/>, type: 'layout', rules: commonRules },
            { id: 'page-break', name: 'Pemisah Halaman', icon: <ChevronsUpDown size={16}/>, type: 'layout', rules: { validParents: ['page'], isTopLevelOnly: true } },
            { id: 'footer', name: 'Footer Halaman', icon: <Footprints size={16}/>, type: 'layout', rules: { validParents: ['page'], isTopLevelOnly: true, maxInstancesPerPage: 1 } },
        ]
    },
    {
        group: 'Komponen Data',
        items: [
            { id: 'trial-loop', name: 'Loop Trial', icon: <Repeat size={16}/>, type: 'data', children: [], rules: { validParents: ['page', 'section'], invalidChildren: ['trial-loop', 'header', 'footer', 'page-break'] } },
            { id: 'header', name: 'Kop Surat', icon: <Heading1 size={16}/>, type: 'data', rules: { validParents: ['page'], isTopLevelOnly: true, maxInstancesPerPage: 1 } },
            { id: 'client-info-block', name: 'Info Kontak Klien', icon: <Contact size={16}/>, type: 'data', isEditable: true, editContext: 'project', rules: commonRules },
            { id: 'trial-info-block', name: 'Info Trial Mix', icon: <Info size={16}/>, type: 'data', isEditable: true, editContext: 'trial', rules: commonRules },
            // PERUBAHAN: Tandai tabel JMD dan Material sebagai dapat diedit
            { id: 'jmd-table', name: 'Tabel Job Mix', icon: <Columns3 size={16}/>, type: 'data', isEditable: true, editContext: 'trial', rules: commonRules },
            { id: 'material-properties-table', name: 'Tabel Properti Material', icon: <ListChecks size={16}/>, type: 'data', isEditable: true, editContext: 'trial', rules: commonRules },
            { id: 'raw-strength-table', name: 'Tabel Data Uji Tekan', icon: <Columns3 size={16}/>, type: 'data', isEditable: true, editContext: 'compressiveTest', rules: commonRules },
            { id: 'strength-summary-table', name: 'Ringkasan Uji Tekan', icon: <TableProperties size={16}/>, type: 'data', rules: commonRules },
            { id: 'strength-chart', name: 'Grafik Kuat Tekan', icon: <BarChart2 size={16}/>, type: 'data', rules: commonRules },
            { id: 'sqc-chart', name: 'Grafik SQC', icon: <BarChart2 size={16}/>, type: 'data', rules: commonRules },
            { id: 'combined-gradation-chart', name: 'Grafik Gradasi Gabungan', icon: <AreaChart size={16}/>, type: 'data', isEditable: true, editContext: 'trial', rules: commonRules },
        ]
    },
    {
        group: 'Elemen Statis & Dinamis',
        items: [
            { id: 'custom-text', name: 'Kotak Teks', icon: <Type size={16}/>, type: 'static', rules: commonRules },
            { id: 'dynamic-placeholder', name: 'Placeholder Dinamis', icon: <Pilcrow size={16}/>, type: 'static', rules: commonRules },
            { id: 'custom-table', name: 'Tabel Kustom', icon: <Table size={16}/>, type: 'static', rules: commonRules },
            { id: 'custom-image', name: 'Gambar/Logo', icon: <ImageIcon size={16}/>, type: 'static', rules: commonRules },
            { id: 'qr-code', name: 'Kode QR', icon: <QrCode size={16}/>, type: 'static', rules: commonRules },
            { id: 'signature-block', name: 'Blok Tanda Tangan', icon: <PenLine size={16}/>, type: 'static', rules: commonRules },
        ]
    }
];

export const LibraryComponent = ({ component, ...props }) => (
    <div className="p-2 mb-2 rounded border flex items-center bg-card hover:bg-accent cursor-grab" {...props}>
        <GripVertical className="h-5 w-5 mr-2 text-muted-foreground" />
        {component.icon}
        <span className="ml-2 text-sm">{component.name}</span>
    </div>
);

// PERUBAHAN: EditTrigger kini menangani konteks 'trial' dengan membuka dialog JobMixDesign.
const EditTrigger = ({ component, reportData, onUpdateProject, onUpdateTrial, apiReady }) => {
    const { editContext } = component;

    if (editContext === 'project') {
        if (!reportData) return null;
        return (
            <ProjectForm project={reportData} onSave={onUpdateProject}>
                <Button variant="outline" size="icon" className="absolute top-0 right-7 h-6 w-6 z-10 opacity-0 group-hover/component:opacity-100 transition-opacity">
                    <Pencil size={12} />
                </Button>
            </ProjectForm>
        );
    }
    
    if (editContext === 'trial') {
        const trialData = reportData?.trials?.[0];
        if (!trialData) return null;

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="absolute top-0 right-7 h-6 w-6 z-10 opacity-0 group-hover/component:opacity-100 transition-opacity">
                        <Pencil size={12} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Rencana Campuran: {trialData.trial_name}</DialogTitle>
                        <DialogDescription>
                            Perubahan yang Anda buat di sini akan diperbarui di seluruh aplikasi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto p-4">
                        <JobMixDesign
                            trial={trialData}
                            onSave={onUpdateTrial}
                            apiReady={apiReady}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (editContext === 'compressiveTest') {
        const trialData = reportData?.trials?.[0];
        if (!trialData) return null;

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="absolute top-0 right-7 h-6 w-6 z-10 opacity-0 group-hover/component:opacity-100 transition-opacity">
                        <Pencil size={12} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Manajemen Data Uji Tekan: {trialData.trial_name}</DialogTitle>
                        <DialogDescription>
                            Lihat, tambah, atau hapus data pengujian kuat tekan untuk trial mix ini. Perubahan akan disimpan secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto p-1">
                        <CompressiveStrengthTest
                            trialId={trialData.id}
                            apiReady={apiReady}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return null;
};


const CanvasComponentInternal = ({ component, onClick, isSelected, reportData, settings, onPropertyChange, onDeleteComponent, apiReady, onUpdateProject, onUpdateTrial }) => {
    const { properties = {} } = component;
    const { appearance = {} } = properties;
    const { marginTop = 2, marginBottom = 2, padding = '0px', backgroundColor } = appearance;
    
    const draggingComponent = useReportBuilderStore(state => state.draggingComponent);

    const wrapperStyle = { 
        marginTop: `${marginTop * 4}px`, 
        marginBottom: `${marginBottom * 4}px`,
        padding: padding,
        backgroundColor: backgroundColor || 'transparent',
    };
    
    const baseStyle = "rounded";
    const selectedStyle = "outline outline-2 outline-offset-2 outline-primary bg-primary/10";

    const shouldRender = checkConditions(properties.conditions, reportData);
    if (!shouldRender) return null;

    const renderContent = () => {
        const trialData = component.isInsideLoop ? reportData : (reportData?.trials?.[0] || {});

        if (component.type === 'data' && !reportData && component.id !== 'header') {
            return <PlaceholderComponent name={`${component.name} (Pilih proyek untuk melihat data)`} />;
        }

        switch (component.id) {
            case 'header': return <HeaderComponent settings={settings} properties={properties} />;
            case 'client-info-block': return <ClientInfoBlock reportData={reportData} properties={properties} />;
            case 'trial-info-block': return <TrialInfoBlock trialData={trialData} properties={properties} />;
            case 'jmd-table': return <JmdTableComponent trialData={trialData} properties={properties} />;
            case 'material-properties-table': return <MaterialPropertiesTable trialData={trialData} properties={properties} />;
            case 'raw-strength-table': return <RawStrengthTestTable trialData={trialData} properties={properties} />;
            case 'strength-summary-table': return <StrengthSummaryTable trialData={trialData} properties={properties} />;
            case 'strength-chart': return <StrengthChartComponent trialData={trialData} properties={properties} />;
            case 'sqc-chart': return <SqcChartComponent trialData={trialData} properties={properties} />;
            case 'combined-gradation-chart': return <CombinedGradationChart trialData={trialData} properties={properties} apiReady={apiReady} />;
            case 'custom-text': return <CustomTextComponent properties={properties} reportData={reportData} settings={settings} />;
            case 'dynamic-placeholder': return <DynamicPlaceholderComponent properties={properties} reportData={reportData} settings={settings} />;
            case 'custom-table': return <CustomTableComponent properties={properties} />;
            case 'custom-image': return <CustomImageComponent properties={properties} instanceId={component.instanceId} onPropertyChange={onPropertyChange} />;
            case 'qr-code': return <QrCodeComponent properties={properties} reportData={reportData} settings={settings} />;
            case 'signature-block': return <SignatureBlock properties={properties} />;
            case 'horizontal-line': return <hr style={{ borderWidth: properties.thickness || 1, borderColor: properties.color || '#9CA3AF', borderStyle: properties.style || 'solid', width: `${properties.width || 100}%`, margin: 'auto' }} />;
            case 'vertical-spacer': return <VerticalSpacer properties={properties} />;
            case 'footer': return <FooterComponent properties={properties} />;
            case 'trial-loop':
                 return <TrialLoopingSection component={component} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onComponentClick={onClick} selectedComponentId={isSelected} onDeleteComponent={onDeleteComponent} apiReady={apiReady} />;
            
            case 'section':
                const isSectionDropDisabled = draggingComponent ? !draggingComponent.rules.validParents.includes('section') || component.rules.invalidChildren.includes(draggingComponent.id) : false;
                return (
                    <Droppable droppableId={component.instanceId} isDropDisabled={isSectionDropDisabled}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={cn("p-4 border border-dashed border-gray-300 rounded-md min-h-[100px]", snapshot.isDraggingOver && "bg-blue-100", isSectionDropDisabled && "bg-red-100")}>
                                {component.children.length === 0 && <p className="text-xs text-center text-muted-foreground">Area Bagian (Seret komponen ke sini)</p>}
                                {component.children.map((child, index) => (
                                    <Draggable key={child.instanceId} draggableId={child.instanceId} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative group">
                                                <CanvasComponent component={child} isSelected={isSelected} onClick={onClick} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onDeleteComponent={onDeleteComponent} apiReady={apiReady} />
                                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 z-10" onClick={(e) => { e.stopPropagation(); onDeleteComponent(child.instanceId); }}><Trash2 size={12} /></Button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                );

            case 'columns':
                const numColumns = component.properties?.columnCount || 2;
                const gridClassMap = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
                const isColumnDropDisabled = draggingComponent ? !draggingComponent.rules.validParents.includes('columns') || component.rules.invalidChildren.includes(draggingComponent.id) : false;
                return (
                    <div className={cn('grid gap-4', gridClassMap[numColumns])}>
                        {[...Array(numColumns).keys()].map(colIndex => (
                            <div key={colIndex} className="w-full mx-1">
                                <Droppable droppableId={`${component.instanceId}-col-${colIndex}`} isDropDisabled={isColumnDropDisabled}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={cn(
                                                "p-2 border border-dashed rounded-md min-h-[100px] flex flex-col",
                                                snapshot.isDraggingOver && "bg-blue-100 border-blue-400",
                                                isColumnDropDisabled && "bg-red-100",
                                                !snapshot.isDraggingOver && isColumnDropDisabled && draggingComponent ? "bg-red-100/50 border-red-300" : "bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                            )}
                                        >
                                            <div className="flex-grow">
                                                {component.children[colIndex] && component.children[colIndex].map((child, index) => (
                                                    <Draggable key={child.instanceId} draggableId={child.instanceId} index={index}>
                                                        {(provided) => (
                                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative group">
                                                                <CanvasComponent component={child} isSelected={isSelected} onClick={onClick} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onDeleteComponent={onDeleteComponent} apiReady={apiReady}/>
                                                                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 z-10" onClick={(e) => { e.stopPropagation(); onDeleteComponent(child.instanceId); }}><Trash2 size={12} /></Button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                            {(!component.children[colIndex] || component.children[colIndex].length === 0) && (
                                                <div className="text-xs text-center text-muted-foreground p-2 border-2 border-dashed rounded-md h-full">
                                                    Kolom {colIndex + 1}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                );

            default:
                return <PlaceholderComponent name={component.name} />;
        }
    };

    return (
        <div onClick={(e) => { e.stopPropagation(); onClick(component.instanceId); }} style={wrapperStyle} className={cn(baseStyle, "relative group/component", isSelected === component.instanceId && selectedStyle)}>
            {isSelected === component.instanceId && component.isEditable && (
                <EditTrigger
                    component={component}
                    reportData={reportData}
                    onUpdateProject={onUpdateProject}
                    onUpdateTrial={onUpdateTrial}
                    apiReady={apiReady}
                />
            )}
             <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover/component:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComponent(component.instanceId);
                }}
            >
                <Trash2 size={12} />
            </Button>
            {renderContent()}
        </div>
    );
};

export const CanvasComponent = React.memo(CanvasComponentInternal);
