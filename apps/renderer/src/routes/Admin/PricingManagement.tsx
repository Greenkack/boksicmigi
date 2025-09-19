import React, { useState, useMemo, useRef } from 'react'
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
    category: 'battery',
    basePrice: 800,
    pricePerKwh: 450,
    minSize: 5,
    maxSize: 15,
    validFrom: '2024-01-01',
    isActive: true,
    conditions: [
      'LiFePO4 Technologie',
      '10 Jahre Garantie',
      'AC-gekoppelt'
    ],
    discounts: [
      {
        id: 'd4',
        name: 'Kombi-Rabatt mit PV',
        type: 'percentage',
        value: 10,
        conditions: 'Bei gleichzeitigem PV-Kauf'
      }
    ]
  },
  {
    id: '4',
    name: 'Wallbox Installation',
    category: 'wallbox',
    basePrice: 1200,
    pricePerKw: 0,
    validFrom: '2024-01-01',
    isActive: true,
    conditions: [
      '11 kW Ladeleistung',
      'RFID & App-Steuerung',
      'Installation inklusive',
      'Anmeldung beim Netzbetreiber'
    ],
    discounts: [
      {
        id: 'd5',
        name: 'Kombi mit PV-Anlage',
        type: 'fixed',
        value: 200,
        conditions: 'Bei gleichzeitigem PV-System'
      }
    ]
  }
]

const categoryLabels = {
  pv_system: 'PV-Systeme',
  battery: 'Batteriespeicher',
  wallbox: 'Wallboxen',
  heatpump: 'Wärmepumpen',
  service: 'Service & Wartung'
}

const discountTypeLabels = {
  percentage: 'Prozent',
  fixed: 'Festbetrag',
  volume: 'Mengenrabatt'
}

export default function PricingManagement() {
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrix[]>(mockPriceMatrix)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const filteredPrices = useMemo(() => {
    return priceMatrix.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = showInactive || item.isActive
      return matchesCategory && matchesSearch && matchesStatus
    })
  }, [priceMatrix, selectedCategory, searchTerm, showInactive])

  const calculateTotalPrice = (item: PriceMatrix, size: number) => {
    const variablePrice = size * (item.pricePerKw || item.pricePerKwh || 0)
    let total = item.basePrice + variablePrice

    // Apply discounts
    item.discounts.forEach(discount => {
      if (discount.minQuantity && size < discount.minQuantity) return
      
      if (discount.type === 'percentage') {
        total = total * (1 - discount.value / 100)
      } else if (discount.type === 'fixed') {
        total = total - discount.value
      }
    })

    return Math.max(0, total)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to="/admin" className="text-slate-500 hover:text-slate-700">Admin</Link>
                <span className="text-slate-400">/</span>
                <span className="text-slate-900 font-medium">Preismatrix</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">💰 Preismatrix-Verwaltung</h1>
              <p className="text-slate-600">Verwalten Sie Ihre Preisstrukturen und Rabatte</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                + Preisgruppe hinzufügen
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Preise exportieren
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Preisgruppe suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">🔍</div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Alle
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === key 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Toggle inactive */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Inaktive anzeigen</span>
            </label>
          </div>
        </div>

        {/* Price Matrix */}
        <div className="space-y-4">
          {filteredPrices.map(item => (
            <PriceMatrixCard 
              key={item.id} 
              item={item} 
              isEditing={editingItem === item.id}
              onEdit={() => setEditingItem(editingItem === item.id ? null : item.id)}
              onSave={() => setEditingItem(null)}
              calculateTotalPrice={calculateTotalPrice}
            />
          ))}
        </div>

        {filteredPrices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Preisgruppen gefunden</h3>
            <p className="text-slate-600">
              {searchTerm ? `Keine Preise für "${searchTerm}"` : 'Keine Preise in dieser Kategorie'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Price Matrix Card Component
function PriceMatrixCard({ 
  item, 
  isEditing, 
  onEdit, 
  onSave, 
  calculateTotalPrice 
}: { 
  item: PriceMatrix
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  calculateTotalPrice: (item: PriceMatrix, size: number) => number
}) {
  const [exampleSize, setExampleSize] = useState(item.minSize || 5)

  const examplePrice = calculateTotalPrice(item, exampleSize)
  const pricePerUnit = item.pricePerKw || item.pricePerKwh || 0
  const unit = item.pricePerKw ? 'kW' : item.pricePerKwh ? 'kWh' : ''

  return (
    <div className={`bg-white rounded-lg border p-6 ${!item.isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {categoryLabels[item.category]}
            </span>
            {!item.isActive && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Inaktiv
              </span>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-sm text-slate-600 mb-1">Grundpreis</div>
              <div className="text-lg font-bold text-slate-900">
                {formatGermanCurrency(item.basePrice)}
              </div>
            </div>
            
            {pricePerUnit > 0 && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-sm text-slate-600 mb-1">Pro {unit}</div>
                <div className="text-lg font-bold text-slate-900">
                  {formatGermanCurrency(pricePerUnit)}
                </div>
              </div>
            )}
            
            {item.minSize && item.maxSize && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-sm text-slate-600 mb-1">Größenbereich</div>
                <div className="text-lg font-bold text-slate-900">
                  {formatGermanNumber(item.minSize, 0)} - {formatGermanNumber(item.maxSize, 0)} {unit}
                </div>
              </div>
            )}
            
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-700 mb-1">Beispiel ({exampleSize} {unit})</div>
              <div className="text-lg font-bold text-green-800">
                {formatGermanCurrency(examplePrice)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {isEditing ? 'Abbrechen' : 'Bearbeiten'}
          </button>
          <button className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
            Duplizieren
          </button>
        </div>
      </div>

      {/* Example Calculator */}
      {pricePerUnit > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-blue-900">
              Beispielrechnung:
            </label>
            <input
              type="range"
              min={item.minSize || 1}
              max={item.maxSize || 50}
              value={exampleSize}
              onChange={(e) => setExampleSize(Number(e.target.value))}
              className="flex-1"
            />
            <div className="text-sm font-medium text-blue-900 min-w-[120px]">
              {formatGermanNumber(exampleSize, 1)} {unit} = {formatGermanCurrency(examplePrice)}
            </div>
          </div>
        </div>
      )}

      {/* Conditions */}
      {item.conditions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Konditionen:</h4>
          <div className="flex flex-wrap gap-2">
            {item.conditions.map((condition, index) => (
              <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Discounts */}
      {item.discounts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Rabatte:</h4>
          <div className="space-y-2">
            {item.discounts.map(discount => (
              <div key={discount.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                <div>
                  <span className="font-medium text-green-800">{discount.name}</span>
                  <span className="text-sm text-green-600 ml-2">
                    ({discountTypeLabels[discount.type]}: {
                      discount.type === 'percentage' 
                        ? `${formatGermanNumber(discount.value, 1)}%`
                        : formatGermanCurrency(discount.value)
                    })
                  </span>
                </div>
                <div className="text-sm text-green-600">
                  {discount.conditions}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validity */}
      <div className="flex justify-between text-sm text-slate-500 border-t pt-3">
        <span>Gültig von: {new Date(item.validFrom).toLocaleDateString('de-DE')}</span>
        {item.validUntil && (
          <span>bis: {new Date(item.validUntil).toLocaleDateString('de-DE')}</span>
        )}
      </div>
    </div>
  )
}
