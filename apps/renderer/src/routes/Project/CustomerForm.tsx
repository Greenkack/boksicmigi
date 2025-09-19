import React, { useRef } from "react";
import { useProject } from "../../state/project";
import WizardNav from "../../components/WizardNav";
import { parseFullAddress } from "../../utils/address";
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';

export default function CustomerForm(): JSX.Element {
  const { state, actions } = useProject();
  const c = state.customer;
  const toast = useRef<Toast>(null);

  const showSuccessToast = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Gespeichert',
      detail: 'Kundendaten wurden erfolgreich gespeichert!',
      life: 3000
    });
  };

  const onRawParse = () => {
    const parsed = parseFullAddress(c.adresseRaw);
    actions.applyParsedAddress(parsed);
    toast.current?.show({
      severity: 'info',
      summary: 'Adresse übernommen',
      detail: 'Daten wurden aus der Adresse extrahiert',
      life: 3000
    });
  };

  // Progress calculation based on filled fields
  const calculateProgress = () => {
    const fields = [c.vorname, c.nachname, c.plz, c.ort, c.strasse, c.email, c.telMobil, c.bundesland];
    const filledFields = fields.filter(field => field && field.trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const progressValue = calculateProgress();

  // Minimal validation - only basic info required
  const requiredOk =
    (c.vorname.trim().length > 0 || c.nachname.trim().length > 0) &&
    c.plz.trim().length >= 3 &&
    c.ort.trim().length > 0;

  // Dropdown Options
  const anlagentypOptions = [
    { label: 'Neuanlage', value: 'Neuanlage' },
    { label: 'Bestandsanlage', value: 'Bestandsanlage' }
  ];

  const einspeisetypenOptions = [
    { label: 'Teileinspeisung', value: 'Teileinspeisung' },
    { label: 'Volleinspeisung', value: 'Volleinspeisung' }
  ];

  const kundentypOptions = [
    { label: 'Privat', value: 'Privat' },
    { label: 'Gewerblich', value: 'Gewerblich' }
  ];

  const anredeOptions = [
    { label: '(keine)', value: '' },
    { label: 'Herr', value: 'Herr' },
    { label: 'Frau', value: 'Frau' },
    { label: 'Familie', value: 'Familie' }
  ];

  const titelOptions = [
    { label: '(kein Titel)', value: '' },
    { label: 'Dr.', value: 'Dr.' },
    { label: 'Prof.', value: 'Prof.' },
    { label: 'Mag.', value: 'Mag.' },
    { label: 'Ing.', value: 'Ing.' }
  ];

  const bundeslandOptions = [
    { label: '--- Bitte wählen ---', value: '' },
    { label: 'Baden-Württemberg', value: 'Baden-Württemberg' },
    { label: 'Bayern', value: 'Bayern' },
    { label: 'Berlin', value: 'Berlin' },
    { label: 'Brandenburg', value: 'Brandenburg' },
    { label: 'Bremen', value: 'Bremen' },
    { label: 'Hamburg', value: 'Hamburg' },
    { label: 'Hessen', value: 'Hessen' },
    { label: 'Mecklenburg-Vorpommern', value: 'Mecklenburg-Vorpommern' },
    { label: 'Niedersachsen', value: 'Niedersachsen' },
    { label: 'Nordrhein-Westfalen', value: 'Nordrhein-Westfalen' },
    { label: 'Rheinland-Pfalz', value: 'Rheinland-Pfalz' },
    { label: 'Saarland', value: 'Saarland' },
    { label: 'Sachsen', value: 'Sachsen' },
    { label: 'Sachsen-Anhalt', value: 'Sachsen-Anhalt' },
    { label: 'Schleswig-Holstein', value: 'Schleswig-Holstein' },
    { label: 'Thüringen', value: 'Thüringen' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Toast ref={toast} />
      
      {/* Hero Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <i className="pi pi-user text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Kundendaten erfassen</h1>
                <p className="text-blue-100 text-lg">Alle wichtigen Informationen für Ihr PV-Projekt</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progressValue}%</div>
              <div className="text-sm text-blue-200">Vollständigkeit</div>
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

      {/* Anlagendetails Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-cog text-blue-500 text-xl"></i>
            <span className="text-xl font-bold">Anlagendetails</span>
            <Badge value="Basis" severity="info" />
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <Field label="Anlagentyp" icon="pi-cog">
            <Dropdown 
              value={c.anlagentyp}
              options={anlagentypOptions}
              onChange={(e) => actions.updateCustomer({ anlagentyp: e.value as any })}
              placeholder="Anlagentyp wählen"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Art der PV-Anlage"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
          
          <Field label="Einspeisetyp" icon="pi-power-off">
            <Dropdown 
              value={c.einspeisetyp}
              options={einspeisetypenOptions}
              onChange={(e) => actions.updateCustomer({ einspeisetyp: e.value as any })}
              placeholder="Einspeisetyp wählen"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Art der Netzeinspeisung"
              tooltipOptions={{position: 'top'}}
            />
          </Field>

          <Field label="Kundentyp" icon="pi-users">
            <Dropdown 
              value={c.kundentyp}
              options={kundentypOptions}
              onChange={(e) => actions.updateCustomer({ kundentyp: e.value as any })}
              placeholder="Kundentyp wählen"
              className="w-full hover:border-blue-400 transition-colors"
              tooltip="Privat- oder Geschäftskunde"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Persönliche Daten Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-user text-green-500 text-xl"></i>
            <span className="text-xl font-bold">Persönliche Daten</span>
            {(c.vorname || c.nachname) && <Badge value="Ausgefüllt" severity="success" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <Field label="Anrede" icon="pi-user">
            <Dropdown 
              value={c.anrede}
              options={anredeOptions}
              onChange={(e) => actions.updateCustomer({ anrede: e.value as any })}
              placeholder="Anrede wählen"
              className="w-full hover:border-green-400 transition-colors"
            />
          </Field>

          <Field label="Titel" icon="pi-star">
            <Dropdown 
              value={c.titel}
              options={titelOptions}
              onChange={(e) => actions.updateCustomer({ titel: e.value as any })}
              placeholder="Titel wählen"
              className="w-full hover:border-green-400 transition-colors"
            />
          </Field>

          <div></div> {/* Spacer */}

          <Field label="Vorname *" icon="pi-user">
            <InputText
              value={c.vorname}
              onChange={(e) => actions.updateCustomer({ vorname: e.target.value })}
              placeholder="Vorname eingeben"
              className={`w-full transition-colors ${!c.vorname ? 'hover:border-red-400' : 'hover:border-green-400'}`}
            />
          </Field>

          <Field label="Nachname *" icon="pi-user">
            <InputText
              value={c.nachname}
              onChange={(e) => actions.updateCustomer({ nachname: e.target.value })}
              placeholder="Nachname eingeben"
              className={`w-full transition-colors ${!c.nachname ? 'hover:border-red-400' : 'hover:border-green-400'}`}
            />
          </Field>
        </div>
      </Panel>

      {/* Adresse Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-map-marker text-orange-500 text-xl"></i>
            <span className="text-xl font-bold">Adressdaten</span>
            {(c.plz && c.ort) && <Badge value="Vollständig" severity="warning" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
      >
        <div className="space-y-6 p-4">
          {/* Google Maps Integration */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border">
            <Field label="Komplette Adresse (aus Google Maps)" icon="pi-globe">
              <InputTextarea 
                value={c.adresseRaw}
                onChange={(e) => actions.updateCustomer({ adresseRaw: e.target.value })}
                placeholder="Adresse aus Google Maps hier einfügen..."
                rows={3}
                className="w-full hover:border-orange-400 transition-colors"
                autoResize
              />
              <div className="mt-3">
                <Button 
                  label="Daten aus Adresse übernehmen"
                  icon="pi pi-download"
                  onClick={onRawParse}
                  className="p-button-warning"
                  outlined
                  disabled={!c.adresseRaw}
                />
              </div>
            </Field>
          </div>

          {/* Einzelne Adressfelder */}
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Straße" icon="pi-home">
              <InputText
                value={c.strasse}
                onChange={(e) => actions.updateCustomer({ strasse: e.target.value })}
                placeholder="Straßenname"
                className="w-full hover:border-orange-400 transition-colors"
              />
            </Field>

            <Field label="Hausnummer" icon="pi-hashtag">
              <InputText
                value={c.hausnummer}
                onChange={(e) => actions.updateCustomer({ hausnummer: e.target.value })}
                placeholder="Nr."
                className="w-full hover:border-orange-400 transition-colors"
              />
            </Field>

            <Field label="PLZ *" icon="pi-map">
              <InputText
                value={c.plz}
                onChange={(e) => actions.updateCustomer({ plz: e.target.value })}
                placeholder="Postleitzahl"
                className={`w-full transition-colors ${!c.plz || c.plz.length < 3 ? 'hover:border-red-400' : 'hover:border-orange-400'}`}
              />
            </Field>

            <Field label="Ort *" icon="pi-building">
              <InputText
                value={c.ort}
                onChange={(e) => actions.updateCustomer({ ort: e.target.value })}
                placeholder="Ortsname"
                className={`w-full transition-colors ${!c.ort ? 'hover:border-red-400' : 'hover:border-orange-400'}`}
              />
            </Field>

            <Field label="Bundesland" icon="pi-flag">
              <Dropdown 
                value={c.bundesland}
                options={bundeslandOptions}
                onChange={(e) => actions.updateCustomer({ bundesland: e.value })}
                placeholder="Bundesland wählen"
                className="w-full hover:border-orange-400 transition-colors"
                filter
              />
            </Field>
          </div>
        </div>
      </Panel>

      {/* Kontaktdaten Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-phone text-purple-500 text-xl"></i>
            <span className="text-xl font-bold">Kontaktdaten</span>
            {(c.email || c.telMobil) && <Badge value="Vorhanden" severity="secondary" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <Field label="E-Mail" icon="pi-envelope">
            <InputText
              type="email"
              value={c.email}
              onChange={(e) => actions.updateCustomer({ email: e.target.value })}
              placeholder="email@beispiel.de"
              className="w-full hover:border-purple-400 transition-colors"
            />
          </Field>

          <Field label="Telefon (Festnetz)" icon="pi-phone">
            <InputText
              type="tel"
              value={c.telFest}
              onChange={(e) => actions.updateCustomer({ telFest: e.target.value })}
              placeholder="Festnetznummer"
              className="w-full hover:border-purple-400 transition-colors"
            />
          </Field>

          <Field label="Telefon (Mobil)" icon="pi-mobile">
            <InputText
              type="tel"
              value={c.telMobil}
              onChange={(e) => actions.updateCustomer({ telMobil: e.target.value })}
              placeholder="Mobilnummer"
              className="w-full hover:border-purple-400 transition-colors"
            />
          </Field>
        </div>
      </Panel>

      {/* Anmerkungen Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-comment text-teal-500 text-xl"></i>
            <span className="text-xl font-bold">Zusätzliche Informationen</span>
            {c.anmerkung && <Badge value="Notiz" severity="contrast" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-teal-500"
      >
        <div className="p-4">
          <Field label="Anmerkung zum Kunden" icon="pi-pencil">
            <InputTextarea 
              value={c.anmerkung}
              onChange={(e) => actions.updateCustomer({ anmerkung: e.target.value })}
              placeholder="Besondere Wünsche, Hinweise oder sonstige Anmerkungen..."
              rows={4}
              className="w-full hover:border-teal-400 transition-colors"
              autoResize
            />
          </Field>
        </div>
      </Panel>

      {/* Action Panel */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button 
                label="Kundendaten speichern"
                icon="pi pi-save"
                onClick={showSuccessToast}
                className="p-button-success"
                raised
              />
              <Button 
                label="Daten zurücksetzen"
                icon="pi pi-refresh"
                onClick={() => window.location.reload()}
                className="p-button-secondary"
                outlined
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Eingabe zu {progressValue}% vollständig</div>
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
                  Pflichtfelder: Vor-/Nachname, PLZ (mind. 3 Zeichen), Ort
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <WizardNav
              backTo="/project/mode"
              nextTo="/project/demand"
              disabledNext={!requiredOk}
              showHome={true}
            />
          </div>
        </div>
      </Card>
    </div>
  )
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
