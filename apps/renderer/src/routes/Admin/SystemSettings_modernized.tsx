import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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
import { FileUpload } from 'primereact/fileupload';
import { ColorPicker } from 'primereact/colorpicker';
import { ToggleButton } from 'primereact/togglebutton';
import { formatGermanNumber, formatGermanCurrency } from '../../utils/germanFormat';

interface SystemSetting {
  id: string
  category: 'general' | 'calculation' | 'pdf' | 'email' | 'backup'
  key: string
  name: string
  description: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'file'
  value: any
  defaultValue: any
  options?: { value: string; label: string }[]
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
  }
  unit?: string
  isAdvanced?: boolean
}

const mockSettings: SystemSetting[] = [
  // Allgemeine Einstellungen
  {
    id: '1',
    category: 'general',
    key: 'company_name',
    name: 'Firmenname',
    description: 'Name Ihres Unternehmens für Angebote und Rechnungen',
    type: 'text',
    value: 'Solar Solutions GmbH',
    defaultValue: 'Mein Unternehmen',
    validation: { required: true }
  },
  {
    id: '2',
    category: 'general',
    key: 'company_logo',
    name: 'Firmen-Logo',
    description: 'Logo für PDF-Angebote (empfohlen: PNG, max. 2MB)',
    type: 'file',
    value: '/assets/logo.png',
    defaultValue: null
  },
  {
    id: '3',
    category: 'general',
    key: 'default_currency',
    name: 'Standard-Währung',
    description: 'Währung für alle Preisangaben',
    type: 'select',
    value: 'EUR',
    defaultValue: 'EUR',
    options: [
      { value: 'EUR', label: '€ Euro' },
      { value: 'USD', label: '$ Dollar' },
      { value: 'CHF', label: 'CHF Schweizer Franken' }
    ]
  },

  // Berechnungseinstellungen
  {
    id: '4',
    category: 'calculation',
    key: 'default_electricity_price',
    name: 'Standard Strompreis',
    description: 'Durchschnittlicher Strompreis für Berechnungen',
    type: 'number',
    value: 0.35,
    defaultValue: 0.32,
    unit: '€/kWh',
    validation: { min: 0.1, max: 1.0 }
  },
  {
    id: '5',
    category: 'calculation',
    key: 'feed_in_tariff',
    name: 'Einspeisevergütung',
    description: 'Aktuelle Einspeisevergütung für PV-Anlagen',
    type: 'number',
    value: 0.082,
    defaultValue: 0.082,
    unit: '€/kWh',
    validation: { min: 0.01, max: 0.5 }
  },
  {
    id: '6',
    category: 'calculation',
    key: 'vat_rate',
    name: 'Mehrwertsteuersatz',
    description: 'Standard MwSt.-Satz für Berechnungen',
    type: 'number',
    value: 19,
    defaultValue: 19,
    unit: '%',
    validation: { min: 0, max: 50 }
  },
  {
    id: '7',
    category: 'calculation',
    key: 'safety_margin',
    name: 'Sicherheitsfaktor',
    description: 'Aufschlag für Materialpreise und unvorhergesehene Kosten',
    type: 'number',
    value: 10,
    defaultValue: 10,
    unit: '%',
    validation: { min: 0, max: 50 },
    isAdvanced: true
  },

  // PDF-Einstellungen
  {
    id: '8',
    category: 'pdf',
    key: 'pdf_template',
    name: 'PDF-Vorlage',
    description: 'Standard-Vorlage für Angebote',
    type: 'select',
    value: 'professional',
    defaultValue: 'standard',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'professional', label: 'Professionell' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'custom', label: 'Benutzerdefiniert' }
    ]
  },
  {
    id: '9',
    category: 'pdf',
    key: 'include_technical_specs',
    name: 'Technische Daten einbeziehen',
    description: 'Detaillierte technische Spezifikationen in PDFs',
    type: 'boolean',
    value: true,
    defaultValue: true
  },
  {
    id: '10',
    category: 'pdf',
    key: 'watermark_enabled',
    name: 'Wasserzeichen aktivieren',
    description: 'Wasserzeichen für Angebot-PDFs',
    type: 'boolean',
    value: false,
    defaultValue: false,
    isAdvanced: true
  },

  // E-Mail-Einstellungen
  {
    id: '11',
    category: 'email',
    key: 'smtp_server',
    name: 'SMTP-Server',
    description: 'Server für E-Mail-Versand',
    type: 'text',
    value: 'smtp.gmail.com',
    defaultValue: '',
    isAdvanced: true
  },
  {
    id: '12',
    category: 'email',
    key: 'email_signature',
    name: 'E-Mail-Signatur',
    description: 'Standard-Signatur für automatische E-Mails',
    type: 'text',
    value: 'Mit freundlichen Grüßen\nIhr Solar Solutions Team',
    defaultValue: 'Mit freundlichen Grüßen'
  },

  // Backup-Einstellungen
  {
    id: '13',
    category: 'backup',
    key: 'auto_backup_enabled',
    name: 'Automatische Backups',
    description: 'Tägliche Datensicherung aktivieren',
    type: 'boolean',
    value: true,
    defaultValue: true
  },
  {
    id: '14',
    category: 'backup',
    key: 'backup_retention_days',
    name: 'Backup-Aufbewahrung',
    description: 'Anzahl Tage für Backup-Aufbewahrung',
    type: 'number',
    value: 30,
    defaultValue: 30,
    unit: 'Tage',
    validation: { min: 1, max: 365 },
    isAdvanced: true
  }
];

