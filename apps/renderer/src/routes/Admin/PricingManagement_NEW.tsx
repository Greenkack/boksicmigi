import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatGermanNumber, formatGermanCurrency } from '../../utils/germanFormat'

// PrimeReact Imports
import { Card } from 'primereact/card'
import { Panel } from 'primereact/panel'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { FileUpload } from 'primereact/fileupload'
import { Tag } from 'primereact/tag'
import { TabView, TabPanel } from 'primereact/tabview'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Dialog } from 'primereact/dialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Textarea } from 'primereact/textarea'

// Admin API Connection
declare global {
  interface Window {
    adminAPI: {
      loadAdminSetting: (key: string, defaultValue?: any) => Promise<any>
      saveAdminSetting: (key: string, value: any) => Promise<boolean>
      parsePriceMatrixCsv: (csvData: string) => Promise<{ success: boolean, data?: any[], errors?: string[] }>
      parsePriceMatrixExcel: (excelBytes: ArrayBuffer) => Promise<{ success: boolean, data?: any[], errors?: string[] }>
      exportPriceMatrix: (format: 'csv' | 'excel') => Promise<{ success: boolean, data?: string | ArrayBuffer, filename?: string }>
    }
  }
}

interface PriceMatrixRow {
  moduleCount: number
  [storageOption: string]: number // Flexible storage options as columns
}

interface PriceMatrixData {
  rows: PriceMatrixRow[]
  columns: string[] // Available storage options
  lastModified: string
  source: 'csv' | 'excel'
}

interface UploadError {
  line?: number
  column?: string
  message: string
  type: 'error' | 'warning'
}

// Mock Data for initial display
const mockPriceMatrix: PriceMatrixData = {
  rows: [
    { moduleCount: 10, 'Ohne Speicher': 8500, 'Mit 5 kWh': 12500, 'Mit 10 kWh': 16500 },
    { moduleCount: 15, 'Ohne Speicher': 12000, 'Mit 5 kWh': 16000, 'Mit 10 kWh': 20000 },
    { moduleCount: 20, 'Ohne Speicher': 15500, 'Mit 5 kWh': 19500, 'Mit 10 kWh': 23500 },
    { moduleCount: 25, 'Ohne Speicher': 19000, 'Mit 5 kWh': 23000, 'Mit 10 kWh': 27000 },
    { moduleCount: 30, 'Ohne Speicher': 22500, 'Mit 5 kWh': 26500, 'Mit 10 kWh': 30500 }
  ],
  columns: ['Ohne Speicher', 'Mit 5 kWh', 'Mit 10 kWh'],
  lastModified: '2024-01-15T10:30:00Z',
  source: 'excel'
}

