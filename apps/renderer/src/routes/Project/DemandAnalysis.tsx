import React, { useState, useEffect, useRef } from 'react';
import WizardNav from '../../components/WizardNav';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { Carousel } from 'primereact/carousel';

// Mock useProjectData hook until context is available
const useProjectData = () => ({
  projectData: { 
    consumption: {
      annualKWhHousehold: undefined as number | undefined,
      monthlyCostHouseholdEuro: undefined as number | undefined,
      annualKWhHeating: undefined as number | undefined,
      monthlyCostHeatingEuro: undefined as number | undefined,
      currentHeatingType: undefined as string | undefined,
      heatingAge: undefined as number | undefined,
      fuelType: undefined as string | undefined,
      householdSize: undefined as number | undefined,
      homeOfficeHours: undefined as number | undefined,
      electricAppliances: undefined as string | undefined,
      zukunft_epump: undefined as boolean | undefined,
      zukunft_wallbox: undefined as boolean | undefined,
      zukunft_pool: undefined as boolean | undefined,
      zukunft_sauna: undefined as boolean | undefined,
      zukunft_klima: undefined as boolean | undefined,
      zukunft_erweiterung: undefined as boolean | undefined,
      epump_verbrauch_schaetzung: undefined as number | undefined,
      wallbox_verbrauch_schaetzung: undefined as number | undefined,
      pool_verbrauch_schaetzung: undefined as number | undefined,
      eigenverbrauch_maximieren: undefined as boolean | undefined,
      netzeinspeisung_begrenzen: undefined as boolean | undefined,
      backup_wichtig: undefined as boolean | undefined,
      umwelt_prioritaet: undefined as boolean | undefined
    }
  },
  updateProjectData: (data: any) => console.log('Update project data:', data)
});

const toNumberOrNull = (value: string): number | null => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