type CategoryKey = 'general' | 'calculation' | 'pdf' | 'email' | 'backup';

const categoryLabels: Record<CategoryKey, string> = {
  general: 'Allgemein',
  calculation: 'Berechnungen',
  pdf: 'PDF-Einstellungen',
  email: 'E-Mail',
  backup: 'Backup & Sicherheit'
};

const categoryIcons: Record<CategoryKey, string> = {
  general: 'pi-cog',
  calculation: 'pi-calculator',
  pdf: 'pi-file-pdf',
  email: 'pi-envelope',
  backup: 'pi-database'
};

const categoryColors: Record<CategoryKey, string> = {
  general: 'blue',
  calculation: 'green',
  pdf: 'orange',
  email: 'purple',
  backup: 'red'
};

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>(mockSettings);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'all'>('general');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useRef<Toast>(null);

  const filteredSettings = settings.filter(setting => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdvanced = showAdvanced || !setting.isAdvanced;
    return matchesCategory && matchesSearch && matchesAdvanced;
  });

  const updateSetting = (id: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
    setHasChanges(true);
  };

  const resetToDefault = (id: string) => {
    const setting = settings.find(s => s.id === id);
    if (setting) {
      updateSetting(id, setting.defaultValue);
      toast.current?.show({
        severity: 'info',
        summary: 'Zurückgesetzt',
        detail: `${setting.name} auf Standardwert zurückgesetzt`,
        life: 3000
      });
    }
  };

  const saveSettings = async () => {
    // Hier würde die API-Call zum Speichern der Settings erfolgen
    console.log('Settings saved:', settings);
    setHasChanges(false);
    
    toast.current?.show({
      severity: 'success',
      summary: 'Gespeichert',
      detail: 'Alle Einstellungen wurden erfolgreich gespeichert!',
      life: 4000
    });
  };

  const resetAllSettings = () => {
    if (confirm('Alle Einstellungen auf Standardwerte zurücksetzen?')) {
      setSettings(prev => prev.map(setting => ({
        ...setting,
        value: setting.defaultValue
      })));
      setHasChanges(true);
      toast.current?.show({
        severity: 'warn',
        summary: 'Zurückgesetzt',
        detail: 'Alle Einstellungen wurden auf Standardwerte zurückgesetzt',
        life: 4000
      });
    }
  };

  const changedSettingsCount = settings.filter(s => s.value !== s.defaultValue).length;

  return (
    <div className="space-y-6 max-w-8xl mx-auto p-4">
      <Toast ref={toast} />
      
      {/* Hero Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <i className="pi pi-cog text-3xl"></i>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-100">
                  <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
                  <i className="pi pi-chevron-right text-sm"></i>
                  <span>Systemeinstellungen</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Systemeinstellungen</h1>
                <p className="text-blue-100 text-lg">Konfigurieren Sie Ihr System nach Ihren Anforderungen</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{changedSettingsCount}</div>
              <div className="text-sm text-blue-200">Änderungen</div>
            </div>
          </div>
          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
              <div className="flex items-center justify-between">
                <span className="text-yellow-100">Sie haben ungespeicherte Änderungen</span>
                <div className="flex gap-2">
                  <Button 
                    label="Speichern" 
                    icon="pi pi-save" 
                    onClick={saveSettings}
                    className="p-button-success p-button-sm"
                    raised
                  />
                  <Button 
                    label="Verwerfen" 
                    icon="pi pi-times" 
                    onClick={() => window.location.reload()}
                    className="p-button-warning p-button-sm"
                    outlined
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 sticky top-6">
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-6">
                <span className="p-input-icon-left w-full">
                  <i className="pi pi-search" />
                  <InputText
                    placeholder="Einstellung suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    tooltip="Einstellungen durchsuchen"
                    tooltipOptions={{position: 'top'}}
                  />
                </span>
              </div>

              {/* Categories */}
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Kategorien</h3>
                {Object.entries(categoryLabels).map(([key, label]) => {
                  const categoryCount = settings.filter(s => s.category === key).length;
                  const changedCount = settings.filter(s => s.category === key && s.value !== s.defaultValue).length;
                  
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedCategory(key as CategoryKey)}
                      className={`w-full p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedCategory === key 
                          ? `bg-${categoryColors[key as CategoryKey]}-100 border-${categoryColors[key as CategoryKey]}-300 text-${categoryColors[key as CategoryKey]}-800` 
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <i className={`pi ${categoryIcons[key as CategoryKey]} text-${categoryColors[key as CategoryKey]}-500`}></i>
                          <span className="font-medium">{label}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge value={categoryCount} severity="secondary" />
                          {changedCount > 0 && <Badge value={changedCount} severity="warning" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Divider />

              {/* Advanced Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Erweiterte Optionen</label>
                <ToggleButton
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.value)}
                  onLabel="Ein"
                  offLabel="Aus"
                  onIcon="pi pi-check"
                  offIcon="pi pi-times"
                  className="p-button-sm"
                  tooltip="Erweiterte Einstellungen anzeigen"
                  tooltipOptions={{position: 'top'}}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <Button
                  label="Alle speichern"
                  icon="pi pi-save"
                  onClick={saveSettings}
                  className="w-full p-button-success"
                  raised
                  disabled={!hasChanges}
                />
                <Button
                  label="Alle zurücksetzen"
                  icon="pi pi-refresh"
                  onClick={resetAllSettings}
                  className="w-full p-button-danger"
                  outlined
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {selectedCategory !== 'all' && (
              <Panel 
                header={
                  <div className="flex items-center gap-3">
                    <i className={`pi ${categoryIcons[selectedCategory as CategoryKey]} text-${categoryColors[selectedCategory as CategoryKey]}-500 text-xl`}></i>
                    <span className="text-xl font-bold">{categoryLabels[selectedCategory as CategoryKey]}</span>
                    <Badge value={filteredSettings.length} severity="secondary" />
                  </div>
                }
                className="shadow-lg border-0"
                toggleable
              >
                <div className="space-y-6 p-4">
                  {filteredSettings.map(setting => (
                    <SettingItem
                      key={setting.id}
                      setting={setting}
                      onUpdate={updateSetting}
                      onReset={resetToDefault}
                    />
                  ))}
                </div>
              </Panel>
            )}

            {filteredSettings.length === 0 && (
              <Card className="shadow-lg border-0">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    <i className="pi pi-search text-gray-300"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Einstellungen gefunden</h3>
                  <p className="text-gray-600">
                    {searchTerm ? `Keine Einstellungen für "${searchTerm}"` : 'Keine Einstellungen in dieser Kategorie'}
                  </p>
                  {searchTerm && (
                    <Button
                      label="Suche zurücksetzen"
                      icon="pi pi-times"
                      onClick={() => setSearchTerm('')}
                      className="mt-4 p-button-secondary"
                      outlined
                    />
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modernized Setting Item Component
function SettingItem({ 
  setting, 
  onUpdate, 
  onReset 
}: { 
  setting: SystemSetting
  onUpdate: (id: string, value: any) => void
  onReset: (id: string) => void
}) {
  const hasChanged = setting.value !== setting.defaultValue;

  const renderInput = () => {
    switch (setting.type) {
      case 'text':
        return (
          <InputText
            value={setting.value || ''}
            onChange={(e) => onUpdate(setting.id, e.target.value)}
            className="w-full"
            placeholder={`${setting.name} eingeben`}
            tooltip={setting.description}
            tooltipOptions={{position: 'top'}}
          />
        );

      case 'number':
        return (
          <div className="flex items-center gap-2">
            <InputNumber
              value={setting.value || 0}
              onValueChange={(e) => onUpdate(setting.id, e.value || 0)}
              min={setting.validation?.min}
              max={setting.validation?.max}
              minFractionDigits={0}
              maxFractionDigits={3}
              className="flex-1"
              tooltip={setting.description}
              tooltipOptions={{position: 'top'}}
            />
            {setting.unit && (
              <span className="text-sm text-gray-500 font-medium min-w-fit">
                {setting.unit}
              </span>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <ToggleButton
              checked={setting.value || false}
              onChange={(e) => onUpdate(setting.id, e.value)}
              onLabel="Aktiviert"
              offLabel="Deaktiviert"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              tooltip={setting.description}
              tooltipOptions={{position: 'top'}}
            />
          </div>
        );

      case 'select':
        return (
          <Dropdown 
            value={setting.value || ''}
            options={setting.options}
            onChange={(e) => onUpdate(setting.id, e.value)}
            placeholder={`${setting.name} auswählen`}
            className="w-full"
            tooltip={setting.description}
            tooltipOptions={{position: 'top'}}
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <ColorPicker
              value={setting.value || '#000000'}
              onChange={(e) => onUpdate(setting.id, `#${e.value}`)}
              tooltip={setting.description}
              tooltipOptions={{position: 'top'}}
            />
            <InputText
              value={setting.value || '#000000'}
              onChange={(e) => onUpdate(setting.id, e.target.value)}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <FileUpload
              mode="basic"
              name="file"
              accept=".png,.jpg,.jpeg,.pdf"
              maxFileSize={2000000}
              onSelect={(e) => {
                const file = e.files[0];
                if (file) {
                  onUpdate(setting.id, `/uploads/${file.name}`);
                }
              }}
              className="w-full"
              chooseLabel="Datei auswählen"
            />
            <div className="text-xs text-gray-600">{setting.description}</div>
            {setting.value && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border">
                <i className="pi pi-file text-blue-500"></i>
                <span className="text-sm text-blue-700">
                  Aktuell: {setting.value}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`transition-all ${
      hasChanged 
        ? 'shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-white' 
        : 'shadow-md hover:shadow-lg'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900">{setting.name}</h3>
              {setting.isAdvanced && (
                <Badge value="Erweitert" severity="warning" />
              )}
              {hasChanged && (
                <Badge value="Geändert" severity="info" />
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{setting.description}</p>
          </div>
          
          {hasChanged && (
            <Button
              icon="pi pi-refresh"
              onClick={() => onReset(setting.id)}
              className="p-button-secondary p-button-sm"
              tooltip="Auf Standardwert zurücksetzen"
              tooltipOptions={{position: 'top'}}
              outlined
            />
          )}
        </div>

        <div className="max-w-lg">
          {renderInput()}
        </div>

        {setting.validation && (
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            {setting.validation.required && (
              <div className="flex items-center gap-1">
                <i className="pi pi-exclamation-triangle text-orange-500"></i>
                <span>Pflichtfeld</span>
              </div>
            )}
            {setting.validation.min !== undefined && (
              <div className="flex items-center gap-1">
                <i className="pi pi-arrow-up text-green-500"></i>
                <span>Min: {formatGermanNumber(setting.validation.min)}</span>
              </div>
            )}
            {setting.validation.max !== undefined && (
              <div className="flex items-center gap-1">
                <i className="pi pi-arrow-down text-red-500"></i>
                <span>Max: {formatGermanNumber(setting.validation.max)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}