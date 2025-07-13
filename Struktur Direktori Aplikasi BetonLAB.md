Struktur Direktori Aplikasi BetonLAB (Lengkap & Terbaru)
Dokumen ini mencerminkan arsitektur file dan direktori aplikasi BetonLAB setelah semua pembaruan, termasuk modularisasi backend, transisi ke Vite, pengenalan state management dengan Zustand untuk Report Builder, dan penambahan berbagai fitur.
BetonLAB/  
├── public/  
│ ├── preload.js # Skrip jembatan antara proses main dan renderer Electron.  
│ └── favicon.ico # Ikon aplikasi.  
│  
├── src/  
│ ├── api/  
│ │ └── electronAPI.js # Kumpulan fungsi untuk memanggil API backend dari frontend.  
│ │  
│ ├── components/  
│ │ ├── ErrorBoundary.jsx # Komponen untuk menangani error render.  
│ │ ├── GlobalSearch.jsx # Komponen pencarian global.  
│ │ ├── ResultCard.jsx # Kartu untuk menampilkan hasil perhitungan.  
│ │ └── ui/ # Komponen UI dasar dari shadcn/ui.  
│ │ ├── alert-dialog.jsx  
│ │ ├── badge.jsx  
│ │ ├── breadcrumb.jsx  
│ │ ├── button.jsx  
│ │ ├── card.jsx  
│ │ ├── checkbox.jsx  
│ │ ├── collapsible.jsx  
│ │ ├── command.jsx  
│ │ ├── dialog.jsx  
│ │ ├── dropdown-menu.jsx  
│ │ ├── HelpTooltip.jsx  
│ │ ├── input.jsx  
│ │ ├── label.jsx  
│ │ ├── NumberInput.jsx  
│ │ ├── popover.jsx  
│ │ ├── scroll-area.jsx  
│ │ ├── SecureDeleteDialog.jsx  
│ │ ├── select.jsx  
│ │ ├── SkeletonCard.jsx  
│ │ ├── Stepper.jsx  
│ │ ├── switch.jsx  
│ │ ├── table.jsx  
│ │ ├── tabs.jsx  
│ │ ├── textarea.jsx  
│ │ ├── ToasterProvider.jsx  
│ │ ├── tooltip.jsx  
│ │ └── ValidatedInput.jsx  
│ │  
│ ├── data/  
│ │ └── sniData.js # Data statis dan konstanta berdasarkan SNI.  
│ │  
│ ├── electron/  
│ │ ├── main.js # Titik masuk utama aplikasi Electron.  
│ │ ├── database.js # Mengelola koneksi dan migrasi database.  
│ │ ├── windowManager.js # Mengelola pembuatan jendela aplikasi.  
│ │ └── ipcHandlers/ # Folder untuk semua handler proses main.  
│ │ ├── index.js # Titik pusat untuk registrasi semua handler.  
│ │ ├── appHandlers.js  
│ │ ├── fileHandlers.js  
│ │ ├── materialHandlers.js  
│ │ ├── projectHandlers.js  
│ │ ├── referenceHandlers.js  
│ │ ├── reportLayoutHandlers.js # Handler untuk Report Builder.  
│ │ └── settingsHandlers.js  
│ │  
│ ├── features/  
│ │ ├── Dashboard/  
│ │ │ └── Dashboard.jsx  
│ │ ├── Design/ # BARU: Fitur desain campuran.  
│ │ │ ├── MixDesignForm.js  
│ │ │ └── MixDesignResults.js  
│ │ ├── Gradation/ # BARU: Fitur analisis gradasi.  
│ │ │ └── GradationAnalysis.js  
│ │ ├── Materials/ # BARU: Pengganti MaterialTesting.  
│ │ │ └── MaterialManager.js  
│ │ ├── MaterialTesting/ # Fitur pengujian individual material.  
│ │ │ ├── AddMaterialDialog.jsx  
│ │ │ ├── AggregateBlending.jsx  
│ │ │ ├── BulkDensityTest.jsx  
│ │ │ ├── LosAngelesAbrasionTest.jsx  
│ │ │ ├── MaterialTestingManager.jsx  
│ │ │ ├── MoistureContentTest.jsx  
│ │ │ ├── OrganicContentTest.jsx  
│ │ │ ├── SieveAnalysisTest.jsx  
│ │ │ ├── SiltContentTest.jsx  
│ │ │ ├── SpecificGravityTest.jsx  
│ │ │ └── TestTemplateManager.jsx  
│ │ │  
│ │ ├── Onboarding/  
│ │ │ └── AppTour.jsx  
│ │ │  
│ │ ├── Projects/  
│ │ │ ├── CompressiveStrengthTest.jsx  
│ │ │ ├── JobMixDesign.jsx  
│ │ │ ├── NotesTab.jsx  
│ │ │ ├── ProjectManager.jsx  
│ │ │ ├── QualityControlChart.jsx  
│ │ │ ├── TrialComparisonView.jsx  
│ │ │ └── TrialMixView.jsx  
│ │ │  
│ │ ├── ReferenceLibrary/  
│ │ │ ├── ReferenceLibraryDialog.jsx  
│ │ │ └── ReferenceLibraryManager.jsx  
│ │ │  
│ │ ├── Reporting/  
│ │ │ ├── components/ # Komponen render untuk kanvas dan PDF.  
│ │ │ │ ├── builder/ # Komponen khusus untuk UI Report Builder.  
│ │ │ │ │ ├── CanvasArea.jsx  
│ │ │ │ │ ├── ComponentLibrary.jsx  
│ │ │ │ │ └── PropertyInspector.jsx  
│ │ │ │ ├── CombinedGradationChart.jsx  
│ │ │ │ ├── CustomImageComponent.jsx  
│ │ │ │ ├── CustomTableComponent.jsx  
│ │ │ │ ├── CustomTextComponent.jsx  
│ │ │ │ ├── HeaderComponent.jsx  
│ │ │ │ ├── JmdTableComponent.jsx  
│ │ │ │ ├── MaterialPropertiesTable.jsx  
│ │ │ │ ├── PageComponent.jsx  
│ │ │ │ ├── RawStrengthTestTable.jsx  
│ │ │ │ ├── ScriptBlockComponent.jsx  
│ │ │ │ ├── SignatureBlock.jsx  
│ │ │ │ ├── SqcChartComponent.jsx  
│ │ │ │ ├── StrengthChartComponent.jsx  
│ │ │ │ ├── StrengthSummaryTable.jsx  
│ │ │ │ ├── TrialInfoBlock.jsx  
│ │ │ │ ├── TrialLoopingSection.jsx  
│ │ │ │ └── VerticalSpacer.jsx  
│ │ │ ├── pdf_components/ # Komponen yang dioptimalkan untuk rendering PDF.  
│ │ │ │ ├── CustomTextPdf.jsx  
│ │ │ │ ├── HeaderPdf.jsx  
│ │ │ │ ├── JmdTablePdf.jsx  
│ │ │ │ ├── RawStrengthTestTablePdf.jsx  
│ │ │ │ └── SignatureBlockPdf.jsx  
│ │ │ ├── AssetManager.jsx  
│ │ │ ├── reportComponents.jsx  
│ │ │ ├── ReportBuilderPage.jsx  
│ │ │ ├── ReportBuilderV2.jsx  
│ │ │ ├── ReportingHubDialog.jsx  
│ │ │ ├── ReportPreview.jsx  
│ │ │ ├── ReportPreviewModal.jsx  
│ │ │ └── ReportTemplateBuilder.jsx  
│ │ │  
│ │ └── Settings/  
│ │ └── SettingsPage.jsx  
│ │  
│ ├── hooks/ # Kumpulan custom hooks untuk state management.  
│ │ ├── useActiveMaterialProperties.js  
│ │ ├── useAllTrials.js  
│ │ ├── useConcreteTests.js & useConcreteTests.test.js  
│ │ ├── useMaterials.js  
│ │ ├── useMaterialTests.js & useMaterialTests.test.js  
│ │ ├── useNotifier.js  
│ │ ├── useNotifications.js  
│ │ ├── useProjects.js & useProjects.test.js  
│ │ ├── useReferenceDocuments.js  
│ │ ├── useReportBuilderStore.js  
│ │ ├── useReportLayouts.js  
│ │ ├── useSettings.js  
│ │ ├── useTestTemplates.js  
│ │ ├── useTrials.js  
│ │ └── useValidation.js  
│ │  
│ ├── lib/  
│ │ └── utils.js # Utilitas umum (cn).  
│ │  
│ ├── utils/  
│ │ ├── concreteCalculator.js & concreteCalculator.test.js  
│ │ ├── csvExporter.js & csvExporter.test.js  
│ │ ├── htmlGenerator.js # BARU: Generator HTML untuk laporan.  
│ │ ├── pdfGenerator.jsx # Utilitas untuk membuat PDF dari layout.  
│ │ └── reporting/  
│ │ └── reportUtils.js # Fungsi utilitas khusus untuk pelaporan.  
│ │  
│ ├── App.jsx # Komponen root aplikasi React.  
│ ├── index.css # File CSS utama dengan TailwindCSS.  
│ └── index.jsx # Titik masuk untuk aplikasi React.  
│  
├── .gitignore  
├── index.html # Shell HTML utama (digunakan oleh Vite).  
├── package.json # Dependensi dan skrip proyek.  
├── README.md  
├── Struktur Direktori Aplikasi BetonLAB.md # File ini.  
├── tailwind.config.js # Konfigurasi TailwindCSS.  
└── vite.config.js # Konfigurasi untuk build tool Vite.
