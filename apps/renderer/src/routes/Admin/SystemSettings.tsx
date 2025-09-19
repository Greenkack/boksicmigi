import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import { Divider } from 'primereact/divider';
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
]

type CategoryKey = 'general' | 'calculation' | 'pdf' | 'email' | 'backup'

const categoryLabels: Record<CategoryKey, string> = {
  general: 'Allgemein',
  calculation: 'Berechnungen',
  pdf: 'PDF-Einstellungen',
  email: 'E-Mail',
  backup: 'Backup & Sicherheit'
}

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

  const categoryOptions = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'general', label: 'Allgemein' },
    { value: 'calculation', label: 'Berechnungen' },
    { value: 'pdf', label: 'PDF-Einstellungen' },
    { value: 'email', label: 'E-Mail' },
    { value: 'backup', label: 'Backup & Sicherheit' }
  ];

  return (
    <div className="system-settings-container">
      <Toast ref={toast} position="top-right" />
      
      {/* Hero Header */}
      <div className="hero-header">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <i className="pi pi-cog hero-icon"></i>
            Systemeinstellungen
          </h1>
          <p className="hero-subtitle">
            Verwalten Sie alle Systemkonfigurationen und erweiterte Einstellungen
          </p>
          
          {/* Settings Stats */}
          <div className="stats-grid">
            <Card className="stat-card stat-card-primary">
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="pi pi-list"></i>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{settings.length}</span>
                  <span className="stat-label">Einstellungen</span>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card stat-card-warning">
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="pi pi-exclamation-triangle"></i>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{changedSettingsCount}</span>
                  <span className="stat-label">Geändert</span>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card stat-card-info">
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="pi pi-eye"></i>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{filteredSettings.length}</span>
                  <span className="stat-label">Angezeigt</span>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card stat-card-success">
              <div className="stat-content">
                <div className="stat-icon">
                  <i className="pi pi-star"></i>
                </div>
                <div className="stat-details">
                  <span className="stat-number">{settings.filter(s => s.isAdvanced).length}</span>
                  <span className="stat-label">Erweitert</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <Panel header="Filter & Aktionen" className="controls-panel" toggleable collapsed={false}>
        <div className="controls-grid">
          <div className="control-group">
            <label htmlFor="category-select">Kategorie:</label>
            <Dropdown
              id="category-select"
              value={selectedCategory}
              options={categoryOptions}
              onChange={(e) => setSelectedCategory(e.value)}
              placeholder="Kategorie wählen"
              className="w-full"
              optionLabel="label"
              optionValue="value"
            />
          </div>
          
          <div className="control-group">
            <label htmlFor="search-input">Suche:</label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search"></i>
              <InputText
                id="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Einstellungen durchsuchen..."
                className="w-full"
              />
            </span>
          </div>
          
          <div className="control-group">
            <div className="toggle-group">
              <ToggleButton
                checked={showAdvanced}
                onChange={(e) => setShowAdvanced(e.value)}
                onLabel="Erweiterte Ein"
                offLabel="Erweiterte Aus"
                onIcon="pi pi-eye"
                offIcon="pi pi-eye-slash"
                className="toggle-advanced"
              />
            </div>
          </div>
          
          <div className="control-group action-buttons">
            <Button
              label="Alle Speichern"
              icon="pi pi-save"
              onClick={saveSettings}
              disabled={!hasChanges}
              className="p-button-success"
              tooltip="Speichert alle Änderungen"
            />
            
            <Button
              label="Alle Zurücksetzen"
              icon="pi pi-refresh"
              onClick={resetAllSettings}
              className="p-button-warning"
              tooltip="Setzt alle Einstellungen zurück"
            />
          </div>
        </div>
      </Panel>
              <h1 className="text-2xl font-bold text-slate-900">⚙️ Systemeinstellungen</h1>
              <p className="text-slate-600">Konfigurieren Sie Ihr System nach Ihren Anforderungen</p>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  💾 Änderungen speichern
                </button>
              )}
              <button
                onClick={resetAllSettings}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4 sticky top-6">
              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Einstellung suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-2.5 top-2.5 text-slate-400 text-sm">🔍</div>
              </div>

              {/* Categories */}
              <div className="space-y-1 mb-4">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as CategoryKey)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === key 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg">{categoryIcons[key as CategoryKey]}</span>
                    {label}
                  </button>
                ))}
              </div>

              {/* Advanced Toggle */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-slate-700">Erweiterte Optionen</span>
              </label>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {selectedCategory !== 'all' && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{categoryIcons[selectedCategory as CategoryKey]}</span>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {categoryLabels[selectedCategory as CategoryKey]}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {filteredSettings.map(setting => (
                      <SettingItem
                        key={setting.id}
                        setting={setting}
                        onUpdate={updateSetting}
                        onReset={resetToDefault}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredSettings.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚙️</div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Einstellungen gefunden</h3>
                  <p className="text-slate-600">
                    {searchTerm ? `Keine Einstellungen für "${searchTerm}"` : 'Keine Einstellungen in dieser Kategorie'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Setting Item Component
function SettingItem({ 
  setting, 
  onUpdate, 
  onReset 
}: { 
  setting: SystemSetting
  onUpdate: (id: string, value: any) => void
  onReset: (id: string) => void
}) {
  const hasChanged = setting.value !== setting.defaultValue

  const renderInput = () => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value || ''}
            onChange={(e) => onUpdate(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={setting.validation?.required}
            aria-label={setting.name}
            placeholder={`${setting.name} eingeben`}
          />
        )

      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={setting.value || ''}
              onChange={(e) => onUpdate(setting.id, parseFloat(e.target.value) || 0)}
              min={setting.validation?.min}
              max={setting.validation?.max}
              step="0.001"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`${setting.name} eingeben`}
            />
            {setting.unit && (
              <div className="absolute right-3 top-2.5 text-slate-500 text-sm">
                {setting.unit}
              </div>
            )}
          </div>
        )

      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value || false}
              onChange={(e) => onUpdate(setting.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm text-slate-900">
              {setting.value ? 'Aktiviert' : 'Deaktiviert'}
            </span>
          </label>
        )

      case 'select':
        return (
          <select
            value={setting.value || ''}
            onChange={(e) => onUpdate(setting.id, e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={setting.name}
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'color':
        return (
          <input
            type="color"
            value={setting.value || '#000000'}
            onChange={(e) => onUpdate(setting.id, e.target.value)}
            className="w-20 h-10 border border-slate-300 rounded-lg cursor-pointer"
            aria-label={setting.name}
            title={setting.description}
          />
        )

      case 'file':
        return (
          <div className="space-y-2">
            <label htmlFor={`file-input-${setting.id}`} className="block text-sm font-medium text-slate-700 mb-1">
              {setting.name}
            </label>
            <input
              id={`file-input-${setting.id}`}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Hier würde der File-Upload erfolgen
                  onUpdate(setting.id, `/uploads/${file.name}`)
                }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              aria-label={setting.name}
              title={setting.description}
            />
            {setting.value && (
              <div className="text-sm text-slate-600">
                Aktuell: {setting.value}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`p-4 rounded-lg border-2 transition-all ${
      hasChanged ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-slate-900">{setting.name}</h3>
            {setting.isAdvanced && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                Erweitert
              </span>
            )}
            {hasChanged && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                Geändert
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">{setting.description}</p>
        </div>
        
        {hasChanged && (
          <button
            onClick={() => onReset(setting.id)}
            className="ml-3 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            title="Auf Standardwert zurücksetzen"
          >
            ↺ Reset
          </button>
        )}
      </div>

      <div className="max-w-md">
        {renderInput()}
      </div>

      {setting.validation && (
        <div className="mt-2 text-xs text-slate-500">
          {setting.validation.required && <span>• Pflichtfeld </span>}
          {setting.validation.min && <span>• Min: {formatGermanNumber(setting.validation.min)} </span>}
          {setting.validation.max && <span>• Max: {formatGermanNumber(setting.validation.max)} </span>}
        </div>
      )}
    </div>
  )
}
