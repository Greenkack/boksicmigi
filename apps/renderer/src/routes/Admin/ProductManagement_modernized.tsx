import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Image } from 'primereact/image';

interface Product {
  id?: number;
  category?: string;
  model_name?: string;
  brand?: string;
  price_euro?: number;
  capacity_w?: number | null;
  storage_power_kw?: number | null;
  power_kw?: number | null;
  max_cycles?: number | null;
  warranty_years?: number;
  length_m?: number | null;
  width_m?: number | null;
  weight_kg?: number | null;
  efficiency_percent?: number | null;
  origin_country?: string;
  description?: string;
  pros?: string;
  cons?: string;
  rating?: number | null;
  image_base64?: string;
  datasheet_link_db_path?: string;
  additional_cost_netto?: number;
  company_id?: number | null;
  cell_technology?: string;
  module_structure?: string;
  cell_type?: string;
  version?: string;
  module_warranty_text?: string;
  labor_hours?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface ProductFormData extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
}

type ProductCategory = 'Modul' | 'Wechselrichter' | 'Batteriespeicher' | 'Wallbox' | 'Zubehör' | 'Sonstiges';

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Modul',
  'Wechselrichter', 
  'Batteriespeicher',
  'Wallbox',
  'Zubehör',
  'Sonstiges'
];

const categoryOptions = [
  { label: 'Alle Kategorien', value: '' },
  ...PRODUCT_CATEGORIES.map(cat => ({ label: cat, value: cat }))
];

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: 1,
    category: 'Modul',
    model_name: 'SolarMax 400W',
    brand: 'SolarTech',
    price_euro: 299.99,
    capacity_w: 400,
    warranty_years: 25,
    efficiency_percent: 22.1,
    origin_country: 'Deutschland',
    rating: 4.5,
    description: 'Hocheffizientes Solarmodul für Wohngebäude'
  },
  {
    id: 2,
    category: 'Wechselrichter',
    model_name: 'PowerInvert 5000',
    brand: 'InvertTech',
    price_euro: 1299.99,
    power_kw: 5.0,
    warranty_years: 10,
    efficiency_percent: 97.5,
    origin_country: 'Deutschland',
    rating: 4.8,
    description: 'Dreiphasiger Wechselrichter mit MPPT-Technologie'
  },
  {
    id: 3,
    category: 'Batteriespeicher',
    model_name: 'EnergyStore 10kWh',
    brand: 'BatteryPro',
    price_euro: 8999.99,
    storage_power_kw: 10.0,
    max_cycles: 6000,
    warranty_years: 15,
    origin_country: 'Südkorea',
    rating: 4.3,
    description: 'Lithium-Ionen Speichersystem für Eigenheime'
  }
];

