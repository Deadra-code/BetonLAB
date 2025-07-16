// src/features/Reporting/reportComponents.jsx
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
    FileText, Columns3, BarChart2, PenLine, Type, ChevronsUpDown, Minus,
    Image as ImageIcon, GripVertical, Heading1, Box, Repeat,
    ListChecks, AreaChart, TableProperties, Info, ArrowUpDown, Table, Contact,
    QrCode, Pilcrow, Footprints
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Trash2 } from 'lucide-react';
import { checkConditions } from '../../utils/reporting/reportUtils.js';

// Impor semua komponen render
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


const PlaceholderComponent = ({ name }) => <div className="p-4 text-center text-muted-foreground border-2 border-dashed">{name}</div>;

// --- PERUBAHAN: Daftar komponen diperbarui ---
// '2 Kolom' dan '3 Kolom' diganti dengan satu komponen 'Kolom'
export const AVAILABLE_COMPONENTS = [
    {
        group: 'Struktur & Layout',
        items: [
            { id: 'section', name: 'Bagian', icon: <Box size={16}/>, type: 'layout', children: [] },
            { id: 'columns', name: 'Kolom', icon: <Columns3 size={16}/>, type: 'layout', children: [[], []], properties: { columnCount: 2 } },
            { id: 'horizontal-line', name: 'Garis Horizontal', icon: <Minus size={16}/>, type: 'layout' },
            { id: 'vertical-spacer', name: 'Spasi Vertikal', icon: <ArrowUpDown size={16}/>, type: 'layout' },
            { id: 'page-break', name: 'Pemisah Halaman', icon: <ChevronsUpDown size={16}/>, type: 'layout' },
            { id: 'footer', name: 'Footer Halaman', icon: <Footprints size={16}/>, type: 'layout' },
        ]
    },
    {
        group: 'Komponen Data',
        items: [
            { id: 'trial-loop', name: 'Loop Trial', icon: <Repeat size={16}/>, type: 'data', children: [] },
            { id: 'header', name: 'Kop Surat', icon: <Heading1 size={16}/>, type: 'data' },
            { id: 'client-info-block', name: 'Info Kontak Klien', icon: <Contact size={16}/>, type: 'data' },
            { id: 'trial-info-block', name: 'Info Trial Mix', icon: <Info size={16}/>, type: 'data' },
            { id: 'jmd-table', name: 'Tabel Job Mix', icon: <Columns3 size={16}/>, type: 'data' },
            { id: 'material-properties-table', name: 'Tabel Properti Material', icon: <ListChecks size={16}/>, type: 'data' },
            { id: 'raw-strength-table', name: 'Tabel Data Uji Tekan', icon: <Columns3 size={16}/>, type: 'data' },
            { id: 'strength-summary-table', name: 'Ringkasan Uji Tekan', icon: <TableProperties size={16}/>, type: 'data' },
            { id: 'strength-chart', name: 'Grafik Kuat Tekan', icon: <BarChart2 size={16}/>, type: 'data' },
            { id: 'sqc-chart', name: 'Grafik SQC', icon: <BarChart2 size={16}/>, type: 'data' },
            { id: 'combined-gradation-chart', name: 'Grafik Gradasi Gabungan', icon: <AreaChart size={16}/>, type: 'data' },
        ]
    },
    {
        group: 'Elemen Statis & Dinamis',
        items: [
            { id: 'custom-text', name: 'Kotak Teks', icon: <Type size={16}/>, type: 'static' },
            { id: 'dynamic-placeholder', name: 'Placeholder Dinamis', icon: <Pilcrow size={16}/>, type: 'static' },
            { id: 'custom-table', name: 'Tabel Kustom', icon: <Table size={16}/>, type: 'static' },
            { id: 'custom-image', name: 'Gambar/Logo', icon: <ImageIcon size={16}/>, type: 'static' },
            { id: 'qr-code', name: 'Kode QR', icon: <QrCode size={16}/>, type: 'static' },
            { id: 'signature-block', name: 'Blok Tanda Tangan', icon: <PenLine size={16}/>, type: 'static' },
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

const CanvasComponentInternal = ({ component, onClick, isSelected, reportData, settings, onPropertyChange, onDeleteComponent, apiReady }) => {
    const { properties = {} } = component;
    const { appearance = {} } = properties;
    const { marginTop = 2, marginBottom = 2, padding = '0px', backgroundColor } = appearance;

    const wrapperStyle = { 
        marginTop: `${marginTop * 4}px`, 
        marginBottom: `${marginBottom * 4}px`,
        padding: padding,
        backgroundColor: backgroundColor || 'transparent',
    };
    
    const baseStyle = "rounded";
    const selectedStyle = "outline outline-2 outline-offset-2 outline-primary bg-primary/10";

    const shouldRender = checkConditions(properties.conditions, reportData);
    if (!shouldRender) {
        return null;
    }

    const renderContent = () => {
        const trialData = component.trialData || reportData?.trials?.[0];

        if (component.type === 'data' && !reportData && component.id !== 'header') {
            return <PlaceholderComponent name={`${component.name} (Pilih proyek untuk melihat data)`} />;
        }

        switch (component.id) {
            // ... (semua case komponen lain tetap sama) ...
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
            case 'custom-text': return <CustomTextComponent properties={properties} />;
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
                return (
                    <Droppable droppableId={component.instanceId}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={cn("p-4 border border-dashed border-gray-300 rounded-md min-h-[100px]", snapshot.isDraggingOver && "bg-blue-100")}>
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

            // --- PERUBAHAN: Logika render kolom yang dinamis ---
            case 'columns':
                const numColumns = component.properties?.columnCount || 2;
                const gridClassMap = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
                return (
                    <div className={cn('grid gap-4', gridClassMap[numColumns])}>
                        {[...Array(numColumns).keys()].map(colIndex => (
                            <div key={colIndex} className="w-full">
                                <Droppable droppableId={`${component.instanceId}-col-${colIndex}`}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className={cn("p-2 border border-dashed border-gray-300 rounded-md min-h-[100px]", snapshot.isDraggingOver ? "bg-blue-100" : "bg-gray-50 dark:bg-gray-800/50")}>
                                            {(!component.children[colIndex] || component.children[colIndex].length === 0) && <p className="text-xs text-center text-muted-foreground">Kolom {colIndex + 1}</p>}
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
        <div onClick={(e) => { e.stopPropagation(); onClick(component.instanceId); }} style={wrapperStyle} className={cn(baseStyle, isSelected === component.instanceId && selectedStyle)}>
            {renderContent()}
        </div>
    );
};

export const CanvasComponent = React.memo(CanvasComponentInternal);
