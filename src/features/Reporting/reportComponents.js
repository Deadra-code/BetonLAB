// Lokasi file: src/features/Reporting/reportComponents.js
// Deskripsi: Perbaikan final pada className untuk komponen multi-kolom agar kompatibel dengan Tailwind CSS Purge.

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
    FileText, Columns3, BarChart2, PenLine, Type, ChevronsUpDown, Minus,
    Image as ImageIcon, GripVertical, Heading1, Heading2, Box, Repeat,
    ListChecks, AreaChart, TableProperties, Info, ArrowUpDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Trash2 } from 'lucide-react';

// Impor komponen render yang sebenarnya
import HeaderComponent from './components/HeaderComponent';
import JmdTableComponent from './components/JmdTableComponent';
import CustomTextComponent from './components/CustomTextComponent';
import RawStrengthTestTable from './components/RawStrengthTestTable';
import CustomImageComponent from './components/CustomImageComponent';
import SignatureBlock from './components/SignatureBlock';
import TrialLoopingSection from './components/TrialLoopingSection';
import StrengthChartComponent from './components/StrengthChartComponent';
import SqcChartComponent from './components/SqcChartComponent';
import MaterialPropertiesTable from './components/MaterialPropertiesTable';
import CombinedGradationChart from './components/CombinedGradationChart';
import StrengthSummaryTable from './components/StrengthSummaryTable';
import TrialInfoBlock from './components/TrialInfoBlock';
import VerticalSpacer from './components/VerticalSpacer';

const PlaceholderComponent = ({ name }) => <div className="p-4 text-center text-muted-foreground border-2 border-dashed">{name}</div>;