export default function PricingManagement() {
  const toast = useRef<Toast>(null)
  
  // State Management
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrixData>(mockPriceMatrix)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<PriceMatrixData | null>(null)
  const [csvData, setCsvData] = useState('')
  const [excelData, setExcelData] = useState<ArrayBuffer | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  // Load existing data on component mount
  useEffect(() => {
    loadExistingPriceMatrix()
  }, [])

  const loadExistingPriceMatrix = async () => {
    if (!window.adminAPI) return
    
    setIsLoading(true)
    try {
      // Try Excel first
      const excelBytes = await window.adminAPI.loadAdminSetting('price_matrix_excel_bytes', null)
      if (excelBytes) {
        const result = await window.adminAPI.parsePriceMatrixExcel(excelBytes)
        if (result.success && result.data) {
          setPriceMatrix({
            rows: result.data,
            columns: Object.keys(result.data[0] || {}).filter(k => k !== 'moduleCount'),
            lastModified: new Date().toISOString(),
            source: 'excel'
          })
          return
        }
      }

      // Try CSV fallback
      const csvData = await window.adminAPI.loadAdminSetting('price_matrix_csv_data', '')
      if (csvData) {
        const result = await window.adminAPI.parsePriceMatrixCsv(csvData)
        if (result.success && result.data) {
          setPriceMatrix({
            rows: result.data,
            columns: Object.keys(result.data[0] || {}).filter(k => k !== 'moduleCount'),
            lastModified: new Date().toISOString(),
            source: 'csv'
          })
        }
      }
    } catch (error) {
      console.error('Error loading price matrix:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Preis-Matrix konnte nicht geladen werden',
        life: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  // File Upload Handlers
  const handleCsvUpload = (event: any) => {
    const file = event.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csvContent = e.target?.result as string
      setCsvData(csvContent)
      parseCsvPreview(csvContent)
    }
    reader.readAsText(file)
  }

  const handleExcelUpload = (event: any) => {
    const file = event.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.current?.show({
        severity: 'error',
        summary: 'Datei zu groß',
        detail: 'Excel-Datei darf maximal 5MB groß sein',
        life: 3000
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      setExcelData(arrayBuffer)
      parseExcelPreview(arrayBuffer)
    }
    reader.readAsArrayBuffer(file)
  }

  const parseCsvPreview = async (csvContent: string) => {
    if (!window.adminAPI) return

    setIsLoading(true)
    setUploadErrors([])
    
    try {
      const result = await window.adminAPI.parsePriceMatrixCsv(csvContent)
      
      if (result.success && result.data) {
        const preview: PriceMatrixData = {
          rows: result.data,
          columns: Object.keys(result.data[0] || {}).filter(k => k !== 'moduleCount'),
          lastModified: new Date().toISOString(),
          source: 'csv'
        }
        setPreviewData(preview)
        setShowPreview(true)
        
        toast.current?.show({
          severity: 'success',
          summary: 'CSV erfolgreich geparst',
          detail: `${result.data.length} Zeilen gefunden`,
          life: 3000
        })
      } else {
        const errors: UploadError[] = (result.errors || []).map(err => ({
          message: err,
          type: 'error'
        }))
        setUploadErrors(errors)
        
        toast.current?.show({
          severity: 'error',
          summary: 'CSV-Parsing fehlgeschlagen',
          detail: 'Bitte prüfen Sie das Format',
          life: 3000
        })
      }
    } catch (error) {
      console.error('CSV parsing error:', error)
      setUploadErrors([{
        message: 'Unerwarteter Fehler beim CSV-Parsing',
        type: 'error'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const parseExcelPreview = async (arrayBuffer: ArrayBuffer) => {
    if (!window.adminAPI) return

    setIsLoading(true)
    setUploadErrors([])
    
    try {
      const result = await window.adminAPI.parsePriceMatrixExcel(arrayBuffer)
      
      if (result.success && result.data) {
        const preview: PriceMatrixData = {
          rows: result.data,
          columns: Object.keys(result.data[0] || {}).filter(k => k !== 'moduleCount'),
          lastModified: new Date().toISOString(),
          source: 'excel'
        }
        setPreviewData(preview)
        setShowPreview(true)
        
        toast.current?.show({
          severity: 'success',
          summary: 'Excel erfolgreich geparst',
          detail: `${result.data.length} Zeilen gefunden`,
          life: 3000
        })
      } else {
        const errors: UploadError[] = (result.errors || []).map(err => ({
          message: err,
          type: 'error'
        }))
        setUploadErrors(errors)
        
        toast.current?.show({
          severity: 'error',
          summary: 'Excel-Parsing fehlgeschlagen',
          detail: 'Bitte prüfen Sie das Format',
          life: 3000
        })
      }
    } catch (error) {
      console.error('Excel parsing error:', error)
      setUploadErrors([{
        message: 'Unerwarteter Fehler beim Excel-Parsing',
        type: 'error'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Save Functions
  const savePriceMatrix = async (source: 'csv' | 'excel') => {
    if (!window.adminAPI) return

    setIsLoading(true)
    try {
      let success = false
      
      if (source === 'csv' && csvData) {
        success = await window.adminAPI.saveAdminSetting('price_matrix_csv_data', csvData)
        // Clear excel data when saving CSV
        await window.adminAPI.saveAdminSetting('price_matrix_excel_bytes', null)
      } else if (source === 'excel' && excelData) {
        success = await window.adminAPI.saveAdminSetting('price_matrix_excel_bytes', excelData)
        // Clear CSV data when saving Excel
        await window.adminAPI.saveAdminSetting('price_matrix_csv_data', null)
      }

      if (success && previewData) {
        setPriceMatrix(previewData)
        setShowPreview(false)
        setPreviewData(null)
        setCsvData('')
        setExcelData(null)
        
        toast.current?.show({
          severity: 'success',
          summary: 'Gespeichert',
          detail: `Preis-Matrix (${source.toUpperCase()}) erfolgreich gespeichert`,
          life: 3000
        })
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Speichern fehlgeschlagen',
          detail: 'Preis-Matrix konnte nicht gespeichert werden',
          life: 3000
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Unerwarteter Fehler beim Speichern',
        life: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deletePriceMatrix = (source: 'csv' | 'excel') => {
    confirmDialog({
      message: `Möchten Sie die ${source.toUpperCase()}-Preis-Matrix wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (!window.adminAPI) return

        try {
          const key = source === 'csv' ? 'price_matrix_csv_data' : 'price_matrix_excel_bytes'
          const success = await window.adminAPI.saveAdminSetting(key, null)
          
          if (success) {
            // If deleting current matrix, reset to mock data
            if (priceMatrix.source === source) {
              setPriceMatrix(mockPriceMatrix)
            }
            
            toast.current?.show({
              severity: 'success',
              summary: 'Gelöscht',
              detail: `${source.toUpperCase()}-Preis-Matrix gelöscht`,
              life: 3000
            })
          }
        } catch (error) {
          console.error('Delete error:', error)
          toast.current?.show({
            severity: 'error',
            summary: 'Fehler',
            detail: 'Löschen fehlgeschlagen',
            life: 3000
          })
        }
      }
    })
  }

  // Export Functions
  const exportPriceMatrix = async (format: 'csv' | 'excel') => {
    if (!window.adminAPI) return

    try {
      const result = await window.adminAPI.exportPriceMatrix(format)
      if (result.success && result.data && result.filename) {
        // Create download
        const blob = format === 'csv' 
          ? new Blob([result.data as string], { type: 'text/csv' })
          : new Blob([result.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
        
        toast.current?.show({
          severity: 'success',
          summary: 'Export erfolgreich',
          detail: `Datei ${result.filename} heruntergeladen`,
          life: 3000
        })
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.current?.show({
        severity: 'error',
        summary: 'Export fehlgeschlagen',
        detail: 'Datei konnte nicht exportiert werden',
        life: 3000
      })
    }
  }

  // Render Functions
  const renderPriceValue = (value: number) => {
    return formatGermanCurrency(value)
  }

  const renderModuleCount = (rowData: PriceMatrixRow) => {
    return (
      <div className="font-semibold text-primary">
        {rowData.moduleCount} Module
      </div>
    )
  }

  const renderErrorList = () => {
    if (uploadErrors.length === 0) return null

    return (
      <div className="mt-3">
        <Message severity="error" text="Validierungsfehler gefunden:" />
        <ul className="mt-2 text-sm text-red-600">
          {uploadErrors.map((error, index) => (
            <li key={index} className="mb-1">
              {error.line && `Zeile ${error.line}: `}
              {error.column && `Spalte "${error.column}": `}
              {error.message}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const formatLastModified = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link 
            to="/admin" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <i className="pi pi-arrow-left text-xl" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Preis-Matrix Verwaltung
            </h1>
            <p className="text-gray-600 mt-1">
              Upload und Verwaltung der Grundpreis-Matrix für PV-Anlagen
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Current Price Matrix */}
        <Card className="shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Aktuelle Preis-Matrix
            </h2>
            <div className="flex gap-2">
              <Tag 
                severity={priceMatrix.source === 'excel' ? 'success' : 'info'}
                value={priceMatrix.source.toUpperCase()}
              />
              <Button 
                icon="pi pi-download" 
                label="CSV Export"
                size="small" 
                outlined
                onClick={() => exportPriceMatrix('csv')}
              />
              <Button 
                icon="pi pi-download" 
                label="Excel Export"
                size="small" 
                outlined
                onClick={() => exportPriceMatrix('excel')}
              />
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            Letzte Änderung: {formatLastModified(priceMatrix.lastModified)}
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <ProgressSpinner />
            </div>
          ) : (
            <DataTable 
              value={priceMatrix.rows} 
              className="p-datatable-sm"
              scrollable
              scrollHeight="400px"
            >
              <Column 
                field="moduleCount" 
                header="Anzahl Module" 
                body={renderModuleCount}
                frozen
                style={{ minWidth: '140px' }}
              />
              {priceMatrix.columns.map(column => (
                <Column 
                  key={column}
                  field={column}
                  header={column}
                  body={(rowData) => renderPriceValue(rowData[column])}
                  style={{ minWidth: '120px' }}
                />
              ))}
            </DataTable>
          )}
        </Card>

        {/* Upload Section */}
        <Card className="shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Neue Preis-Matrix hochladen
          </h2>

          <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
            
            {/* Excel Upload Tab */}
            <TabPanel header="Excel Upload (.xlsx)" leftIcon="pi pi-file-excel">
              <div className="space-y-4">
                <Message 
                  severity="info" 
                  text="Laden Sie hier die Grundpreis-Matrix als Excel-Datei (.xlsx) hoch. Die erste Spalte sollte 'Anzahl Module' enthalten, die weiteren Spalten die verschiedenen Speicheroptionen mit Preisen."
                />
                
                <FileUpload
                  mode="basic"
                  name="excelFile"
                  accept=".xlsx"
                  maxFileSize={5000000}
                  onSelect={handleExcelUpload}
                  auto
                  chooseLabel="Excel-Datei wählen"
                  className="mb-3"
                />

                {uploadErrors.length > 0 && renderErrorList()}
              </div>
            </TabPanel>

            {/* CSV Upload Tab */}
            <TabPanel header="CSV Upload" leftIcon="pi pi-file">
              <div className="space-y-4">
                <Message 
                  severity="info" 
                  text="Laden Sie hier die Grundpreis-Matrix als CSV-Datei hoch. Format: Erste Spalte 'Anzahl Module', weitere Spalten für Speicheroptionen. Trennzeichen: Komma oder Semikolon."
                />
                
                <FileUpload
                  mode="basic"
                  name="csvFile"
                  accept=".csv"
                  maxFileSize={1000000}
                  onSelect={handleCsvUpload}
                  auto
                  chooseLabel="CSV-Datei wählen"
                  className="mb-3"
                />

                {csvData && (
                  <div>
                    <h4 className="font-semibold mb-2">CSV-Inhalt Vorschau:</h4>
                    <Textarea 
                      value={csvData.substring(0, 500) + (csvData.length > 500 ? '...' : '')}
                      rows={8}
                      readOnly
                      className="w-full font-mono text-sm"
                    />
                  </div>
                )}

                {uploadErrors.length > 0 && renderErrorList()}
              </div>
            </TabPanel>
          </TabView>
        </Card>

        {/* Current Saved Data Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Excel Management */}
          <Card className="shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Excel Preis-Matrix
            </h3>
            
            <div className="space-y-3">
              {priceMatrix.source === 'excel' ? (
                <div>
                  <Tag severity="success" value="AKTIV" className="mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    Excel-Matrix ist derzeit aktiv und wird für Berechnungen verwendet.
                  </p>
                  <Button 
                    label="Excel-Matrix löschen"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    size="small"
                    onClick={() => deletePriceMatrix('excel')}
                  />
                </div>
              ) : (
                <div>
                  <Tag severity="secondary" value="INAKTIV" className="mb-2" />
                  <p className="text-sm text-gray-600">
                    Keine Excel-Matrix gespeichert.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* CSV Management */}
          <Card className="shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              CSV Preis-Matrix
            </h3>
            
            <div className="space-y-3">
              {priceMatrix.source === 'csv' ? (
                <div>
                  <Tag severity="success" value="AKTIV" className="mb-2" />
                  <p className="text-sm text-gray-600 mb-3">
                    CSV-Matrix ist derzeit aktiv und wird für Berechnungen verwendet.
                  </p>
                  <Button 
                    label="CSV-Matrix löschen"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    size="small"
                    onClick={() => deletePriceMatrix('csv')}
                  />
                </div>
              ) : (
                <div>
                  <Tag severity="secondary" value="INAKTIV" className="mb-2" />
                  <p className="text-sm text-gray-600">
                    Keine CSV-Matrix gespeichert.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog 
        header="Preis-Matrix Vorschau" 
        visible={showPreview} 
        onHide={() => setShowPreview(false)}
        style={{ width: '90vw', maxWidth: '1200px' }}
        maximizable
      >
        {previewData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Vorschau: {previewData.rows.length} Zeilen gefunden
                </h3>
                <p className="text-sm text-gray-600">
                  Spalten: {previewData.columns.join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  label="Abbrechen"
                  icon="pi pi-times"
                  outlined
                  onClick={() => setShowPreview(false)}
                />
                <Button 
                  label="Speichern"
                  icon="pi pi-check"
                  onClick={() => savePriceMatrix(previewData.source)}
                  loading={isLoading}
                />
              </div>
            </div>

            <DataTable 
              value={previewData.rows.slice(0, 10)} // Show first 10 rows
              className="p-datatable-sm"
              scrollable
              scrollHeight="400px"
            >
              <Column 
                field="moduleCount" 
                header="Anzahl Module" 
                body={renderModuleCount}
                frozen
              />
              {previewData.columns.map(column => (
                <Column 
                  key={column}
                  field={column}
                  header={column}
                  body={(rowData) => renderPriceValue(rowData[column])}
                />
              ))}
            </DataTable>

            {previewData.rows.length > 10 && (
              <p className="text-sm text-gray-600 text-center">
                ... und {previewData.rows.length - 10} weitere Zeilen
              </p>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}