export default function DemandAnalysis() {
  const { projectData, updateProjectData } = useProjectData();
  const toast = useRef<Toast>(null);

  // State variables
  const [annualKWhHousehold, setAnnualKWhHousehold] = useState<string>(
    projectData.consumption?.annualKWhHousehold?.toString() || ''
  );
  const [monthlyCostHouseholdEuro, setMonthlyCostHouseholdEuro] = useState<string>(
    projectData.consumption?.monthlyCostHouseholdEuro?.toString() || ''
  );
  const [annualKWhHeating, setAnnualKWhHeating] = useState<string>(
    projectData.consumption?.annualKWhHeating?.toString() || ''
  );
  const [monthlyCostHeatingEuro, setMonthlyCostHeatingEuro] = useState<string>(
    projectData.consumption?.monthlyCostHeatingEuro?.toString() || ''
  );
  const [currentHeatingType, setCurrentHeatingType] = useState<string>(
    projectData.consumption?.currentHeatingType || ''
  );
  const [heatingAge, setHeatingAge] = useState<string>(
    projectData.consumption?.heatingAge?.toString() || ''
  );
  const [fuelType, setFuelType] = useState<string>(
    projectData.consumption?.fuelType || ''
  );
  const [householdSize, setHouseholdSize] = useState<string>(
    projectData.consumption?.householdSize?.toString() || ''
  );
  const [homeOfficeHours, setHomeOfficeHours] = useState<string>(
    projectData.consumption?.homeOfficeHours?.toString() || ''
  );
  const [electricAppliances, setElectricAppliances] = useState<string>(
    projectData.consumption?.electricAppliances || ''
  );

  // Zukunftsplanung
  const [zukunft_epump, setZukunftEpump] = useState<boolean>(
    projectData.consumption?.zukunft_epump || false
  );
  const [zukunft_wallbox, setZukunftWallbox] = useState<boolean>(
    projectData.consumption?.zukunft_wallbox || false
  );
  const [zukunft_pool, setZukunftPool] = useState<boolean>(
    projectData.consumption?.zukunft_pool || false
  );
  const [zukunft_sauna, setZukunftSauna] = useState<boolean>(
    projectData.consumption?.zukunft_sauna || false
  );
  const [zukunft_klima, setZukunftKlima] = useState<boolean>(
    projectData.consumption?.zukunft_klima || false
  );
  const [zukunft_erweiterung, setZukunftErweiterung] = useState<boolean>(
    projectData.consumption?.zukunft_erweiterung || false
  );

  // Verbrauchsschätzungen
  const [epump_verbrauch_schaetzung, setEpumpVerbrauchSchaetzung] = useState<string>(
    projectData.consumption?.epump_verbrauch_schaetzung?.toString() || ''
  );
  const [wallbox_verbrauch_schaetzung, setWallboxVerbrauchSchaetzung] = useState<string>(
    projectData.consumption?.wallbox_verbrauch_schaetzung?.toString() || ''
  );
  const [pool_verbrauch_schaetzung, setPoolVerbrauchSchaetzung] = useState<string>(
    projectData.consumption?.pool_verbrauch_schaetzung?.toString() || ''
  );

  // Präferenzen
  const [eigenverbrauch_maximieren, setEigenverbrauchMaximieren] = useState<boolean>(
    projectData.consumption?.eigenverbrauch_maximieren || false
  );
  const [netzeinspeisung_begrenzen, setNetzeinspeisung_begrenzen] = useState<boolean>(
    projectData.consumption?.netzeinspeisung_begrenzen || false
  );
  const [backup_wichtig, setBackupWichtig] = useState<boolean>(
    projectData.consumption?.backup_wichtig || false
  );
  const [umwelt_prioritaet, setUmweltPrioritaet] = useState<boolean>(
    projectData.consumption?.umwelt_prioritaet || false
  );

  // Progress calculation
  const calculateProgress = () => {
    const fields = [
      annualKWhHousehold, monthlyCostHouseholdEuro, currentHeatingType, 
      householdSize, homeOfficeHours, electricAppliances
    ];
    const filledFields = fields.filter(field => field && field.toString().trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const progressValue = calculateProgress();

  // Dropdown Options
  const heatingTypeOptions = [
    { label: 'Gasheizung', value: 'Gas' },
    { label: 'Ölheizung', value: 'Öl' },
    { label: 'Wärmepumpe', value: 'Wärmepumpe' },
    { label: 'Fernwärme', value: 'Fernwärme' },
    { label: 'Pelletheizung', value: 'Pellets' },
    { label: 'Stromheizung', value: 'Strom' },
    { label: 'Andere', value: 'Andere' }
  ];

  const fuelTypeOptions = [
    { label: 'Erdgas', value: 'Erdgas' },
    { label: 'Flüssiggas', value: 'Flüssiggas' },
    { label: 'Heizöl', value: 'Heizöl' },
    { label: 'Pellets', value: 'Pellets' },
    { label: 'Strom', value: 'Strom' },
    { label: 'Andere', value: 'Andere' }
  ];

  const householdSizeOptions = [
    { label: '1 Person', value: '1' },
    { label: '2 Personen', value: '2' },
    { label: '3 Personen', value: '3' },
    { label: '4 Personen', value: '4' },
    { label: '5+ Personen', value: '5' }
  ];

  const applianceOptions = [
    { label: 'Standard', value: 'Standard' },
    { label: 'Wenige Geräte', value: 'Wenig' },
    { label: 'Viele Geräte', value: 'Viel' },
    { label: 'Hochverbrauch', value: 'Hochverbrauch' }
  ];

  // Feature highlights for carousel
  const features = [
    {
      icon: 'pi-chart-line',
      title: 'Verbrauchsanalyse',
      description: 'Ermittlung Ihres aktuellen Energieverbrauchs',
      color: 'blue'
    },
    {
      icon: 'pi-calendar',
      title: 'Zukunftsplanung',
      description: 'Berücksichtigung geplanter Erweiterungen',
      color: 'green'
    },
    {
      icon: 'pi-cog',
      title: 'Heizungsanalyse',
      description: 'Bewertung Ihres aktuellen Heizsystems',
      color: 'orange'
    },
    {
      icon: 'pi-home',
      title: 'Haushaltsoptimierung',
      description: 'Anpassung an Ihre Lebenssituation',
      color: 'purple'
    }
  ];

  const featureTemplate = (feature: any) => (
    <div className={`p-4 text-center bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-lg border hover:shadow-md transition-all`}>
      <i className={`pi ${feature.icon} text-3xl text-${feature.color}-600 mb-3 block`}></i>
      <h3 className="font-bold mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-600">{feature.description}</p>
    </div>
  );

  const showSuccessToast = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Gespeichert',
      detail: 'Bedarfsanalyse wurde erfolgreich gespeichert!',
      life: 3000
    });
  };

  // Validation
  const requiredOk = annualKWhHousehold && householdSize && currentHeatingType;

  const handleSave = () => {
    if (!requiredOk) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validierungsfehler',
        detail: 'Bitte füllen Sie alle Pflichtfelder aus',
        life: 4000
      });
      return;
    }

    const consumptionData = {
      annualKWhHousehold: toNumberOrNull(annualKWhHousehold),
      monthlyCostHouseholdEuro: toNumberOrNull(monthlyCostHouseholdEuro),
      annualKWhHeating: toNumberOrNull(annualKWhHeating),
      monthlyCostHeatingEuro: toNumberOrNull(monthlyCostHeatingEuro),
      currentHeatingType,
      heatingAge: toNumberOrNull(heatingAge),
      fuelType,
      householdSize: toNumberOrNull(householdSize),
      homeOfficeHours: toNumberOrNull(homeOfficeHours),
      electricAppliances,
      zukunft_epump,
      zukunft_wallbox,
      zukunft_pool,
      zukunft_sauna,
      zukunft_klima,
      zukunft_erweiterung,
      epump_verbrauch_schaetzung: toNumberOrNull(epump_verbrauch_schaetzung),
      wallbox_verbrauch_schaetzung: toNumberOrNull(wallbox_verbrauch_schaetzung),
      pool_verbrauch_schaetzung: toNumberOrNull(pool_verbrauch_schaetzung),
      eigenverbrauch_maximieren,
      netzeinspeisung_begrenzen,
      backup_wichtig,
      umwelt_prioritaet
    };

    updateProjectData({ consumption: consumptionData });
    showSuccessToast();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Toast ref={toast} />
      
      {/* Hero Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <i className="pi pi-chart-line text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Bedarfsanalyse</h1>
                <p className="text-indigo-100 text-lg">Analyse Ihres Energieverbrauchs und zukünftiger Anforderungen</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progressValue}%</div>
              <div className="text-sm text-indigo-200">Vollständigkeit</div>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar 
              value={progressValue} 
              className="h-3 bg-white/20 rounded-lg overflow-hidden"
              style={{backgroundColor: 'rgba(255,255,255,0.2)'}}
            />
          </div>
        </div>
      </Card>

      {/* Feature Highlights Carousel */}
      <Card className="shadow-lg border-0">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 text-center text-gray-800">Analysebereiche</h3>
          <Carousel 
            value={features} 
            itemTemplate={featureTemplate}
            numVisible={4}
            numScroll={1}
            responsiveOptions={[
              { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
              { breakpoint: '768px', numVisible: 2, numScroll: 1 },
              { breakpoint: '560px', numVisible: 1, numScroll: 1 }
            ]}
            circular
            autoplayInterval={4000}
          />
        </div>
      </Card>

      {/* Haushaltsstrom Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-home text-blue-500 text-xl"></i>
            <span className="text-xl font-bold">Haushaltsstrom</span>
            {annualKWhHousehold && <Badge value="Eingegeben" severity="info" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <Field label="Jährlicher Stromverbrauch (kWh) *" icon="pi-bolt">
            <InputText
              value={annualKWhHousehold}
              onChange={(e) => setAnnualKWhHousehold(e.target.value)}
              placeholder="z.B. 4500"
              className={`w-full transition-colors ${!annualKWhHousehold ? 'hover:border-red-400' : 'hover:border-blue-400'}`}
              tooltip="Ihr jährlicher Stromverbrauch in kWh"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Monatliche Stromkosten (€)" icon="pi-euro">
            <InputText
              value={monthlyCostHouseholdEuro}
              onChange={(e) => setMonthlyCostHouseholdEuro(e.target.value)}
              placeholder="z.B. 120"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Ihre monatlichen Stromkosten in Euro"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Haushaltsgröße *" icon="pi-users">
            <Dropdown 
              value={householdSize}
              options={householdSizeOptions}
              onChange={(e) => setHouseholdSize(e.value)}
              placeholder="Anzahl Personen wählen"
              className={`w-full transition-colors ${!householdSize ? 'hover:border-red-400' : 'hover:border-blue-400'}`}
              tooltip="Anzahl der im Haushalt lebenden Personen"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Home-Office Stunden/Woche" icon="pi-desktop">
            <InputText
              value={homeOfficeHours}
              onChange={(e) => setHomeOfficeHours(e.target.value)}
              placeholder="z.B. 20"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Stunden pro Woche im Home-Office"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Elektrische Geräte" icon="pi-cog">
            <Dropdown 
              value={electricAppliances}
              options={applianceOptions}
              onChange={(e) => setElectricAppliances(e.value)}
              placeholder="Geräteausstattung wählen"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Umfang Ihrer elektrischen Geräte"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Heizung Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-sun text-orange-500 text-xl"></i>
            <span className="text-xl font-bold">Heizungssystem</span>
            {currentHeatingType && <Badge value="Konfiguriert" severity="warning" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <Field label="Aktueller Heizungstyp *" icon="pi-home">
            <Dropdown 
              value={currentHeatingType}
              options={heatingTypeOptions}
              onChange={(e) => setCurrentHeatingType(e.value)}
              placeholder="Heizungstyp wählen"
              className={`w-full transition-colors ${!currentHeatingType ? 'hover:border-red-400' : 'hover:border-orange-400'}`}
              tooltip="Ihr aktuell installiertes Heizsystem"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Brennstofftyp" icon="pi-eye">
            <Dropdown 
              value={fuelType}
              options={fuelTypeOptions}
              onChange={(e) => setFuelType(e.value)}
              placeholder="Brennstoff wählen"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Art des verwendeten Brennstoffs"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Alter der Heizung (Jahre)" icon="pi-calendar">
            <InputText
              value={heatingAge}
              onChange={(e) => setHeatingAge(e.target.value)}
              placeholder="z.B. 15"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Alter Ihrer Heizungsanlage in Jahren"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Jährliche Heizkosten (kWh)" icon="pi-chart-bar">
            <InputText
              value={annualKWhHeating}
              onChange={(e) => setAnnualKWhHeating(e.target.value)}
              placeholder="z.B. 15000"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Jährlicher Energieverbrauch für Heizung"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Monatliche Heizkosten (€)" icon="pi-euro">
            <InputText
              value={monthlyCostHeatingEuro}
              onChange={(e) => setMonthlyCostHeatingEuro(e.target.value)}
              placeholder="z.B. 150"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Durchschnittliche monatliche Heizkosten"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Zukunftsplanung Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-forward text-green-500 text-xl"></i>
            <span className="text-xl font-bold">Zukünftige Erweiterungen</span>
            {(zukunft_epump || zukunft_wallbox || zukunft_pool) && <Badge value="Geplant" severity="success" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
      >
        <div className="space-y-6 p-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="zukunft_epump" 
                checked={zukunft_epump} 
                onChange={(e) => setZukunftEpump(e.checked || false)}
                className="text-green-600"
              />
              <label htmlFor="zukunft_epump" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-cog text-green-500"></i>
                <span>Wärmepumpe geplant</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="zukunft_wallbox" 
                checked={zukunft_wallbox} 
                onChange={(e) => setZukunftWallbox(e.checked || false)}
                className="text-blue-600"
              />
              <label htmlFor="zukunft_wallbox" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-car text-blue-500"></i>
                <span>Wallbox geplant</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="zukunft_pool" 
                checked={zukunft_pool} 
                onChange={(e) => setZukunftPool(e.checked || false)}
                className="text-cyan-600"
              />
              <label htmlFor="zukunft_pool" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-eye text-cyan-500"></i>
                <span>Pool geplant</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="zukunft_sauna" 
                checked={zukunft_sauna} 
                onChange={(e) => setZukunftSauna(e.checked || false)}
                className="text-purple-600"
              />
              <label htmlFor="zukunft_sauna" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-sun text-purple-500"></i>
                <span>Sauna geplant</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="zukunft_klima" 
                checked={zukunft_klima} 
                onChange={(e) => setZukunftKlima(e.checked || false)}
                className="text-orange-600"
              />
              <label htmlFor="zukunft_klima" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-cloud text-orange-500"></i>
                <span>Klimaanlage geplant</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="zukunft_erweiterung" 
                checked={zukunft_erweiterung} 
                onChange={(e) => setZukunftErweiterung(e.checked || false)}
                className="text-pink-600"
              />
              <label htmlFor="zukunft_erweiterung" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-plus-circle text-pink-500"></i>
                <span>Gebäudeerweiterung geplant</span>
              </label>
            </div>
          </div>

          {/* Verbrauchsschätzungen */}
          {(zukunft_epump || zukunft_wallbox || zukunft_pool) && (
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
              <h4 className="font-bold mb-4 text-gray-800">Geschätzte Zusatzverbräuche (kWh/Jahr)</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {zukunft_epump && (
                  <Field label="Wärmepumpe Verbrauch" icon="pi-cog">
                    <InputText
                      value={epump_verbrauch_schaetzung}
                      onChange={(e) => setEpumpVerbrauchSchaetzung(e.target.value)}
                      placeholder="z.B. 4000"
                      className="w-full hover:border-green-400 transition-colors"
                    />
                  </Field>
                )}
                {zukunft_wallbox && (
                  <Field label="Wallbox Verbrauch" icon="pi-car">
                    <InputText
                      value={wallbox_verbrauch_schaetzung}
                      onChange={(e) => setWallboxVerbrauchSchaetzung(e.target.value)}
                      placeholder="z.B. 3000"
                      className="w-full hover:border-blue-400 transition-colors"
                    />
                  </Field>
                )}
                {zukunft_pool && (
                  <Field label="Pool Verbrauch" icon="pi-eye">
                    <InputText
                      value={pool_verbrauch_schaetzung}
                      onChange={(e) => setPoolVerbrauchSchaetzung(e.target.value)}
                      placeholder="z.B. 2000"
                      className="w-full hover:border-cyan-400 transition-colors"
                    />
                  </Field>
                )}
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* Präferenzen Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-heart text-red-500 text-xl"></i>
            <span className="text-xl font-bold">Energiepräferenzen</span>
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="eigenverbrauch_maximieren" 
              checked={eigenverbrauch_maximieren} 
              onChange={(e) => setEigenverbrauchMaximieren(e.checked || false)}
              className="text-green-600"
            />
            <label htmlFor="eigenverbrauch_maximieren" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-chart-pie text-green-500"></i>
              <span>Eigenverbrauch maximieren</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="netzeinspeisung_begrenzen" 
              checked={netzeinspeisung_begrenzen} 
              onChange={(e) => setNetzeinspeisung_begrenzen(e.checked || false)}
              className="text-blue-600"
            />
            <label htmlFor="netzeinspeisung_begrenzen" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-power-off text-blue-500"></i>
              <span>Netzeinspeisung begrenzen</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="backup_wichtig" 
              checked={backup_wichtig} 
              onChange={(e) => setBackupWichtig(e.checked || false)}
              className="text-orange-600"
            />
            <label htmlFor="backup_wichtig" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-shield text-orange-500"></i>
              <span>Notstrom wichtig</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="umwelt_prioritaet" 
              checked={umwelt_prioritaet} 
              onChange={(e) => setUmweltPrioritaet(e.checked || false)}
              className="text-green-600"
            />
            <label htmlFor="umwelt_prioritaet" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-globe text-green-500"></i>
              <span>Umweltschutz Priorität</span>
            </label>
          </div>
        </div>
      </Panel>

      {/* Action Panel */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button 
                label="Analyse speichern"
                icon="pi pi-save"
                onClick={handleSave}
                className="p-button-success"
                raised
              />
              <Button 
                label="Zurücksetzen"
                icon="pi pi-refresh"
                onClick={() => window.location.reload()}
                className="p-button-secondary"
                outlined
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Analyse zu {progressValue}% vollständig</div>
              <ProgressBar value={progressValue} className="w-48 h-2" showValue={false} />
            </div>
          </div>
          
          <Divider />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {requiredOk ? (
                <span className="text-green-600 flex items-center gap-2">
                  <i className="pi pi-check-circle"></i>
                  Alle Pflichtfelder ausgefüllt
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-2">
                  <i className="pi pi-exclamation-triangle"></i>
                  Pflichtfelder: Jährlicher Stromverbrauch, Haushaltsgröße, Heizungstyp
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <WizardNav
              backTo="/project/building"
              nextTo="/project/additional-options"
              disabledNext={!requiredOk}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

// Modernisierte Field Komponente
function Field({label, children, icon}: {label: string; children: React.ReactNode; icon?: string}) {
  return (
    <div className="field-container">
      <label className="block mb-2">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          {icon && <i className={`pi ${icon} text-gray-500`}></i>}
          {label}
        </span>
        {children}
      </label>
    </div>
  )
}