export default function ProductManagement(): JSX.Element {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const toast = useRef<Toast>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    category: 'Modul',
    model_name: '',
    brand: '',
    price_euro: 0,
    capacity_w: null,
    storage_power_kw: null,
    power_kw: null,
    max_cycles: null,
    warranty_years: 0,
    length_m: null,
    width_m: null,
    weight_kg: null,
    efficiency_percent: null,
    origin_country: '',
    description: '',
    pros: '',
    cons: '',
    rating: null,
    image_base64: '',
    datasheet_link_db_path: '',
    additional_cost_netto: 0,
    company_id: null,
    cell_technology: '',
    module_structure: '',
    cell_type: '',
    version: '',
    module_warranty_text: '',
    labor_hours: null
  });

  const filteredProducts = products.filter(product => {
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesSearch = !searchText || 
      product.model_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const productStats = {
    total: products.length,
    categories: PRODUCT_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = products.filter(p => p.category === cat).length;
      return acc;
    }, {} as Record<string, number>)
  };

  const showSuccessToast = (message: string) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Erfolgreich',
      detail: message,
      life: 3000
    });
  };

  const showErrorToast = (message: string) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Fehler',
      detail: message,
      life: 4000
    });
  };

  const openNew = () => {
    setFormData({
      category: 'Modul',
      model_name: '',
      brand: '',
      price_euro: 0,
      capacity_w: null,
      storage_power_kw: null,
      power_kw: null,
      max_cycles: null,
      warranty_years: 0,
      length_m: null,
      width_m: null,
      weight_kg: null,
      efficiency_percent: null,
      origin_country: '',
      description: '',
      pros: '',
      cons: '',
      rating: null,
      image_base64: '',
      datasheet_link_db_path: '',
      additional_cost_netto: 0,
      company_id: null,
      cell_technology: '',
      module_structure: '',
      cell_type: '',
      version: '',
      module_warranty_text: '',
      labor_hours: null
    });
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const editProduct = (product: Product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const deleteProduct = (product: Product) => {
    confirmDialog({
      message: `Möchten Sie das Produkt "${product.model_name}" wirklich löschen?`,
      header: 'Produkt löschen',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        setProducts(prev => prev.filter(p => p.id !== product.id));
        showSuccessToast(`Produkt "${product.model_name}" wurde gelöscht`);
      }
    });
  };

  const saveProduct = () => {
    if (!formData.model_name || !formData.brand || !formData.category) {
      showErrorToast('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...formData, id: editingProduct.id } : p
      ));
      showSuccessToast('Produkt wurde aktualisiert');
    } else {
      const newProduct = { ...formData, id: Date.now() };
      setProducts(prev => [...prev, newProduct]);
      showSuccessToast('Neues Produkt wurde erstellt');
    }
    
    setIsFormOpen(false);
  };

  // Template Functions
  const categoryTemplate = (rowData: Product) => {
    const categoryColors: Record<string, "success" | "info" | "secondary" | "contrast" | "danger" | "warning"> = {
      'Modul': 'info',
      'Wechselrichter': 'success',
      'Batteriespeicher': 'warning',
      'Wallbox': 'danger',
      'Zubehör': 'secondary',
      'Sonstiges': 'contrast'
    };
    
    return (
      <Tag 
        value={rowData.category}
        severity={categoryColors[rowData.category || 'Sonstiges']}
        rounded
      />
    );
  };

  const priceTemplate = (rowData: Product) => (
    <div className="text-right font-medium">
      {rowData.price_euro?.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR'
      })}
    </div>
  );

  const ratingTemplate = (rowData: Product) => (
    <div className="flex items-center gap-2">
      <Rating value={rowData.rating || 0} readOnly cancel={false} />
      <small className="text-gray-500">({rowData.rating || 0})</small>
    </div>
  );

  const powerTemplate = (rowData: Product) => {
    if (rowData.capacity_w) {
      return <span>{rowData.capacity_w}W</span>;
    }
    if (rowData.power_kw) {
      return <span>{rowData.power_kw}kW</span>;
    }
    if (rowData.storage_power_kw) {
      return <span>{rowData.storage_power_kw}kWh</span>;
    }
    return <span className="text-gray-400">-</span>;
  };

  const actionTemplate = (rowData: Product) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-text p-button-sm"
        tooltip="Details anzeigen"
        tooltipOptions={{position: 'top'}}
      />
      <Button
        icon="pi pi-pencil"
        onClick={() => editProduct(rowData)}
        className="p-button-text p-button-sm"
        tooltip="Bearbeiten"
        tooltipOptions={{position: 'top'}}
      />
      <Button
        icon="pi pi-trash"
        onClick={() => deleteProduct(rowData)}
        className="p-button-text p-button-danger p-button-sm"
        tooltip="Löschen"
        tooltipOptions={{position: 'top'}}
      />
    </div>
  );

  const leftToolbarTemplate = () => (
    <div className="flex gap-2">
      <Button
        label="Neues Produkt"
        icon="pi pi-plus"
        onClick={openNew}
        className="p-button-success"
        raised
      />
      <Button
        label="Import"
        icon="pi pi-upload"
        className="p-button-info"
        outlined
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex gap-2">
      <Button
        label="Export"
        icon="pi pi-download"
        className="p-button-secondary"
        outlined
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-8xl mx-auto p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      {/* Hero Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <i className="pi pi-box text-3xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Produktverwaltung</h1>
                <p className="text-green-100 text-lg">Verwalten Sie Ihr Produktsortiment und Preise</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{productStats.total}</div>
              <div className="text-sm text-green-200">Produkte</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-4">
        {PRODUCT_CATEGORIES.map((category, index) => {
          const colors = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'];
          const color = colors[index % colors.length];
          
          return (
            <Card key={category} className={`shadow-md border-l-4 border-l-${color}-500 hover:shadow-lg transition-shadow`}>
              <div className="p-3 text-center">
                <div className={`bg-${color}-100 p-2 rounded-full mx-auto mb-2 w-fit`}>
                  <i className={`pi pi-box text-${color}-600`}></i>
                </div>
                <div className="text-xl font-bold text-gray-900">{productStats.categories[category] || 0}</div>
                <div className="text-xs text-gray-600">{category}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-0">
        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                placeholder="Produkte suchen..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
              />
            </span>
            
            <Dropdown
              value={filterCategory}
              options={categoryOptions}
              onChange={(e) => setFilterCategory(e.value)}
              placeholder="Kategorie filtern"
              className="w-48"
              showClear
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} von {products.length} Produkten
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          value={filteredProducts}
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value as Product[])}
          selectionMode="multiple"
          dataKey="id"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="p-datatable-gridlines"
          globalFilter={searchText}
          emptyMessage="Keine Produkte gefunden"
          loading={loading}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field="model_name" header="Produktname" sortable className="font-medium"></Column>
          <Column field="brand" header="Marke" sortable></Column>
          <Column field="category" header="Kategorie" body={categoryTemplate} sortable></Column>
          <Column field="power" header="Leistung" body={powerTemplate}></Column>
          <Column field="price_euro" header="Preis" body={priceTemplate} sortable></Column>
          <Column field="rating" header="Bewertung" body={ratingTemplate}></Column>
          <Column field="warranty_years" header="Garantie" sortable body={(rowData) => 
            `${rowData.warranty_years || 0} Jahre`
          }></Column>
          <Column body={actionTemplate} header="Aktionen" style={{ width: '12rem' }}></Column>
        </DataTable>
      </Card>

      {/* Product Form Dialog */}
      <Dialog
        header={editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
        visible={isFormOpen}
        onHide={() => setIsFormOpen(false)}
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
        maximizable
      >
        <div className="space-y-6 p-4">
          {/* Basic Information */}
          <Panel header="Grundinformationen" className="shadow-md">
            <div className="grid md:grid-cols-2 gap-4 p-4">
              <div>
                <label className="block text-sm font-medium mb-2">Produktname *</label>
                <InputText
                  value={formData.model_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                  placeholder="z.B. SolarMax 400W"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Marke *</label>
                <InputText
                  value={formData.brand || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="z.B. SolarTech"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Kategorie *</label>
                <Dropdown
                  value={formData.category}
                  options={PRODUCT_CATEGORIES.map(cat => ({ label: cat, value: cat }))}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.value }))}
                  placeholder="Kategorie auswählen"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Preis (€) *</label>
                <InputNumber
                  value={formData.price_euro}
                  onValueChange={(e) => setFormData(prev => ({ ...prev, price_euro: e.value || 0 }))}
                  mode="currency"
                  currency="EUR"
                  locale="de-DE"
                  className="w-full"
                />
              </div>
            </div>
          </Panel>

          {/* Technical Specifications */}
          <Panel header="Technische Daten" className="shadow-md">
            <div className="grid md:grid-cols-3 gap-4 p-4">
              <div>
                <label className="block text-sm font-medium mb-2">Leistung (W)</label>
                <InputNumber
                  value={formData.capacity_w}
                  onValueChange={(e) => setFormData(prev => ({ ...prev, capacity_w: e.value }))}
                  placeholder="400"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Wirkungsgrad (%)</label>
                <InputNumber
                  value={formData.efficiency_percent}
                  onValueChange={(e) => setFormData(prev => ({ ...prev, efficiency_percent: e.value }))}
                  placeholder="22.1"
                  maxFractionDigits={2}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Garantie (Jahre)</label>
                <InputNumber
                  value={formData.warranty_years}
                  onValueChange={(e) => setFormData(prev => ({ ...prev, warranty_years: e.value || 0 }))}
                  placeholder="25"
                  className="w-full"
                />
              </div>
            </div>
          </Panel>

          {/* Description */}
          <Panel header="Beschreibung" className="shadow-md">
            <div className="p-4">
              <label className="block text-sm font-medium mb-2">Produktbeschreibung</label>
              <InputTextarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaillierte Produktbeschreibung..."
                rows={4}
                className="w-full"
              />
            </div>
          </Panel>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              label="Abbrechen"
              onClick={() => setIsFormOpen(false)}
              className="p-button-secondary"
              outlined
            />
            <Button
              label={editingProduct ? 'Speichern' : 'Erstellen'}
              icon="pi pi-save"
              onClick={saveProduct}
              className="p-button-success"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}