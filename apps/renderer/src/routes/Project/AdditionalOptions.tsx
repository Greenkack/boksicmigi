import React, { useState, useEffect } from 'react'
import { Card } from 'primereact/card'
import { Panel } from 'primereact/panel'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { Divider } from 'primereact/divider'
import { Badge } from 'primereact/badge'
import { Carousel } from 'primereact/carousel'
import { Toast } from 'primereact/toast'
import { ProgressBar } from 'primereact/progressbar'
import { Tooltip } from 'primereact/tooltip'
import WizardNav from '../../components/WizardNav'
import { useProject } from '../../state/project'

export default function AdditionalOptions() {
  const { state, actions } = useProject()
  const toast = React.useRef<Toast>(null)

  // PV System Optionen
  const [pv_interest, setPvInterest] = useState<boolean>(
    state.options?.pv_interest || false
  )
  const [system_size_preference, setSystemSizePreference] = useState<string>(
    state.options?.system_size_preference || ''
  )
  const [module_type_preference, setModuleTypePreference] = useState<string>(
    state.options?.module_type_preference || ''
  )
  const [inverter_type_preference, setInverterTypePreference] = useState<string>(
    state.options?.inverter_type_preference || ''
  )
  const [mounting_preference, setMountingPreference] = useState<string>(
    state.options?.mounting_preference || ''
  )

  // Speicher Optionen
  const [battery_interest, setBatteryInterest] = useState<boolean>(
    state.options?.battery_interest || false
  )
  const [battery_size_preference, setBatterySizePreference] = useState<string>(
    state.options?.battery_size_preference || ''
  )
  const [battery_type_preference, setBatteryTypePreference] = useState<string>(
    state.options?.battery_type_preference || ''
  )
  const [backup_power_desired, setBackupPowerDesired] = useState<boolean>(
    state.options?.backup_power_desired || false
  )

  // Wärmepumpe Optionen
  const [hp_interest, setHpInterest] = useState<boolean>(
    state.options?.hp_interest || false
  )
  const [hp_type_preference, setHpTypePreference] = useState<string>(
    state.options?.hp_type_preference || ''
  )
  const [hp_size_preference, setHpSizePreference] = useState<string>(
    state.options?.hp_size_preference || ''
  )
  const [hp_integration_timing, setHpIntegrationTiming] = useState<string>(
    state.options?.hp_integration_timing || ''
  )

  // E-Mobilität
  const [ev_charging_interest, setEvChargingInterest] = useState<boolean>(
    state.options?.ev_charging_interest || false
  )
  const [wallbox_type_preference, setWallboxTypePreference] = useState<string>(
    state.options?.wallbox_type_preference || ''
  )
  const [ev_integration_timing, setEvIntegrationTiming] = useState<string>(
    state.options?.ev_integration_timing || ''
  )

  // Smart Home & Monitoring
  const [smart_home_integration, setSmartHomeIntegration] = useState<boolean>(
    state.options?.smart_home_integration || false
  )
  const [monitoring_level_preference, setMonitoringLevelPreference] = useState<string>(
    state.options?.monitoring_level_preference || ''
  )
  const [app_control_desired, setAppControlDesired] = useState<boolean>(
    state.options?.app_control_desired || false
  )

  // Zusätzliche Services
  const [maintenance_contract_interest, setMaintenanceContractInterest] = useState<boolean>(
    state.options?.maintenance_contract_interest || false
  )
  const [insurance_interest, setInsuranceInterest] = useState<boolean>(
    state.options?.insurance_interest || false
  )
  const [financing_interest, setFinancingInterest] = useState<boolean>(
    state.options?.financing_interest || false
  )
  const [leasing_interest, setLeasingInterest] = useState<boolean>(
    state.options?.leasing_interest || false
  )

  // Installation Präferenzen
  const [installation_speed_preference, setInstallationSpeedPreference] = useState<string>(
    state.options?.installation_speed_preference || ''
  )
  const [installation_team_size, setInstallationTeamSize] = useState<string>(
    state.options?.installation_team_size || ''
  )

  // Zukünftige Erweiterungen
  const [future_expansion_planned, setFutureExpansionPlanned] = useState<boolean>(
    state.options?.future_expansion_planned || false
  )
  const [pool_heating_interest, setPoolHeatingInterest] = useState<boolean>(
    state.options?.pool_heating_interest || false
  )
  const [climate_control_interest, setClimateControlInterest] = useState<boolean>(
    state.options?.climate_control_interest || false
  )

  // Sonstiges
  const [special_requests, setSpecialRequests] = useState<string>(
    state.options?.special_requests || ''
  )
  const [consultation_preference, setConsultationPreference] = useState<string>(
    state.options?.consultation_preference || ''
  )

  // Dropdown Optionen
  const systemSizeOptions = [
    { label: 'Keine Präferenz', value: '' },
    { label: 'Klein (bis 5 kWp)', value: 'small' },
    { label: 'Mittel (5-10 kWp)', value: 'medium' },
    { label: 'Groß (10-20 kWp)', value: 'large' },
    { label: 'Sehr groß (> 20 kWp)', value: 'very_large' },
    { label: 'Maximale Dachnutzung', value: 'maximum' }
  ]

  const moduleTypeOptions = [
    { label: 'Keine Präferenz', value: '' },
    { label: 'Monokristallin', value: 'mono' },
    { label: 'Polykristallin', value: 'poly' },
    { label: 'Bifazial', value: 'bifacial' },
    { label: 'Hocheffizienz', value: 'high_efficiency' },
    { label: 'Vollschwarze Module', value: 'black' }
  ]

  const inverterTypeOptions = [
    { label: 'Keine Präferenz', value: '' },
    { label: 'String-Wechselrichter', value: 'string' },
    { label: 'Power Optimizer', value: 'power_optimizer' },
    { label: 'Mikro-Wechselrichter', value: 'micro' },
    { label: 'Hybrid-Wechselrichter', value: 'hybrid' }
  ]

  const mountingOptions = [
    { label: 'Standard-Montage', value: '' },
    { label: 'Parallel zum Dach', value: 'parallel' },
    { label: 'Aufgeständert', value: 'elevated' },
    { label: 'Dachintegriert', value: 'integrated' },
    { label: 'Freifläche', value: 'ground' }
  ]

  const batterySizeOptions = [
    { label: 'Automatische Dimensionierung', value: '' },
    { label: 'Klein (bis 5 kWh)', value: 'small' },
    { label: 'Mittel (5-10 kWh)', value: 'medium' },
    { label: 'Groß (10-20 kWh)', value: 'large' },
    { label: 'Sehr groß (> 20 kWh)', value: 'very_large' }
  ]

  const batteryTypeOptions = [
    { label: 'Keine Präferenz', value: '' },
    { label: 'Lithium-Ionen', value: 'lithium_ion' },
    { label: 'LiFePO4', value: 'lifepo4' },
    { label: 'Salzwasser', value: 'salt_water' },
    { label: 'Blei-Säure', value: 'lead_acid' }
  ]

  const hpTypeOptions = [
    { label: 'Automatische Auswahl', value: '' },
    { label: 'Luft-Wasser', value: 'air_water' },
    { label: 'Sole-Wasser (Erdwärme)', value: 'ground_water' },
    { label: 'Wasser-Wasser', value: 'water_water' },
    { label: 'Luft-Luft', value: 'air_air' },
    { label: 'Hybrid-System', value: 'hybrid' }
  ]

  const hpSizeOptions = [
    { label: 'Automatische Dimensionierung', value: '' },
    { label: 'Klein (bis 6 kW)', value: 'small' },
    { label: 'Mittel (6-12 kW)', value: 'medium' },
    { label: 'Groß (12-20 kW)', value: 'large' },
    { label: 'Sehr groß (> 20 kW)', value: 'very_large' }
  ]

  const hpTimingOptions = [
    { label: 'Gleichzeitig mit PV', value: '' },
    { label: 'Sofort', value: 'immediate' },
    { label: 'Nächste Heizsaison', value: 'next_season' },
    { label: 'Zukünftig geplant', value: 'future' },
    { label: 'Noch in Evaluierung', value: 'evaluation' }
  ]

  const wallboxTypeOptions = [
    { label: 'Standard Wallbox', value: '' },
    { label: 'Basis (11 kW)', value: 'basic' },
    { label: 'Schnell (22 kW)', value: 'fast' },
    { label: 'Smart Wallbox', value: 'smart' },
    { label: 'Bidirektional (V2G)', value: 'bidirectional' },
    { label: 'Mehrere Ladepunkte', value: 'multiple' }
  ]

  const evTimingOptions = [
    { label: 'Gleichzeitig mit PV', value: '' },
    { label: 'Sofort', value: 'immediate' },
    { label: 'Bei E-Auto Kauf', value: 'car_purchase' },
    { label: 'Nächstes Jahr', value: 'next_year' },
    { label: 'Zukünftig geplant', value: 'future' }
  ]

  const monitoringOptions = [
    { label: 'Basis-Monitoring', value: '' },
    { label: 'Grundfunktionen', value: 'basic' },
    { label: 'Erweitert', value: 'advanced' },
    { label: 'Professionell', value: 'professional' },
    { label: 'Umfassend', value: 'comprehensive' }
  ]

  const installationSpeedOptions = [
    { label: 'Normal', value: '' },
    { label: 'So schnell wie möglich', value: 'asap' },
    { label: 'Geplant/Terminiert', value: 'planned' },
    { label: 'Flexibel', value: 'flexible' },
    { label: 'Nebensaison bevorzugt', value: 'off_season' }
  ]

  const installationTeamOptions = [
    { label: 'Standard Team', value: '' },
    { label: 'Kleines Team', value: 'small' },
    { label: 'Großes Team', value: 'large' },
    { label: 'Ein-Tages-Installation', value: 'single_day' },
    { label: 'Minimale Störung', value: 'minimal_disruption' }
  ]

  const consultationOptions = [
    { label: 'Standard Beratung', value: '' },
    { label: 'Ausführliche Beratung', value: 'detailed' },
    { label: 'Technische Detailberatung', value: 'technical' },
    { label: 'Finanzberatung Fokus', value: 'financial' },
    { label: 'Umwelt-Fokus', value: 'environmental' },
    { label: 'Kompakte Beratung', value: 'quick' }
  ]

  // No minimum requirements - user can proceed without selections
  const requiredOk = true

  // Progress calculation
  const totalOptions = 25
  const selectedOptions = [
    pv_interest, battery_interest, hp_interest, ev_charging_interest, smart_home_integration,
    app_control_desired, maintenance_contract_interest, insurance_interest, financing_interest,
    leasing_interest, future_expansion_planned, pool_heating_interest, climate_control_interest,
    system_size_preference, module_type_preference, inverter_type_preference, mounting_preference,
    battery_size_preference, battery_type_preference, hp_type_preference, hp_size_preference,
    wallbox_type_preference, monitoring_level_preference, consultation_preference, special_requests
  ].filter(option => option && option !== '').length

  const progressValue = Math.round((selectedOptions / totalOptions) * 100)

  // Beim Verlassen/Weiter speichern wir in den Context
  useEffect(() => {
    actions.updateOptions({
      pv_interest,
      system_size_preference,
      module_type_preference,
      inverter_type_preference,
      mounting_preference,
      battery_interest,
      battery_size_preference,
      battery_type_preference,
      backup_power_desired,
      hp_interest,
      hp_type_preference,
      hp_size_preference,
      hp_integration_timing,
      ev_charging_interest,
      wallbox_type_preference,
      ev_integration_timing,
      smart_home_integration,
      monitoring_level_preference,
      app_control_desired,
      maintenance_contract_interest,
      insurance_interest,
      financing_interest,
      leasing_interest,
      installation_speed_preference,
      installation_team_size,
      future_expansion_planned,
      pool_heating_interest,
      climate_control_interest,
      special_requests,
      consultation_preference
    })
  }, [
    pv_interest, system_size_preference, module_type_preference, inverter_type_preference, mounting_preference,
    battery_interest, battery_size_preference, battery_type_preference, backup_power_desired,
    hp_interest, hp_type_preference, hp_size_preference, hp_integration_timing,
    ev_charging_interest, wallbox_type_preference, ev_integration_timing,
    smart_home_integration, monitoring_level_preference, app_control_desired,
    maintenance_contract_interest, insurance_interest, financing_interest, leasing_interest,
    installation_speed_preference, installation_team_size,
    future_expansion_planned, pool_heating_interest, climate_control_interest,
    special_requests, consultation_preference,
    actions
  ])

  const showSuccessToast = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Optionen gespeichert',
      detail: 'Ihre Auswahl wurde erfolgreich gespeichert',
      life: 3000
    })
  }

  // Carousel für Feature Highlights
  const featureHighlights = [
    { 
      icon: 'pi pi-sun', 
      title: 'Photovoltaik', 
      description: 'Hocheffiziente Solarmodule für maximale Energieausbeute',
      color: 'text-yellow-500'
    },
    { 
      icon: 'pi pi-bolt', 
      title: 'Energiespeicher', 
      description: 'Intelligente Batteriesysteme für 24h Solarstrom',
      color: 'text-blue-500'
    },
    { 
      icon: 'pi pi-cog', 
      title: 'Wärmepumpe', 
      description: 'Effiziente Heizlösungen mit erneuerbarer Energie',
      color: 'text-green-500'
    },
    { 
      icon: 'pi pi-car', 
      title: 'E-Mobilität', 
      description: 'Intelligente Ladelösungen für Elektrofahrzeuge',
      color: 'text-purple-500'
    }
  ]

  const featureTemplate = (feature: any) => (
    <div className="feature-highlight-card p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border">
      <div className="text-center">
        <i className={`${feature.icon} ${feature.color} text-4xl mb-3`}></i>
        <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
        <p className="text-gray-600 text-sm">{feature.description}</p>
      </div>
    </div>
  )

  return (
    <div className="additional-options-container p-6 min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Toast ref={toast} />
      
      {/* Hero Header */}
      <div className="hero-header mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <i className="pi pi-sliders-h text-6xl animate-pulse"></i>
            </div>
            <h1 className="text-4xl font-bold mb-2">Zusätzliche Optionen</h1>
            <p className="text-xl opacity-90 mb-4">Komponenten, Services und Erweiterungen maßgeschneidert für Sie</p>
            <div className="flex justify-center items-center gap-4">
              <ProgressBar 
                value={progressValue} 
                className="w-64 h-3"
                style={{background: 'rgba(255,255,255,0.2)'}}
              />
              <Badge value={`${progressValue}%`} size="large" severity="info" />
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Highlights Carousel */}
      <div className="feature-highlights mb-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <div className="p-4">
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
              <i className="pi pi-star text-yellow-500 mr-2"></i>
              Unsere Lösungshighlights
            </h3>
            <Carousel 
              value={featureHighlights} 
              numVisible={3} 
              numScroll={1} 
              itemTemplate={featureTemplate}
              autoplayInterval={4000}
              className="custom-carousel"
              responsiveOptions={[
                { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
                { breakpoint: '768px', numVisible: 1, numScroll: 1 }
              ]}
            />
          </div>
        </Card>
      </div>

      {/* Grundinteressen Panel */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-heart text-red-500 text-xl"></i>
            <span className="text-xl font-bold">Grundlegende Interessen</span>
            <Badge value="Wichtig" severity="danger" />
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="pv_interest" 
              checked={pv_interest} 
              onChange={(e) => setPvInterest(e.checked || false)}
              className="text-yellow-600"
            />
            <label htmlFor="pv_interest" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-sun text-yellow-500"></i>
              <span>Photovoltaik-Anlage</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="hp_interest" 
              checked={hp_interest} 
              onChange={(e) => setHpInterest(e.checked || false)}
              className="text-green-600"
            />
            <label htmlFor="hp_interest" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-cog text-green-500"></i>
              <span>Wärmepumpe</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="ev_charging_interest" 
              checked={ev_charging_interest} 
              onChange={(e) => setEvChargingInterest(e.checked || false)}
              className="text-purple-600"
            />
            <label htmlFor="ev_charging_interest" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-car text-purple-500"></i>
              <span>E-Auto Ladestation</span>
            </label>
          </div>
        </div>
      </Panel>

      {/* PV System Optionen */}
      {pv_interest && (
        <Panel 
          header={
            <div className="flex items-center gap-3">
              <i className="pi pi-sun text-yellow-500 text-xl"></i>
              <span className="text-xl font-bold">Photovoltaik-System</span>
              <Badge value="Aktiv" severity="warning" />
            </div>
          }
          toggleable
          className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500"
        >
          <div className="grid md:grid-cols-2 gap-6 p-4">
            <Field label="Systemgröße-Präferenz" icon="pi-sliders-h">
              <Dropdown 
                value={system_size_preference}
                options={systemSizeOptions}
                onChange={(e) => setSystemSizePreference(e.value)}
                placeholder="Wählen Sie eine Systemgröße"
                className="w-full hover:border-yellow-400 transition-colors"
                tooltip="Bestimmt die Leistung Ihrer PV-Anlage"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
            
            <Field label="Modul-Typ Präferenz" icon="pi-th-large">
              <Dropdown 
                value={module_type_preference}
                options={moduleTypeOptions}
                onChange={(e) => setModuleTypePreference(e.value)}
                placeholder="Wählen Sie einen Modul-Typ"
                className="w-full hover:border-yellow-400 transition-colors"
                tooltip="Verschiedene Solarzellen-Technologien"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
            
            <Field label="Wechselrichter-Typ" icon="pi-bolt">
              <Dropdown 
                value={inverter_type_preference}
                options={inverterTypeOptions}
                onChange={(e) => setInverterTypePreference(e.value)}
                placeholder="Wählen Sie einen Wechselrichter"
                className="w-full hover:border-yellow-400 transition-colors"
                tooltip="Wandelt Gleichstrom in Wechselstrom um"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
            
            <Field label="Montage-Präferenz" icon="pi-home">
              <Dropdown 
                value={mounting_preference}
                options={mountingOptions}
                onChange={(e) => setMountingPreference(e.value)}
                placeholder="Wählen Sie eine Montageart"
                className="w-full hover:border-yellow-400 transition-colors"
                tooltip="Art der Installation auf Ihrem Dach"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
          </div>
        </Panel>
      )}

      {/* Speicher Optionen */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-database text-blue-500 text-xl"></i>
            <span className="text-xl font-bold">Energiespeicher</span>
            {battery_interest && <Badge value="Gewünscht" severity="info" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="battery_interest" 
                checked={battery_interest} 
                onChange={(e) => setBatteryInterest(e.checked || false)}
                className="text-blue-600"
              />
              <label htmlFor="battery_interest" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-battery text-blue-500"></i>
                <span>Batterie-Speicher gewünscht</span>
              </label>
              <Tooltip target=".battery-info" content="Speichert überschüssige Solarenergie für die Nacht" position="top" />
              <i className="pi pi-info-circle battery-info text-blue-400 cursor-help"></i>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="backup_power_desired" 
                checked={backup_power_desired} 
                onChange={(e) => setBackupPowerDesired(e.checked || false)}
                className="text-orange-600"
              />
              <label htmlFor="backup_power_desired" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-shield text-orange-500"></i>
                <span>Notstrom-Funktionalität gewünscht</span>
              </label>
              <Tooltip target=".backup-info" content="Stromversorgung bei Netzausfall" position="top" />
              <i className="pi pi-info-circle backup-info text-orange-400 cursor-help"></i>
            </div>
          </div>
          
          <div className="space-y-4">
            {battery_interest && (
              <>
                <Field label="Speicher-Größe" icon="pi-chart-bar">
                  <Dropdown 
                    value={battery_size_preference}
                    options={batterySizeOptions}
                    onChange={(e) => setBatterySizePreference(e.value)}
                    placeholder="Automatische Dimensionierung"
                    className="w-full hover:border-blue-400 transition-colors"
                    tooltip="Speicherkapazität in Kilowattstunden"
                    tooltipOptions={{position: 'top'}}
                  />
                </Field>
                
                <Field label="Batterie-Technologie" icon="pi-cog">
                  <Dropdown 
                    value={battery_type_preference}
                    options={batteryTypeOptions}
                    onChange={(e) => setBatteryTypePreference(e.value)}
                    placeholder="Wählen Sie eine Technologie"
                    className="w-full hover:border-blue-400 transition-colors"
                    tooltip="Verschiedene Batteriechemien mit unterschiedlichen Eigenschaften"
                    tooltipOptions={{position: 'top'}}
                  />
                </Field>
              </>
            )}
          </div>
        </div>
      </Panel>

      {/* Wärmepumpe Optionen */}
      {hp_interest && (
        <Panel 
          header={
            <div className="flex items-center gap-3">
              <i className="pi pi-cog text-green-500 text-xl"></i>
              <span className="text-xl font-bold">Wärmepumpen-System</span>
              <Badge value="Aktiv" severity="success" />
            </div>
          }
          toggleable
          className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
        >
          <div className="grid md:grid-cols-2 gap-6 p-4">
            <Field label="Wärmepumpen-Typ" icon="pi-compass">
              <Dropdown 
                value={hp_type_preference}
                options={hpTypeOptions}
                onChange={(e) => setHpTypePreference(e.value)}
                placeholder="Automatische Auswahl"
                className="w-full hover:border-green-400 transition-colors"
                tooltip="Verschiedene Wärmequellen für die Wärmepumpe"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
            
            <Field label="Leistungsklasse" icon="pi-chart-line">
              <Dropdown 
                value={hp_size_preference}
                options={hpSizeOptions}
                onChange={(e) => setHpSizePreference(e.value)}
                placeholder="Automatische Dimensionierung"
                className="w-full hover:border-green-400 transition-colors"
                tooltip="Heizleistung der Wärmepumpe"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
            
            <Field label="Integration Zeitplan" icon="pi-calendar">
              <Dropdown 
                value={hp_integration_timing}
                options={hpTimingOptions}
                onChange={(e) => setHpIntegrationTiming(e.value)}
                placeholder="Gleichzeitig mit PV"
                className="w-full hover:border-green-400 transition-colors"
                tooltip="Wann soll die Wärmepumpe installiert werden?"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
          </div>
        </Panel>
      )}

      {/* E-Mobilität */}
      {ev_charging_interest && (
        <Panel 
          header={
            <div className="flex items-center gap-3">
              <i className="pi pi-car text-purple-500 text-xl"></i>
              <span className="text-xl font-bold">E-Mobilität & Ladeinfrastruktur</span>
              <Badge value="Aktiv" severity="secondary" />
            </div>
          }
          toggleable
          className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
        >
          <div className="grid md:grid-cols-2 gap-6 p-4">
            <Field label="Wallbox-Typ" icon="pi-bolt">
              <Dropdown 
                value={wallbox_type_preference}
                options={wallboxTypeOptions}
                onChange={(e) => setWallboxTypePreference(e.value)}
                placeholder="Standard Wallbox"
                className="w-full hover:border-purple-400 transition-colors"
                tooltip="Verschiedene Ladegeschwindigkeiten und Features"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
            
            <Field label="Integration Zeitplan" icon="pi-clock">
              <Dropdown 
                value={ev_integration_timing}
                options={evTimingOptions}
                onChange={(e) => setEvIntegrationTiming(e.value)}
                placeholder="Gleichzeitig mit PV"
                className="w-full hover:border-purple-400 transition-colors"
                tooltip="Wann benötigen Sie die Ladestation?"
                tooltipOptions={{position: 'top'}}
              />
            </Field>
          </div>
        </Panel>
      )}

      {/* Smart Home & Monitoring */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-wifi text-indigo-500 text-xl"></i>
            <span className="text-xl font-bold">Smart Home & Monitoring</span>
            {(smart_home_integration || app_control_desired) && <Badge value="Gewünscht" severity="secondary" />}
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-indigo-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="smart_home_integration" 
                checked={smart_home_integration} 
                onChange={(e) => setSmartHomeIntegration(e.checked || false)}
                className="text-indigo-600"
              />
              <label htmlFor="smart_home_integration" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-home text-indigo-500"></i>
                <span>Smart Home Integration</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="app_control_desired" 
                checked={app_control_desired} 
                onChange={(e) => setAppControlDesired(e.checked || false)}
                className="text-blue-600"
              />
              <label htmlFor="app_control_desired" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-mobile text-blue-500"></i>
                <span>App-Steuerung gewünscht</span>
              </label>
            </div>
          </div>
          
          <Field label="Monitoring-Level" icon="pi-chart-pie">
            <Dropdown 
              value={monitoring_level_preference}
              options={monitoringOptions}
              onChange={(e) => setMonitoringLevelPreference(e.value)}
              placeholder="Basis-Monitoring"
              className="w-full hover:border-indigo-400 transition-colors"
              tooltip="Umfang der Überwachung und Datenanalyse"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Zusätzliche Services */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-briefcase text-teal-500 text-xl"></i>
            <span className="text-xl font-bold">Zusätzliche Services</span>
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-teal-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="maintenance_contract_interest" 
                checked={maintenance_contract_interest} 
                onChange={(e) => setMaintenanceContractInterest(e.checked || false)}
                className="text-green-600"
              />
              <label htmlFor="maintenance_contract_interest" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-wrench text-green-500"></i>
                <span>Wartungsvertrag gewünscht</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="insurance_interest" 
                checked={insurance_interest} 
                onChange={(e) => setInsuranceInterest(e.checked || false)}
                className="text-blue-600"
              />
              <label htmlFor="insurance_interest" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-shield text-blue-500"></i>
                <span>Versicherung gewünscht</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="financing_interest" 
                checked={financing_interest} 
                onChange={(e) => setFinancingInterest(e.checked || false)}
                className="text-yellow-600"
              />
              <label htmlFor="financing_interest" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-euro text-yellow-500"></i>
                <span>Finanzierung benötigt</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border hover:shadow-md transition-all">
              <Checkbox 
                inputId="leasing_interest" 
                checked={leasing_interest} 
                onChange={(e) => setLeasingInterest(e.checked || false)}
                className="text-purple-600"
              />
              <label htmlFor="leasing_interest" className="font-medium cursor-pointer flex items-center gap-2">
                <i className="pi pi-credit-card text-purple-500"></i>
                <span>Leasing interessant</span>
              </label>
            </div>
          </div>
        </div>
      </Panel>

      {/* Installation */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-users text-orange-500 text-xl"></i>
            <span className="text-xl font-bold">Installation & Durchführung</span>
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
      >
        <div className="grid md:grid-cols-2 gap-6 p-4">
          <Field label="Installationsgeschwindigkeit" icon="pi-clock">
            <Dropdown 
              value={installation_speed_preference}
              options={installationSpeedOptions}
              onChange={(e) => setInstallationSpeedPreference(e.value)}
              placeholder="Normal"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Wie schnell soll installiert werden?"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
          
          <Field label="Team-Größe Präferenz" icon="pi-users">
            <Dropdown 
              value={installation_team_size}
              options={installationTeamOptions}
              onChange={(e) => setInstallationTeamSize(e.value)}
              placeholder="Standard Team"
              className="w-full hover:border-orange-400 transition-colors"
              tooltip="Größe des Installationsteams"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
        </div>
      </Panel>

      {/* Zukünftige Erweiterungen */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-forward text-cyan-500 text-xl"></i>
            <span className="text-xl font-bold">Zukünftige Erweiterungen</span>
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-cyan-500"
      >
        <div className="grid md:grid-cols-3 gap-6 p-4">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="future_expansion_planned" 
              checked={future_expansion_planned} 
              onChange={(e) => setFutureExpansionPlanned(e.checked || false)}
              className="text-green-600"
            />
            <label htmlFor="future_expansion_planned" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-plus-circle text-green-500"></i>
              <span>System-Erweiterung geplant</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="pool_heating_interest" 
              checked={pool_heating_interest} 
              onChange={(e) => setPoolHeatingInterest(e.checked || false)}
              className="text-blue-600"
            />
            <label htmlFor="pool_heating_interest" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-eye text-blue-500"></i>
              <span>Pool-Heizung Interesse</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border hover:shadow-md transition-all">
            <Checkbox 
              inputId="climate_control_interest" 
              checked={climate_control_interest} 
              onChange={(e) => setClimateControlInterest(e.checked || false)}
              className="text-purple-600"
            />
            <label htmlFor="climate_control_interest" className="font-medium cursor-pointer flex items-center gap-2">
              <i className="pi pi-cloud text-purple-500"></i>
              <span>Klimatechnik Interesse</span>
            </label>
          </div>
        </div>
      </Panel>

      {/* Beratung & Sonstiges */}
      <Panel 
        header={
          <div className="flex items-center gap-3">
            <i className="pi pi-comments text-pink-500 text-xl"></i>
            <span className="text-xl font-bold">Beratung & Sonstiges</span>
          </div>
        }
        toggleable
        className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-pink-500"
      >
        <div className="space-y-6 p-4">
          <Field label="Beratungs-Präferenz" icon="pi-user">
            <Dropdown 
              value={consultation_preference}
              options={consultationOptions}
              onChange={(e) => setConsultationPreference(e.value)}
              placeholder="Standard Beratung"
              className="w-full hover:border-pink-400 transition-colors"
              tooltip="Art und Umfang der gewünschten Beratung"
              tooltipOptions={{position: 'top'}}
            />
          </Field>
          
          <Field label="Besondere Wünsche oder Anforderungen" icon="pi-pencil">
            <InputTextarea 
              value={special_requests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="z.B. spezielle Komponenten, besondere Installationswünsche, zeitliche Vorgaben..."
              rows={4}
              className="w-full hover:border-pink-400 transition-colors"
              autoResize
            />
          </Field>
        </div>
      </Panel>

      {/* Action Buttons */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button 
                label="Optionen speichern"
                icon="pi pi-save"
                onClick={showSuccessToast}
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
              <div className="text-sm text-gray-600 mb-2">Konfiguration zu {progressValue}% vollständig</div>
              <ProgressBar value={progressValue} className="w-48 h-2" showValue={false} />
            </div>
          </div>
          
          <Divider />
          
          <WizardNav
            backTo="/project/demand"
            nextTo="/calc/results"
            disabledNext={!requiredOk}
          />
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
