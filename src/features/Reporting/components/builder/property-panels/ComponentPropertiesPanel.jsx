// src/features/Reporting/components/builder/property-panels/ComponentPropertiesPanel.jsx
// Deskripsi: Komponen ini bertindak sebagai dispatcher, memilih dan merender panel properti
// yang sesuai berdasarkan ID komponen yang dipilih.

import React from 'react';
import {
    TextPanel,
    ColumnsPanel,
    JmdTablePanel,
    GenericTablePanel,
    GenericChartPanel,
    SignaturePanel,
    CustomTablePanel
} from './SpecificPanels';

const panelMapping = {
    'custom-text': TextPanel,
    'columns': ColumnsPanel,
    'jmd-table': JmdTablePanel,
    'material-properties-table': GenericTablePanel,
    'raw-strength-table': GenericTablePanel,
    'strength-summary-table': GenericTablePanel,
    'strength-chart': GenericChartPanel,
    'sqc-chart': GenericChartPanel,
    'combined-gradation-chart': GenericChartPanel,
    'signature-block': SignaturePanel,
    'custom-table': CustomTablePanel,
};

const ComponentPropertiesPanel = ({ component, onPropertyChange }) => {
    if (!component) return null;

    const SpecificPanel = panelMapping[component.id];

    return (
        <div className="p-4">
            <h4 className="font-bold mb-4 border-b pb-2">{component.name}</h4>
            {SpecificPanel ? (
                <SpecificPanel
                    properties={component.properties || {}}
                    onPropertyChange={(propName, value) => onPropertyChange(component.instanceId, `properties.${propName}`, value)}
                />
            ) : (
                <p className="text-sm text-muted-foreground">Tidak ada properti spesifik untuk komponen ini.</p>
            )}
        </div>
    );
};

export default ComponentPropertiesPanel;
