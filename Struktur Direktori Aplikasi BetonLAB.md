Struktur Direktori Aplikasi BetonLAB (Lengkap & Terbaru)
Dokumen ini mencerminkan arsitektur file dan direktori aplikasi BetonLAB setelah semua pembaruan, termasuk modularisasi backend, transisi Report Builder menjadi halaman, dan penambahan fitur kesinambungan alur kerja.
BetonLAB/  
├── public/  
│   ├── preload.js                  # Skrip jembatan antara proses main dan renderer Electron  
│   └── index.html                  # Shell HTML utama untuk aplikasi React  
│  
├── src/  
│   ├── api/  
│   │   └── electronAPI.js            # Kumpulan fungsi untuk memanggil API backend dari frontend  
│   │  
│   ├── components/  
│   │   ├── GlobalSearch.js  
│   │   ├── ResultCard.js  
│   │   └── ui/                       # Komponen UI dasar dari shadcn/ui  
│   │       ├── alert-dialog.jsx  
│   │       ├── badge.jsx  
│   │       ├── breadcrumb.jsx  
│   │       ├── button.jsx  
│   │       ├── card.jsx  
│   │       ├── checkbox.jsx  
│   │       ├── collapsible.jsx       # BARU: Komponen untuk akordion  
│   │       ├── command.jsx  
│   │       ├── dialog.jsx  
│   │       ├── dropdown-menu.jsx  
│   │       ├── HelpTooltip.jsx  
│   │       ├── input.jsx  
│   │       ├── label.jsx  
│   │       ├── NumberInput.jsx  
│   │       ├── popover.jsx  
│   │       ├── scroll-area.jsx  
│   │       ├── SecureDeleteDialog.jsx  
│   │       ├── select.jsx  
│   │       ├── SkeletonCard.jsx  
│   │       ├── Stepper.jsx  
│   │       ├── switch.jsx  
│   │       ├── table.jsx  
│   │       ├── tabs.jsx  
│   │       ├── textarea.jsx  
│   │       ├── ToasterProvider.jsx  
│   │       ├── tooltip.jsx  
│   │       └── ValidatedInput.jsx  
│   │  
│   ├── data/  
│   │   └── sniData.js                  # Data statis dan konstanta berdasarkan SNI  
│   │  
│   ├── electron/  
│   │   ├── main.js                     # Titik masuk utama aplikasi Electron  
│   │   ├── database.js                 # Mengelola koneksi dan migrasi database  
│   │   ├── windowManager.js            # Mengelola pembuatan jendela aplikasi  
│   │   └── ipcHandlers/                # Folder untuk semua handler proses main  
│   │       ├── index.js  
│   │       ├── appHandlers.js  
│   │       ├── fileHandlers.js  
│   │       ├── materialHandlers.js  
│   │       ├── projectHandlers.js  
│   │       ├── referenceHandlers.js  
│   │       ├── reportLayoutHandlers.js # BARU: Handler untuk Report Builder v3.0  
│   │       ├── reportTemplateHandlers.js # (Lama, akan dihapus)  
│   │       └── settingsHandlers.js  
│   │  
│   ├── features/  
│   │   ├── Dashboard/  
│   │   │   └── Dashboard.js  
│   │   │  
│   │   ├── MaterialTesting/  
│   │   │   ├── AddMaterialDialog.jsx   # BARU: Dialog akses cepat  
│   │   │   ├── AggregateBlending.js  
│   │   │   ├── BulkDensityTest.js  
│   │   │   ├── LosAngelesAbrasionTest.js  
│   │   │   ├── MaterialTestingManager.js  
│   │   │   ├── MoistureContentTest.js  
│   │   │   ├── OrganicContentTest.js  
│   │   │   ├── SieveAnalysisTest.js  
│   │   │   ├── SiltContentTest.js  
│   │   │   ├── SpecificGravityTest.js  
│   │   │   └── TestTemplateManager.js  
│   │   │  
│   │   ├── Onboarding/  
│   │   │   └── AppTour.jsx  
│   │   │  
│   │   ├── Projects/  
│   │   │   ├── CompressiveStrengthTest.js  
│   │   │   ├── JobMixDesign.js  
│   │   │   ├── NotesTab.js  
│   │   │   ├── ProjectManager.js  
│   │   │   ├── QualityControlChart.js  
│   │   │   └── TrialComparisonView.js  
│   │   │  
│   │   ├── ReferenceLibrary/  
│   │   │   ├── ReferenceLibraryDialog.jsx # BARU: Dialog akses cepat  
│   │   │   └── ReferenceLibraryManager.js  
│   │   │  
│   │   ├── Reporting/  
│   │   │   ├── components/             # BARU: Direktori untuk komponen render laporan  
│   │   │   │   ├── CustomImageComponent.jsx  
│   │   │   │   ├── CustomTextComponent.jsx  
│   │   │   │   ├── HeaderComponent.jsx  
│   │   │   │   ├── JmdTableComponent.jsx  
│   │   │   │   ├── PageComponent.jsx  
│   │   │   │   ├── RawStrengthTestTable.jsx  
│   │   │   │   ├── SignatureBlock.jsx  
│   │   │   │   └── TrialLoopingSection.jsx  
│   │   │   ├── reportComponents.js     # "Pabrik" untuk komponen kanvas  
│   │   │   ├── ReportBuilderPage.jsx   # BARU: Halaman utama Report Builder  
│   │   │   └── ReportBuilderV2.jsx       # (Lama, akan digantikan oleh Page)  
│   │   │  
│   │   └── Settings/  
│   │       └── SettingsPage.js  
│   │  
│   ├── hooks/  
│   │   ├── useActiveMaterialProperties.js  
│   │   ├── useConcreteTests.js  
│   │   ├── useMaterials.js  
│   │   ├── useMaterialTests.js  
│   │   ├── useNotifier.js  
│   │   ├── useNotifications.js  
│   │   ├── useProjects.js  
│   │   ├── useReferenceDocuments.js  
│   │   ├── useReportLayouts.js         # BARU: Hook untuk Report Builder v3.0  
│   │   ├── useReportTemplates.js     # (Lama, akan dihapus)  
│   │   ├── useSettings.js  
│   │   ├── useTestTemplates.js  
│   │   ├── useTrials.js  
│   │   └── useValidation.js  
│   │  
│   ├── lib/  
│   │   └── utils.js  
│   │  
│   ├── utils/  
│   │   ├── concreteCalculator.js  
│   │   ├── concreteCalculator.test.js  
│   │   ├── csvExporter.js  
│   │   └── pdfGenerator.js  
│   │  
│   ├── App.js  
│   ├── ErrorBoundary.jsx  
│   ├── index.css  
│   └── index.js  
│  
├── .gitignore  
├── package.json  
└── tailwind.config.js