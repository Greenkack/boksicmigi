import React, { useState, useEffect } from "react";
import ProjectDashboard_PrimeReact from "../components/ProjectDashboard_PrimeReact";
import "./Dashboard.css";

// Extended Dashboard with Calculation Bridge Integration
declare global {
  interface Window {
    calculationAPI: any;
  }
}

interface CalculationResult {
  base_matrix_price_netto?: number;
  total_investment_netto?: number;
  total_investment_brutto?: number;
  anlage_kwp?: number;
  annual_pv_production_kwh?: number;
  einspeiseverguetung_total?: number;
  wirtschaftlichkeit_score?: number;
  amortization_years?: number;
  [key: string]: any;
}

export default function Dashboard(): JSX.Element {
  const [calculationResults, setCalculationResults] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState({
    totalProjects: 0,
    totalInvestment: 0,
    averageROI: 0,
    totalCapacity: 0
  });

  // Load latest calculation results for dashboard
  const loadLatestCalculations = async () => {
    setLoading(true);
    try {
      // Sample calculation for demo - would normally load from projects
      const sampleData = {
        anlage_kwp: 10.5,
        module_count: 25,
        selected_module_id: 150,
        selected_inverter_id: null,
        selected_battery_id: null,
        annual_consumption_kwh: 4500,
        eigenverbrauchsanteil_percent: 70,
        electricity_price_cent_per_kwh: 30
      };

      const result = await window.calculationAPI.performCalculations(sampleData);
      if (result && result.success) {
        setCalculationResults(result.data);
        updateKPIs(result.data);
      }
    } catch (error) {
      console.error('Failed to load calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateKPIs = (calculations: CalculationResult) => {
    setKpis({
      totalProjects: 1, // Would be from database in real app
      totalInvestment: calculations.total_investment_netto || 0,
      averageROI: calculations.wirtschaftlichkeit_score || 0,
      totalCapacity: calculations.anlage_kwp || 0
    });
  };

  useEffect(() => {
    if (window.calculationAPI) {
      loadLatestCalculations();
    }
  }, []);
  return (
    <div className="dashboard-container">
      <h1>📊 Dashboard mit Live-Berechnungen</h1>
      
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card-blue">
          <h3 className="kpi-value">
            {kpis.totalCapacity.toFixed(1)}
          </h3>
          <p className="kpi-label">kWp Gesamtleistung</p>
        </div>

        <div className="kpi-card kpi-card-green">
          <h3 className="kpi-value">
            €{(kpis.totalInvestment / 1000).toFixed(0)}k
          </h3>
          <p className="kpi-label">Gesamtinvestition</p>
        </div>

        <div className="kpi-card kpi-card-yellow">
          <h3 className="kpi-value">
            {kpis.averageROI.toFixed(1)}%
          </h3>
          <p className="kpi-label">Wirtschaftlichkeit</p>
        </div>

        <div className="kpi-card kpi-card-red">
          <h3 className="kpi-value">
            {calculationResults?.amortization_years?.toFixed(1) || '0'}
          </h3>
          <p className="kpi-label">Jahre Amortisation</p>
        </div>
      </div>
      </div>

      {/* Live Calculation Results */}
      {calculationResults && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h2>🧮 Live-Berechnungsergebnisse</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4>💰 Finanzielle Kennzahlen</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '5px 0', borderBottom: '1px solid #dee2e6' }}>
                  <strong>Netto-Investition:</strong> €{(calculationResults?.total_investment_netto || 0).toLocaleString()}
                </li>
                <li style={{ padding: '5px 0', borderBottom: '1px solid #dee2e6' }}>
                  <strong>Brutto-Investition:</strong> €{(calculationResults?.total_investment_brutto || 0).toLocaleString()}
                </li>
                <li style={{ padding: '5px 0', borderBottom: '1px solid #dee2e6' }}>
                  <strong>Matrix-Grundpreis:</strong> €{(calculationResults?.base_matrix_price_netto || 0).toLocaleString()}
                </li>
                <li style={{ padding: '5px 0' }}>
                  <strong>Einspeisevergütung (Total):</strong> €{(calculationResults?.einspeiseverguetung_total || 0).toLocaleString()}
                </li>
              </ul>
            </div>
      {/* Live Calculation Results */}
      {calculationResults && (
        <div className="calculation-results-container">
          <h2>🧮 Live-Berechnungsergebnisse</h2>
          
          <div className="calculation-grid">
            <div>
              <h4>💰 Finanzielle Kennzahlen</h4>
              <ul className="calculation-list">
                <li className="calculation-item">
                  <strong>Netto-Investition:</strong> €{(calculationResults?.total_investment_netto || 0).toLocaleString()}
                </li>
                <li className="calculation-item">
                  <strong>Brutto-Investition:</strong> €{(calculationResults?.total_investment_brutto || 0).toLocaleString()}
                </li>
                <li className="calculation-item">
                  <strong>Matrix-Grundpreis:</strong> €{(calculationResults?.base_matrix_price_netto || 0).toLocaleString()}
                </li>
                <li className="calculation-item">
                  <strong>Einspeisevergütung (Total):</strong> €{(calculationResults?.einspeiseverguetung_total || 0).toLocaleString()}
                </li>
              </ul>
            </div>

            <div>
              <h4>⚡ Technische Kennzahlen</h4>
              <ul className="calculation-list">
                <li className="calculation-item">
                  <strong>Anlagenleistung:</strong> {(calculationResults?.anlage_kwp || 0).toFixed(2)} kWp
                </li>
                <li className="calculation-item">
                  <strong>Jahresertrag:</strong> {(calculationResults?.annual_pv_production_kwh || 0).toLocaleString()} kWh
                </li>
                <li className="calculation-item">
                  <strong>Wirtschaftlichkeit:</strong> {(calculationResults?.wirtschaftlichkeit_score || 0).toFixed(1)}%
                </li>
                <li className="calculation-item">
                  <strong>Amortisationszeit:</strong> {(calculationResults?.amortization_years || 0).toFixed(1)} Jahre
                </li>
              </ul>
            </div>
          </div>

          <button 
            onClick={loadLatestCalculations}
            disabled={loading}
            className="refresh-button"
          >
            {loading ? '⏳ Berechnet...' : '🔄 Berechnungen aktualisieren'}
          </button>
        </div>
      )}
      {/* Original Dashboard Component */}
      <div className="project-dashboard-section">
        <h2>📋 Projekt-Dashboard</h2>
        <ProjectDashboard_PrimeReact />
      </div>
