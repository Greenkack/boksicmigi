import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { useRef } from 'react';

interface Company {
  id: number;
  name: string;
  address: string;
  email: string;
  phone?: string;
}

interface MultiPDFConfig {
  baseProjectData: {
    customerName: string;
    customerAddress: string;
    projectDescription: string;
    systemSizeKwp: number;
    annualConsumption: number;
  };
  selectedCompanies: Company[];
  pdfOptions: {
    includeCalculations: boolean;
    includeComponents: boolean;
    includeCoverLetter: boolean;
    includeComparison: boolean;
  };
}

const MultiPDFGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [config, setConfig] = useState<MultiPDFConfig>({
    baseProjectData: {
      customerName: '',
      customerAddress: '',
      projectDescription: '',
      systemSizeKwp: 10,
      annualConsumption: 4000
    },
    selectedCompanies: [],
    pdfOptions: {
      includeCalculations: true,
      includeComponents: true,
      includeCoverLetter: true,
      includeComparison: true
    }
  });
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      console.log('🏢 DEBUG: Loading companies for Multi-PDF generation');
      if (window.databaseAPI?.listCompanies) {
        const companiesData = await window.databaseAPI.listCompanies();
        console.log('✅ Companies loaded:', companiesData);
        setCompanies(companiesData || []);
      } else {
        console.warn('⚠️ Database API not available for companies');
      }
    } catch (error) {
      console.error('❌ Error loading companies:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Fehler', 
        detail: 'Firmen konnten nicht geladen werden' 
      });
    }
  };

  const generateMultiPDFs = async () => {
    if (config.selectedCompanies.length === 0) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Warnung', 
        detail: 'Bitte wählen Sie mindestens eine Firma aus' 
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationResults([]);

    try {
      console.log('📄📄 DEBUG: Starting Multi-PDF generation with Python backend');
      console.log('Selected companies:', config.selectedCompanies);
      console.log('Project data:', config.baseProjectData);

      // Prepare data for Python multi_offer_generator.py
      const multiPDFConfig = {
        project_data: {
          customer_name: config.baseProjectData.customerName,
          customer_address: config.baseProjectData.customerAddress,
          project_description: config.baseProjectData.projectDescription,
          anlage_kwp: config.baseProjectData.systemSizeKwp,
          annual_consumption_kwh: config.baseProjectData.annualConsumption
        },
        selected_companies: config.selectedCompanies.map(company => ({
          id: company.id,
          name: company.name,
          address: company.address,
          email: company.email,
          phone: company.phone
        })),
        generation_options: {
          include_calculations: config.pdfOptions.includeCalculations,
          include_components: config.pdfOptions.includeComponents,
          include_cover_letter: config.pdfOptions.includeCoverLetter,
          include_comparison: config.pdfOptions.includeComparison,
          use_modern_design: true
        }
      };

      console.log('📊 Multi-PDF Configuration:', multiPDFConfig);

      // Simulate progress for each company
      const totalSteps = config.selectedCompanies.length;
      let currentStep = 0;

      // Call Python backend via IPC
      if (window.pdfAPI?.generateMultiPDF) {
        const result = await window.pdfAPI.generateMultiPDF(multiPDFConfig, (progress: any) => {
          // Progress callback
          console.log('Progress update:', progress);
          setGenerationProgress((progress.completed / progress.total) * 100);
        });

        if (result.success) {
          console.log('✅ Multi-PDF generated successfully');
          setGenerationResults(result.results || []);
          
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Erfolg', 
            detail: `${result.results?.length || 0} PDFs wurden erfolgreich erstellt` 
          });

          // Auto-download ZIP if available
          if (result.zipPath) {
            window.open(`file://${result.zipPath}`, '_blank');
          }

        } else {
          throw new Error(result.error || 'Multi-PDF generation failed');
        }
      } else {
        // Fallback: simulate progress and show mock results
        console.warn('⚠️ PDF API not available, simulating generation');
        
        for (const company of config.selectedCompanies) {
          currentStep++;
          setGenerationProgress((currentStep / totalSteps) * 100);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Add mock result
          setGenerationResults(prev => [...prev, {
            companyId: company.id,
            companyName: company.name,
            status: 'success',
            fileName: `angebot_${company.name.replace(/\s+/g, '_').toLowerCase()}.pdf`,
            fileSize: Math.floor(Math.random() * 500) + 200 + ' KB',
            generatedAt: new Date().toISOString()
          }]);
        }

        toast.current?.show({ 
          severity: 'info', 
          summary: 'Simulation', 
          detail: 'Multi-PDF Generierung simuliert (Backend nicht verfügbar)' 
        });
      }

    } catch (error) {
      console.error('❌ Multi-PDF generation error:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Fehler', 
        detail: `Multi-PDF-Erstellung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` 
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const statusBodyTemplate = (rowData: any) => {
    return <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />;
  };

  const actionBodyTemplate = (rowData: any) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-download"
          size="small"
          severity="secondary"
          tooltip="PDF herunterladen"
          onClick={() => {
            console.log('Download PDF for:', rowData.companyName);
            toast.current?.show({ 
              severity: 'info', 
              summary: 'Download', 
              detail: `Download für ${rowData.companyName} gestartet` 
            });
          }}
        />
        <Button
          icon="pi pi-eye"
          size="small"
          severity="info"
          tooltip="PDF vorschau"
          onClick={() => {
            console.log('Preview PDF for:', rowData.companyName);
            toast.current?.show({ 
              severity: 'info', 
              summary: 'Vorschau', 
              detail: `Vorschau für ${rowData.companyName}` 
            });
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
      <div className="grid">
        <div className="col-12">
          <Card title="📄📄 Multi-PDF Generator" className="mb-4">
            <p className="text-600 mb-4">
              Erstellen Sie mehrere PDF-Angebote für verschiedene Firmen basierend auf dem Python multi_offer_generator.py
            </p>
            
            {isGenerating && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Fortschritt</label>
                <ProgressBar value={generationProgress} showValue className="mb-2" />
                <p className="text-sm text-500">
                  PDFs werden generiert... ({Math.round(generationProgress)}%)
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card title="🏢 Firmenauswahl" className="mb-4">
            <div className="field">
              <label htmlFor="companies" className="block text-sm font-medium mb-2">
                Firmen auswählen (mehrere möglich) *
              </label>
              <MultiSelect
                id="companies"
                value={config.selectedCompanies}
                onChange={(e) => setConfig(prev => ({ ...prev, selectedCompanies: e.value }))}
                options={companies}
                optionLabel="name"
                placeholder="Firmen auswählen..."
                className="w-full"
                filter
                display="chip"
                maxSelectedLabels={3}
              />
            </div>

            {config.selectedCompanies.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">
                  {config.selectedCompanies.length} Firma(en) ausgewählt:
                </h4>
                {config.selectedCompanies.map((company, index) => (
                  <p key={company.id} className="text-sm m-0 mb-1">
                    {index + 1}. <strong>{company.name}</strong>
                  </p>
                ))}
              </div>
            )}
          </Card>

          <Card title="⚙️ PDF-Optionen" className="mb-4">
            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeCalculations"
                checked={config.pdfOptions.includeCalculations}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  pdfOptions: { ...prev.pdfOptions, includeCalculations: !!e.checked }
                }))}
              />
              <label htmlFor="includeCalculations" className="ml-2">
                Berechnungen einschließen
              </label>
            </div>

            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeComponents"
                checked={config.pdfOptions.includeComponents}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  pdfOptions: { ...prev.pdfOptions, includeComponents: !!e.checked }
                }))}
              />
              <label htmlFor="includeComponents" className="ml-2">
                Komponentenliste einschließen
              </label>
            </div>

            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeCoverLetter"
                checked={config.pdfOptions.includeCoverLetter}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  pdfOptions: { ...prev.pdfOptions, includeCoverLetter: !!e.checked }
                }))}
              />
              <label htmlFor="includeCoverLetter" className="ml-2">
                Anschreiben einschließen
              </label>
            </div>

            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeComparison"
                checked={config.pdfOptions.includeComparison}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  pdfOptions: { ...prev.pdfOptions, includeComparison: !!e.checked }
                }))}
              />
              <label htmlFor="includeComparison" className="ml-2">
                Firmenvergleich einschließen
              </label>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card title="👤 Basis-Projektdaten" className="mb-4">
            <div className="field mb-3">
              <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                Kundenname *
              </label>
              <InputText
                id="customerName"
                value={config.baseProjectData.customerName}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  baseProjectData: { ...prev.baseProjectData, customerName: e.target.value }
                }))}
                placeholder="Max Mustermann"
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="customerAddress" className="block text-sm font-medium mb-2">
                Kundenadresse *
              </label>
              <InputText
                id="customerAddress"
                value={config.baseProjectData.customerAddress}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  baseProjectData: { ...prev.baseProjectData, customerAddress: e.target.value }
                }))}
                placeholder="Musterstraße 123, 12345 Musterstadt"
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="systemSize" className="block text-sm font-medium mb-2">
                Anlagengröße (kWp) *
              </label>
              <InputNumber
                id="systemSize"
                value={config.baseProjectData.systemSizeKwp}
                onValueChange={(e) => setConfig(prev => ({
                  ...prev,
                  baseProjectData: { ...prev.baseProjectData, systemSizeKwp: e.value || 10 }
                }))}
                min={1}
                max={100}
                suffix=" kWp"
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="annualConsumption" className="block text-sm font-medium mb-2">
                Jahresverbrauch (kWh) *
              </label>
              <InputNumber
                id="annualConsumption"
                value={config.baseProjectData.annualConsumption}
                onValueChange={(e) => setConfig(prev => ({
                  ...prev,
                  baseProjectData: { ...prev.baseProjectData, annualConsumption: e.value || 4000 }
                }))}
                min={1000}
                max={50000}
                suffix=" kWh"
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="projectDesc" className="block text-sm font-medium mb-2">
                Projektbeschreibung
              </label>
              <InputText
                id="projectDesc"
                value={config.baseProjectData.projectDescription}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  baseProjectData: { ...prev.baseProjectData, projectDescription: e.target.value }
                }))}
                placeholder="Photovoltaikanlage mit Speicher"
                className="w-full"
              />
            </div>
          </Card>
        </div>

        <div className="col-12">
          <Card className="mb-4">
            <div className="flex justify-content-between align-items-center">
              <div>
                <h3 className="m-0 mb-2">Multi-PDF generieren</h3>
                <p className="text-600 m-0">
                  Erstellt PDF-Angebote für alle ausgewählten Firmen mit dem Python multi_offer_generator.py
                </p>
              </div>
              <Button
                label={isGenerating ? "Generiere PDFs..." : "PDFs erstellen"}
                icon={isGenerating ? "pi pi-spin pi-spinner" : "pi pi-file-pdf"}
                onClick={generateMultiPDFs}
                disabled={isGenerating || config.selectedCompanies.length === 0}
                size="large"
                severity="success"
              />
            </div>
          </Card>
        </div>

        {generationResults.length > 0 && (
          <div className="col-12">
            <Card title="📋 Generierungsergebnisse">
              <DataTable 
                value={generationResults} 
                stripedRows 
                responsiveLayout="scroll"
                emptyMessage="Keine Ergebnisse vorhanden"
              >
                <Column field="companyName" header="Firma" sortable />
                <Column field="fileName" header="Dateiname" />
                <Column field="fileSize" header="Größe" />
                <Column field="status" header="Status" body={statusBodyTemplate} />
                <Column header="Aktionen" body={actionBodyTemplate} />
              </DataTable>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiPDFGenerator;