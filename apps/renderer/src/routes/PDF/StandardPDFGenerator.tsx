import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const StandardPDFGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [projectData, setProjectData] = useState({
    customerName: '',
    customerAddress: '',
    projectDescription: '',
    offerTitle: 'Photovoltaik-Angebot',
    coverLetterText: 'Sehr geehrte Damen und Herren,\n\nhiermit erhalten Sie unser Angebot für Ihre Photovoltaikanlage.',
    includeCalculations: true,
    includeComponents: true,
    includeCoverLetter: true
  });
  const [progress, setProgress] = useState(0);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      console.log('🏢 DEBUG: Loading companies for PDF generation');
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

  const generatePDF = async () => {
    if (!selectedCompany) {
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Warnung', 
        detail: 'Bitte wählen Sie eine Firma aus' 
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      console.log('📄 DEBUG: Starting PDF generation with Python backend');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Prepare data for Python backend
      const pdfConfig = {
        projectData: {
          customer_name: projectData.customerName,
          customer_address: projectData.customerAddress,
          project_description: projectData.projectDescription,
          offer_title: projectData.offerTitle,
          cover_letter_text: projectData.coverLetterText,
          company_information: selectedCompany
        },
        analysisResults: {
          // Mock analysis results - in real app, these would come from calculations
          anlage_kwp: 10.5,
          annual_pv_production_kwh: 10200,
          total_investment_brutto: 18500,
          amortization_time_years: 12.3,
          self_supply_rate_percent: 65,
          autarky_rate_percent: 42,
          simple_roi_percent: 8.2,
          npv_20_years: 25300,
          co2_savings_annual_kg: 4800
        },
        companyInfo: selectedCompany,
        inclusionOptions: {
          include_calculations: projectData.includeCalculations,
          include_components: projectData.includeComponents,
          include_cover_letter: projectData.includeCoverLetter
        }
      };

      console.log('📊 PDF Configuration:', pdfConfig);

      // Call Python backend via IPC
      if (window.pdfAPI?.generateStandardPDF) {
        const result = await window.pdfAPI.generateStandardPDF(pdfConfig);
        
        clearInterval(progressInterval);
        setProgress(100);

        if (result.success) {
          console.log('✅ PDF generated successfully');
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Erfolg', 
            detail: 'PDF wurde erfolgreich erstellt' 
          });

          // Trigger download
          if (result.pdfPath) {
            window.open(`file://${result.pdfPath}`, '_blank');
          }
        } else {
          throw new Error(result.error || 'PDF generation failed');
        }
      } else {
        throw new Error('PDF API not available');
      }

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Fehler', 
        detail: `PDF-Erstellung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}` 
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
      <div className="grid">
        <div className="col-12">
          <Card title="📄 Standard PDF-Erstellung" className="mb-4">
            <p className="text-600 mb-4">
              Erstellen Sie professionelle PDF-Angebote basierend auf den bestehenden Python-Generatoren
            </p>
            
            {isGenerating && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Fortschritt</label>
                <ProgressBar value={progress} showValue className="mb-2" />
                <p className="text-sm text-500">PDF wird generiert...</p>
              </div>
            )}
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card title="🏢 Firmenauswahl" className="mb-4">
            <div className="field">
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Firma auswählen *
              </label>
              <Dropdown
                id="company"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.value)}
                options={companies}
                optionLabel="name"
                placeholder="Firma auswählen..."
                className="w-full"
                filter
              />
            </div>

            {selectedCompany && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Ausgewählte Firma:</h4>
                <p className="text-sm m-0"><strong>{selectedCompany.name}</strong></p>
                <p className="text-sm m-0">{selectedCompany.address}</p>
                <p className="text-sm m-0">{selectedCompany.email}</p>
              </div>
            )}
          </Card>

          <Card title="👤 Kundendaten" className="mb-4">
            <div className="field mb-3">
              <label htmlFor="customerName" className="block text-sm font-medium mb-2">
                Kundenname
              </label>
              <InputText
                id="customerName"
                value={projectData.customerName}
                onChange={(e) => setProjectData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Max Mustermann"
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="customerAddress" className="block text-sm font-medium mb-2">
                Kundenadresse
              </label>
              <InputTextarea
                id="customerAddress"
                value={projectData.customerAddress}
                onChange={(e) => setProjectData(prev => ({ ...prev, customerAddress: e.target.value }))}
                placeholder="Musterstraße 123&#10;12345 Musterstadt"
                rows={3}
                className="w-full"
              />
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card title="📝 PDF-Konfiguration" className="mb-4">
            <div className="field mb-3">
              <label htmlFor="offerTitle" className="block text-sm font-medium mb-2">
                Angebots-Titel
              </label>
              <InputText
                id="offerTitle"
                value={projectData.offerTitle}
                onChange={(e) => setProjectData(prev => ({ ...prev, offerTitle: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="coverLetter" className="block text-sm font-medium mb-2">
                Anschreiben-Text
              </label>
              <InputTextarea
                id="coverLetter"
                value={projectData.coverLetterText}
                onChange={(e) => setProjectData(prev => ({ ...prev, coverLetterText: e.target.value }))}
                rows={4}
                className="w-full"
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="projectDesc" className="block text-sm font-medium mb-2">
                Projektbeschreibung
              </label>
              <InputTextarea
                id="projectDesc"
                value={projectData.projectDescription}
                onChange={(e) => setProjectData(prev => ({ ...prev, projectDescription: e.target.value }))}
                placeholder="Kurze Beschreibung des Projekts..."
                rows={3}
                className="w-full"
              />
            </div>
          </Card>

          <Card title="⚙️ Inhaltsoptionen" className="mb-4">
            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeCalculations"
                checked={projectData.includeCalculations}
                onChange={(e) => setProjectData(prev => ({ ...prev, includeCalculations: !!e.checked }))}
              />
              <label htmlFor="includeCalculations" className="ml-2">
                Berechnungen einschließen
              </label>
            </div>

            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeComponents"
                checked={projectData.includeComponents}
                onChange={(e) => setProjectData(prev => ({ ...prev, includeComponents: !!e.checked }))}
              />
              <label htmlFor="includeComponents" className="ml-2">
                Komponentenliste einschließen
              </label>
            </div>

            <div className="field-checkbox mb-3">
              <Checkbox
                inputId="includeCoverLetter"
                checked={projectData.includeCoverLetter}
                onChange={(e) => setProjectData(prev => ({ ...prev, includeCoverLetter: !!e.checked }))}
              />
              <label htmlFor="includeCoverLetter" className="ml-2">
                Anschreiben einschließen
              </label>
            </div>
          </Card>
        </div>

        <div className="col-12">
          <Card>
            <div className="flex justify-content-between align-items-center">
              <div>
                <h3 className="m-0 mb-2">PDF generieren</h3>
                <p className="text-600 m-0">
                  Erstellt ein professionelles PDF-Angebot mit den Python-Backend-Funktionen
                </p>
              </div>
              <Button
                label={isGenerating ? "Generiere PDF..." : "PDF erstellen"}
                icon={isGenerating ? "pi pi-spin pi-spinner" : "pi pi-file-pdf"}
                onClick={generatePDF}
                disabled={isGenerating || !selectedCompany}
                size="large"
                severity="success"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StandardPDFGenerator;