export const AVAILABLE_COMPONENTS = [
    {
        group: 'Struktur & Layout',
        items: [
            { id: 'section', name: 'Bagian', icon: <Box size={16}/>, type: 'layout', children: [] },
            { id: 'columns-2', name: '2 Kolom', icon: <Columns3 size={16}/>, type: 'layout', children: [[], []] },
            { id: 'columns-3', name: '3 Kolom', icon: <Columns3 size={16}/>, type: 'layout', children: [[], [], []] },
            { id: 'page-break', name: 'Pemisah Halaman', icon: <ChevronsUpDown size={16}/>, type: 'layout' },
            { id: 'horizontal-line', name: 'Garis Horizontal', icon: <Minus size={16}/>, type: 'layout' },
            { id: 'vertical-spacer', name: 'Spasi Vertikal', icon: <ArrowUpDown size={16}/>, type: 'layout' },
        ]
    },
    {
        group: 'Komponen Data',
        items: [
            { id: 'trial-loop', name: 'Loop Trial', icon: <Repeat size={16}/>, type: 'data', children: [] },
            { id: 'header', name: 'Kop Surat Perusahaan', icon: <Heading1 size={16}/>, type: 'data' },
            { id: 'project-name', name: 'Nama Proyek', icon: <FileText size={16}/>, type: 'data' },
            { id: 'client-name', name: 'Nama Klien', icon: <FileText size={16}/>, type: 'data' },
            { id: 'trial-info-block', name: 'Info Trial Mix', icon: <Info size={16}/>, type: 'data' },
            { id: 'jmd-table', name: 'Tabel Job Mix', icon: <Columns3 size={16}/>, type: 'data' },
            { id: 'material-properties-table', name: 'Tabel Properti Material', icon: <ListChecks size={16}/>, type: 'data' },
            { id: 'raw-strength-table', name: 'Tabel Data Mentah Uji Tekan', icon: <Columns3 size={16}/>, type: 'data' },
            { id: 'strength-summary-table', name: 'Ringkasan Uji Tekan', icon: <TableProperties size={16}/>, type: 'data' },
            { id: 'strength-chart', name: 'Grafik Kuat Tekan', icon: <BarChart2 size={16}/>, type: 'data' },
            { id: 'sqc-chart', name: 'Grafik SQC', icon: <BarChart2 size={16}/>, type: 'data' },
            { id: 'combined-gradation-chart', name: 'Grafik Gradasi Gabungan', icon: <AreaChart size={16}/>, type: 'data' },
        ]
    },
    {
        group: 'Elemen Primitif',
        items: [
            { id: 'custom-text', name: 'Kotak Teks', icon: <Type size={16}/>, type: 'static' },
            { id: 'custom-image', name: 'Gambar/Logo', icon: <ImageIcon size={16}/>, type: 'static' },
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
    const { marginTop = 2, marginBottom = 2 } = properties.appearance || {};

    const wrapperStyle = { marginTop: `${marginTop * 4}px`, marginBottom: `${marginBottom * 4}px` };
    const baseStyle = "p-2 rounded";
    const selectedStyle = "outline outline-2 outline-offset-2 outline-primary bg-primary/10";

    const renderContent = () => {
        const trialData = component.trialData || reportData?.trials?.[0];

        if (component.type === 'data' && !reportData && component.id !== 'header') {
            return <PlaceholderComponent name={`${component.name} (Pilih proyek untuk melihat data)`} />;
        }

        switch (component.id) {
            case 'header': return <HeaderComponent settings={settings} properties={properties} />;
            case 'jmd-table': return <JmdTableComponent trialData={trialData} properties={properties} />;
            case 'custom-text': return <CustomTextComponent properties={properties} />;
            case 'project-name': return <div className="font-bold text-lg">{reportData?.projectName || 'Nama Proyek'}</div>;
            case 'client-name': return <div className="text-md">Klien: {reportData?.clientName || 'Nama Klien'}</div>;
            case 'horizontal-line': return <hr className="my-4 border-t border-gray-400" />;
            case 'raw-strength-table': return <RawStrengthTestTable trialData={trialData} properties={properties} />;
            case 'strength-chart': return <StrengthChartComponent trialData={trialData} properties={properties} />;
            case 'sqc-chart': return <SqcChartComponent trialData={trialData} properties={properties} />;
            case 'custom-image': return <CustomImageComponent properties={properties} instanceId={component.instanceId} onPropertyChange={onPropertyChange} />;
            case 'signature-block': return <SignatureBlock properties={properties} />;
            case 'material-properties-table': return <MaterialPropertiesTable trialData={trialData} properties={properties} />;
            case 'combined-gradation-chart': return <CombinedGradationChart trialData={trialData} properties={properties} apiReady={apiReady} />;
            case 'strength-summary-table': return <StrengthSummaryTable trialData={trialData} properties={properties} />;
            case 'trial-info-block': return <TrialInfoBlock trialData={trialData} properties={properties} />;
            case 'vertical-spacer': return <VerticalSpacer properties={properties} />;
            case 'trial-loop':
                 return <TrialLoopingSection component={component} reportData={reportData} settings={settings} onPropertyChange={onPropertyChange} onComponentClick={onClick} isSelected={isSelected} onDeleteComponent={onDeleteComponent} apiReady={apiReady} />;
            
            case 'section':
                return (
                    <Droppable droppableId={component.instanceId}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={cn("p-4 border border-dashed border-gray-300 rounded-md min-h-[100px]", snapshot.isDraggingOver && "bg-blue-100")}>
                                {component.children.length === 0 && <p className="text-xs text-center text-muted-foreground">Area Bagian (Seret komponen ke sini)</p>}
                                {component.children.map((child) => (
                                    <Draggable key={child.instanceId} draggableId={child.instanceId} index={component.children.indexOf(child)}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative group">
                                                <CanvasComponent component={child} isSelected={isSelected} onClick={onClick} {...{ reportData, settings, onPropertyChange, onDeleteComponent, apiReady }} />
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

            case 'columns-2':
            case 'columns-3':
                const numColumns = component.id === 'columns-3' ? 3 : 2;
                // PERBAIKAN: Menggunakan objek pemetaan untuk memastikan Tailwind mendeteksi kelas.
                const gridClassMap = {
                    2: 'grid-cols-2',
                    3: 'grid-cols-3',
                };
                return (
                    <div className={cn('grid gap-4', gridClassMap[numColumns])}>
                        {[...Array(numColumns).keys()].map(colIndex => (
                            <div key={colIndex} className="w-full">
                                <Droppable droppableId={`${component.instanceId}-col-${colIndex}`}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className={cn("p-2 border border-dashed border-gray-300 rounded-md min-h-[100px]", snapshot.isDraggingOver ? "bg-blue-100" : "bg-gray-50 dark:bg-gray-800/50")}>
                                            {(!component.children[colIndex] || component.children[colIndex].length === 0) && <p className="text-xs text-center text-muted-foreground">Kolom {colIndex + 1}</p>}
                                            {component.children[colIndex] && component.children[colIndex].map((child) => (
                                                 <Draggable key={child.instanceId} draggableId={child.instanceId} index={component.children[colIndex].indexOf(child)}>
                                                     {(provided) => (
                                                         <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative group">
                                                             <CanvasComponent component={child} isSelected={isSelected} onClick={onClick} {...{ reportData, settings, onPropertyChange, onDeleteComponent, apiReady }}/>
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
        <div onClick={() => onClick(component.instanceId)} style={wrapperStyle} className={cn(baseStyle, isSelected === component.instanceId && selectedStyle)}>
            {renderContent()}
        </div>
    );
};

export const CanvasComponent = React.memo(CanvasComponentInternal);
