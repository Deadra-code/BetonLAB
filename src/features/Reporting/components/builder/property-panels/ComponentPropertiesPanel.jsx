// src/features/Reporting/components/builder/property-panels/ComponentPropertiesPanel.jsx
// Deskripsi: Komponen ini bertindak sebagai dispatcher, memilih dan merender panel properti
// yang sesuai berdasarkan ID komponen yang dipilih. Diperbarui dengan semua panel baru.

import React from 'react';
import {
    TextPanel,
    ColumnsPanel,
    JmdTablePanel,
    GenericTablePanel,
    GenericChartPanel,
    SignaturePanel,
    HeaderPanel,
    InfoBlockPanel,
    RawStrengthTablePanel,
    DynamicPlaceholderPanel,
    ImagePanel,
    QrCodePanel,
    LocationDatePanel,
    CustomTablePanel,
    LineSpacerPanel,
    VerticalSpacerPanel,
    FooterPanel
} from './SpecificPanels';

const panelMapping = {
    'header': HeaderPanel,
    'client-info-block': InfoBlockPanel,
    'trial-info-block': InfoBlockPanel,
    'raw-strength-table': RawStrengthTablePanel,
    'dynamic-placeholder': DynamicPlaceholderPanel,
    'custom-image': ImagePanel,
    'qr-code': QrCodePanel,
    'location-date': LocationDatePanel, // BARU
    'custom-table': CustomTablePanel, // DIPERBARUI
    'horizontal-line': LineSpacerPanel,
    'vertical-spacer': VerticalSpacerPanel,
    'footer': FooterPanel,
    // Komponen yang sudah ada sebelumnya
    'custom-text': TextPanel,
    'columns': ColumnsPanel,
    'jmd-table': JmdTablePanel,
    'material-properties-table': GenericTablePanel,
    'strength-summary-table': GenericTablePanel,
    'strength-chart': GenericChartPanel,
    'sqc-chart': GenericChartPanel,
    'combined-gradation-chart': GenericChartPanel,
    'signature-block': SignaturePanel,
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
