// PATCH: Modernized with PrimeReact Components
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../../state/project";
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';

export default function BuildingData(): JSX.Element {
  const nav = useNavigate();
  const { state, actions } = useProject();
  const initializedRef = useRef(false);
  const toast = useRef<Toast>(null);
  const [saveStatus, setSaveStatus] = useState<"idle"|"saving"|"done"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [v, setV] = useState({
    buildingType: state.building.buildingType || "Einfamilienhaus",
    livingSpace: state.building.livingSpace?.toString() || "",
    floors: state.building.floors?.toString() || "",
    baujahr: state.building.constructionYear?.toString() || "",
    dachart: state.building.roofType || "Satteldach",
    ausrichtung: state.building.roofOrientation || "Süd",
    neigung: state.building.roofTilt?.toString() || "",
    flaeche: state.building.roofArea?.toString() || "",
    deckung: "Frankfurter Pfannen",
    verschattung: state.building.shadingFactors || "keine",
    dachzustand: "gut",
    statik_geprueft: false,
    denkmalschutz: false,
    kamin_vorhanden: false,
    kamin_position: "",
    gauben_anzahl: "",
    dachfenster_anzahl: "",
    solar_vorhanden: false,
    solar_typ: "",
    koordinaten: "",
    hoehe: "",
    hoeheUeber7m: false,
    brandschutz_beachten: false,
    dachrinne_zustand: "gut",
    blitzschutz_vorhanden: false,
    elektricalConnection: state.building.electricalConnection || "Standardanschluss",
    heatingSystem: state.building.heatingSystem || "Gas",
  });

  // Progress calculation
  const calculateProgress = () => {
    const fields = [v.buildingType, v.livingSpace, v.baujahr, v.dachart, v.ausrichtung, v.neigung, v.flaeche, v.verschattung, v.elektricalConnection, v.heatingSystem];
    const filledFields = fields.filter(field => field && field.toString().trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const progressValue = calculateProgress();

  // Dropdown Options
  const buildingTypeOptions = [
    { label: 'Einfamilienhaus', value: 'Einfamilienhaus' },
    { label: 'Zweifamilienhaus', value: 'Zweifamilienhaus' },
    { label: 'Reihenhaus', value: 'Reihenhaus' },
    { label: 'Doppelhaushälfte', value: 'Doppelhaushälfte' },
    { label: 'Bungalow', value: 'Bungalow' }
  ];

  const roofTypeOptions = [
    { label: 'Satteldach', value: 'Satteldach' },
    { label: 'Walmdach', value: 'Walmdach' },
    { label: 'Flachdach', value: 'Flachdach' },
    { label: 'Pultdach', value: 'Pultdach' },
    { label: 'Mansarddach', value: 'Mansarddach' }
  ];

  const orientationOptions = [
    { label: 'Süd', value: 'Süd' },
    { label: 'Südost', value: 'Südost' },
    { label: 'Südwest', value: 'Südwest' },
    { label: 'Ost', value: 'Ost' },
    { label: 'West', value: 'West' },
    { label: 'Nord', value: 'Nord' }
  ];

  const shadingOptions = [
    { label: 'keine', value: 'keine' },
    { label: 'gering', value: 'gering' },
    { label: 'mittel', value: 'mittel' },
    { label: 'stark', value: 'stark' }
  ];

  const roofCoveringOptions = [
    { label: 'Frankfurter Pfannen', value: 'Frankfurter Pfannen' },
    { label: 'Biberschwanz', value: 'Biberschwanz' },
    { label: 'Schiefer', value: 'Schiefer' },
    { label: 'Blech', value: 'Blech' },
    { label: 'Andere', value: 'Andere' }
  ];

  const electricalConnectionOptions = [
    { label: 'Standardanschluss', value: 'Standardanschluss' },
    { label: 'Verstärkter Anschluss', value: 'Verstärkter Anschluss' },
    { label: 'Industrieanschluss', value: 'Industrieanschluss' }
  ];

  const heatingSystemOptions = [
    { label: 'Gas', value: 'Gas' },
    { label: 'Öl', value: 'Öl' },
    { label: 'Wärmepumpe', value: 'Wärmepumpe' },
    { label: 'Fernwärme', value: 'Fernwärme' },
    { label: 'Pellets', value: 'Pellets' },
    { label: 'Andere', value: 'Andere' }
  ];

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const b = state.building;
    setV(prev => ({
      ...prev,
      buildingType: b.buildingType || prev.buildingType,
      livingSpace: b.livingSpace?.toString() || prev.livingSpace,
      floors: b.floors?.toString() || prev.floors,
      baujahr: b.constructionYear?.toString() || prev.baujahr,
      dachart: b.roofType || prev.dachart,
      ausrichtung: b.roofOrientation || prev.ausrichtung,
      neigung: b.roofTilt?.toString() || prev.neigung,
      flaeche: b.roofArea?.toString() || prev.flaeche,
      verschattung: b.shadingFactors || prev.verschattung,
      elektricalConnection: b.electricalConnection || prev.elektricalConnection,
      heatingSystem: b.heatingSystem || prev.heatingSystem,
    }));
  }, [state.building]);

  const calculations = useMemo(() => {
    const livingSpace = parseInt(v.livingSpace) || 0;
    const roofArea = parseInt(v.flaeche) || 0;
    const tilt = parseInt(v.neigung) || 0;
    const estimatedPvPower = roofArea > 0 ? Math.round((roofArea * 0.065) * 10) / 10 : 0;
    const usableRoofArea = Math.round(roofArea * 0.6);
    return {
      estimatedPvPower,
      usableRoofArea,
      optimalTilt: 35,
      solarHint:
        roofArea > 0
          ? (v.ausrichtung === "Süd" && tilt >= 25 && tilt <= 40
              ? "🌟 Optimal"
              : v.ausrichtung === "Süd"
              ? "☀️ Sehr gut"
              : (v.ausrichtung === "Ost" || v.ausrichtung === "West")
              ? "✅ Gut"
              : "⚠️ Mäßig")
          : ""
    };
  }, [v.ausrichtung, v.flaeche, v.neigung, v.livingSpace]);

  const lastSignatureRef = useRef<string>("");
  useEffect(() => {
    const patch = {
      buildingType: v.buildingType,
      livingSpace: v.livingSpace.trim() ? parseInt(v.livingSpace) : undefined,
      floors: v.floors.trim() ? parseInt(v.floors) : undefined,
      constructionYear: v.baujahr.trim() ? parseInt(v.baujahr) : undefined,
      roofType: v.dachart,
      roofOrientation: v.ausrichtung,
      roofTilt: v.neigung.trim() ? parseInt(v.neigung) : undefined,
      roofArea: v.flaeche.trim() ? parseInt(v.flaeche) : undefined,
      shadingFactors: v.verschattung,
      electricalConnection: v.elektricalConnection,
      heatingSystem: v.heatingSystem,
    };
    const signature = JSON.stringify(patch);
    if (signature !== lastSignatureRef.current) {
      lastSignatureRef.current = signature;
      actions.updateBuilding(patch);
    }
  }, [
    v.buildingType,
    v.livingSpace,
    v.floors,
    v.baujahr,
    v.dachart,
    v.ausrichtung,
    v.neigung,
    v.flaeche,
    v.verschattung,
    v.elektricalConnection,
    v.heatingSystem,
    actions
  ]);

  const missingRequired: string[] = [];
  if (!v.baujahr.trim()) missingRequired.push("Baujahr");
  if (!v.flaeche.trim()) missingRequired.push("Dachfläche");
  if (!v.neigung.trim()) missingRequired.push("Dachneigung");
  const requiredOk = missingRequired.length === 0;

  const handleSave = () => {
    setErrorMsg("");
    if (!requiredOk) {
      setErrorMsg("Bitte Pflichtfelder ausfüllen: " + missingRequired.join(", "));
      toast.current?.show({
        severity: 'error',
        summary: 'Validierungsfehler',
        detail: 'Bitte alle Pflichtfelder ausfüllen',
        life: 4000
      });
      return;
    }
    try {
      setSaveStatus("saving");
      // Optional: Flag setzen
      actions.updateBuilding({ savedAt: Date.now() } as any);
      setTimeout(() => {
        setSaveStatus("done");
        toast.current?.show({
          severity: 'success',
          summary: 'Erfolgreich gespeichert',
          detail: 'Gebäudedaten wurden gespeichert',
          life: 3000
        });
        setTimeout(() => nav("/home"), 1000);
      }, 300);
    } catch (e) {
      console.error(e);
      setSaveStatus("error");
      setErrorMsg("Speichern fehlgeschlagen.");
      toast.current?.show({
        severity: 'error',
        summary: 'Speicherfehler',
        detail: 'Daten konnten nicht gespeichert werden',
        life: 4000
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Toast ref={toast} />
      
      {/* Hero Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <i className="pi pi-home text-3xl"></i>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">Gebäudedaten erfassen</h2>
                <p className="text-green-100 text-lg">
                  Bitte Gebäudedaten eingeben und anschließend „Daten speichern" klicken. 
                  Danach wählen Sie im Hauptmenü den Solar Calculator oder Wärmepumpe Simulator.
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progressValue}%</div>
              <div className="text-sm text-green-200">Vollständigkeit</div>
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

      {/* PV Potential Info */}
      {calculations.estimatedPvPower > 0 && (
        <Card className="shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <i className="pi pi-sun text-blue-600 text-xl"></i>
              <h3 className="text-lg font-bold text-blue-800">PV-Potenzial Analyse</h3>
              <Badge value="Automatisch berechnet" severity="info" />
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <i className="pi pi-bolt text-yellow-500"></i>
                <span><strong>Geschätzte PV-Leistung:</strong> {calculations.estimatedPvPower} kWp</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-chart-pie text-green-500"></i>
                <span><strong>Nutzbare Dachfläche:</strong> ~{calculations.usableRoofArea} m²</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-star text-orange-500"></i>
                <span><strong>Bewertung:</strong> {calculations.solarHint}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grunddaten Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-building text-blue-500 text-xl"></i>
            <span className="text-xl font-bold">Grunddaten</span>
            {(v.buildingType && v.baujahr) && <Badge value="Ausgefüllt" severity="info" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <Field label="Gebäudetyp" icon="pi-home">
            <Dropdown 
              value={v.buildingType}
              options={buildingTypeOptions}
              onChange={(e) => setV({...v, buildingType: e.value})}
              placeholder="Gebäudetyp wählen"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Art des Gebäudes"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Wohnfläche (m²)" icon="pi-chart-bar">
            <InputText
              value={v.livingSpace}
              onChange={(e) => setV({...v, livingSpace: e.target.value})}
              placeholder="z.B. 150"
              className="w-full hover:border-blue-400 transition-colors"
            />
          </Field>

          <Field label="Baujahr *" icon="pi-calendar">
            <InputText
              value={v.baujahr}
              onChange={(e) => setV({...v, baujahr: e.target.value})}
              placeholder="z.B. 1995"
              className={`w-full transition-colors ${!v.baujahr ? 'hover:border-red-400' : 'hover:border-blue-400'}`}
            />
          </Field>
        </div>
      </Panel>

      {/* Dach-Spezifikationen Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-shield text-orange-500 text-xl"></i>
            <span className="text-xl font-bold">Dach-Spezifikationen</span>
            {(v.dachart && v.ausrichtung && v.neigung && v.flaeche) && <Badge value="Vollständig" severity="warning" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <Field label="Dachart" icon="pi-home">
            <Dropdown 
              value={v.dachart}
              options={roofTypeOptions}
              onChange={(e) => setV({...v, dachart: e.value})}
              placeholder="Dachart wählen"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Form des Daches"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Dachausrichtung" icon="pi-compass">
            <Dropdown 
              value={v.ausrichtung}
              options={orientationOptions}
              onChange={(e) => setV({...v, ausrichtung: e.value})}
              placeholder="Ausrichtung wählen"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Himmelsrichtung der Dachfläche"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Dachneigung (°) *" icon="pi-angle-up">
            <InputText
              value={v.neigung}
              onChange={(e) => setV({...v, neigung: e.target.value})}
              placeholder="z.B. 35"
              className={`w-full transition-colors ${!v.neigung ? 'hover:border-red-400' : 'hover:border-orange-400'}`}
            />
          </Field>

          <Field label="Dachfläche (m²) *" icon="pi-th-large">
            <InputText
              value={v.flaeche}
              onChange={(e) => setV({...v, flaeche: e.target.value})}
              placeholder="z.B. 120"
              className={`w-full transition-colors ${!v.flaeche ? 'hover:border-red-400' : 'hover:border-orange-400'}`}
            />
          </Field>

          <Field label="Verschattung" icon="pi-cloud">
            <Dropdown 
              value={v.verschattung}
              options={shadingOptions}
              onChange={(e) => setV({...v, verschattung: e.value})}
              placeholder="Verschattung wählen"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Grad der Verschattung durch Bäume, Gebäude etc."
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Dachdeckung" icon="pi-th-large">
            <Dropdown 
              value={v.deckung}
              options={roofCoveringOptions}
              onChange={(e) => setV({...v, deckung: e.value})}
              placeholder="Deckung wählen"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Art der Dachziegel oder -deckung"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Technische Anschlüsse Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-cog text-purple-500 text-xl"></i>
            <span className="text-xl font-bold">Technische Anschlüsse</span>
            {(v.elektricalConnection && v.heatingSystem) && <Badge value="Konfiguriert" severity="secondary" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <Field label="Elektrischer Anschluss" icon="pi-bolt">
            <Dropdown 
              value={v.elektricalConnection}
              options={electricalConnectionOptions}
              onChange={(e) => setV({...v, elektricalConnection: e.value})}
              placeholder="Anschluss wählen"
              className="w-full hover:border-purple-400 transition-colors"
              tooltip="Typ des Stromanschlusses"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Heizungssystem" icon="pi-sun">
            <Dropdown 
              value={v.heatingSystem}
              options={heatingSystemOptions}
              onChange={(e) => setV({...v, heatingSystem: e.value})}
              placeholder="Heizung wählen"
              className="w-full hover:border-purple-400 transition-colors"
              tooltip="Aktuell installiertes Heizungssystem"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Status Messages */}
      {errorMsg && (
        <Message severity="error" text={errorMsg} className="w-full" />
      )}
      {!requiredOk && !errorMsg && (
        <Message 
          severity="warn" 
          text={`Fehlende Pflichtfelder: ${missingRequired.join(", ")}`} 
          className="w-full" 
        />
      )}

      {/* Action Panel */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button
                label={saveStatus === "saving" ? "Speichern..." : "Daten speichern"}
                icon="pi pi-save"
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="p-button-success"
                raised
              />
              <Button
                label="Abbrechen / Zurück"
                icon="pi pi-arrow-left"
                onClick={() => nav("/home")}
                className="p-button-secondary"
                outlined
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Eingabe zu {progressValue}% vollständig</div>
              <ProgressBar value={progressValue} className="w-48 h-2" showValue={false} />
            </div>
          </div>

          {saveStatus === "done" && (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <i className="pi pi-check-circle"></i>
              <span>Gespeichert – zurück zum Menü...</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <i className="pi pi-times-circle"></i>
              <span>Fehler beim Speichern.</span>
            </div>
          )}
          
          <div className="mt-4 text-xs text-slate-500">
            Debug: signature={lastSignatureRef.current}
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