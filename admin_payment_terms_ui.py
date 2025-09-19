"""
admin_payment_terms_ui.py
--------------------------

Erweiterte Benutzeroberfläche für Administratoren zur umfassenden Konfiguration 
der Zahlungsmodalitäten. Das Modul bietet:

1. Verwaltung verschiedener Zahlungsoptionen (Bar, Raten, Finanzierung)
2. Konfiguration von Rabatten und Konditionen
3. Bearbeitung rechtlicher Texte und Bedingungen
4. Vorschau der konfigurierten Zahlungsmodalitäten
5. Import/Export von Zahlungskonfigurationen

Das UI folgt dem Stil anderer Admin‑Module im Projekt und verwendet
Tabs/Expander zur übersichtlichen Darstellung. Die Einstellungen werden
dauerhaft in der Admin‑Datenbank gespeichert.

Autor: System Integration für erweiterte Zahlungsmodalitäten
Version: 2.0 - Vollständig überarbeitet für umfassende Funktionalität
"""

import streamlit as st
from typing import Dict, Any, List, Callable, Optional, Union
import json
import base64
from datetime import datetime, timedelta
import io

# Importiere bestehende Payment Terms falls verfügbar
try:
    from payment_terms import (
        get_payment_terms_config,
        save_payment_terms_config,
    )
    PAYMENT_TERMS_AVAILABLE = True
except ImportError:
    def get_payment_terms_config():
        return {}
    def save_payment_terms_config(config):
        return False
    PAYMENT_TERMS_AVAILABLE = False




def get_comprehensive_default_payment_terms() -> Dict[str, Any]:
    """Umfassende Standard-Zahlungsmodalitäten zurückgeben."""
    return {
        "payment_options": [
            {
                "id": "cash_full",
                "name": "Vollzahlung bei Auftragserteilung",
                "description": "100% Zahlung bei Vertragsabschluss",
                "discount_percent": 3.0,
                "enabled": True,
                "icon": "💰",
                "payment_type": "immediate",
                "conditions": {
                    "payment_due_days": 0,
                    "early_payment_bonus": True
                }
            },
            {
                "id": "cash_delivery",
                "name": "Barzahlung bei Lieferung",
                "description": "Zahlung bei Anlieferung der Komponenten",
                "discount_percent": 2.0,
                "enabled": True,
                "icon": "🚚",
                "payment_type": "on_delivery"
            },
            {
                "id": "installments_2",
                "name": "2 Raten (50/50)",
                "description": "Zahlung in 2 gleichen Raten",
                "discount_percent": 1.0,
                "enabled": True,
                "icon": "📊",
                "payment_type": "installments",
                "installment_schedule": [
                    {"percentage": 50.0, "due_days": 0, "description": "Bei Auftragserteilung", "label": "Anzahlung"},
                    {"percentage": 50.0, "due_days": 30, "description": "Bei Fertigstellung", "label": "Restzahlung"}
                ]
            },
            {
                "id": "installments_3",
                "name": "3 Raten",
                "description": "Zahlung in 3 gleichen Raten",
                "discount_percent": 0.0,
                "enabled": True,
                "icon": "📊",
                "payment_type": "installments",
                "installment_schedule": [
                    {"percentage": 40.0, "due_days": 0, "description": "Bei Auftragserteilung", "label": "Anzahlung"},
                    {"percentage": 40.0, "due_days": 30, "description": "Bei Lieferung", "label": "Zwischenzahlung"},
                    {"percentage": 20.0, "due_days": 60, "description": "Nach Fertigstellung", "label": "Restzahlung"}
                ]
            },
            {
                "id": "installments_custom",
                "name": "Individuelle Ratenzahlung",
                "description": "Kundenspezifische Zahlungsaufteilung",
                "discount_percent": 0.0,
                "enabled": False,
                "icon": "⚙️",
                "payment_type": "custom_installments",
                "customizable": True
            },
            {
                "id": "financing_solar",
                "name": "Solarfinanzierung",
                "description": "Finanzierung über Partnerbank mit attraktiven Konditionen",
                "discount_percent": 0.0,
                "enabled": True,
                "icon": "🏦",
                "payment_type": "financing",
                "financing_options": [
                    {
                        "name": "Standard-Finanzierung",
                        "duration_months": 60,
                        "interest_rate": 2.9,
                        "monthly_fee": 0.0,
                        "min_amount": 5000.0,
                        "max_amount": 100000.0
                    },
                    {
                        "name": "Langzeit-Finanzierung",
                        "duration_months": 84,
                        "interest_rate": 3.4,
                        "monthly_fee": 0.0,
                        "min_amount": 10000.0,
                        "max_amount": 150000.0
                    },
                    {
                        "name": "Premium-Finanzierung",
                        "duration_months": 120,
                        "interest_rate": 3.9,
                        "monthly_fee": 5.0,
                        "min_amount": 15000.0,
                        "max_amount": 200000.0
                    }
                ]
            },
            {
                "id": "leasing",
                "name": "Solar-Leasing",
                "description": "Keine Anschaffungskosten - monatliche Leasingrate",
                "discount_percent": 0.0,
                "enabled": False,
                "icon": "📋",
                "payment_type": "leasing",
                "leasing_options": [
                    {
                        "duration_months": 120,
                        "monthly_rate_factor": 0.012,
                        "buyout_option": True,
                        "buyout_percentage": 10.0
                    }
                ]
            }
        ],
        "general_terms": {
            "warranty_years": 25,
            "installation_warranty_years": 2,
            "performance_warranty_years": 10,
            "payment_due_days": 14,
            "late_payment_fee_percent": 8.0,
            "deposit_required": True,
            "deposit_percentage": 30.0,
            "min_deposit_amount": 1000.0,
            "contract_validity_days": 30,
            "price_validity_days": 14,
            "installation_period_weeks": 8,
            "completion_bonus_percent": 1.0,
            "early_completion_bonus_days": 7
        },
        "discount_rules": {
            "volume_discounts": [
                {"min_kwp": 10.0, "discount_percent": 1.0},
                {"min_kwp": 20.0, "discount_percent": 2.0},
                {"min_kwp": 50.0, "discount_percent": 3.0}
            ],
            "seasonal_discount": {
                "enabled": False,
                "months": [11, 12, 1, 2],
                "discount_percent": 2.0
            },
            "referral_discount": {
                "enabled": True,
                "discount_percent": 500.0,
                "discount_type": "fixed_amount"
            }
        },
        "legal_texts": {
            "payment_terms": """Zahlungsbedingungen:
Die Zahlung erfolgt entsprechend der gewählten Zahlungsmodalität. Bei Verzug werden Verzugszinsen in gesetzlicher Höhe berechnet. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.""",
            
            "warranty_info": """Garantieleistungen:
- 25 Jahre Produktgarantie auf Solarmodule
- 10 Jahre Leistungsgarantie (min. 90% der Nennleistung)
- 2 Jahre Montagegarantie
- Herstellergarantie auf Wechselrichter gemäß Datenblatt""",
            
            "delivery_info": """Lieferung und Installation:
Die Lieferzeit beträgt in der Regel 4-8 Wochen nach Auftragsbestätigung. Die Installation wird durch zertifizierte Fachbetriebe durchgeführt. Der Kunde wird rechtzeitig über den Installationstermin informiert.""",
            
            "cancellation_policy": """Widerrufsrecht:
Verbrauchern steht ein gesetzliches Widerrufsrecht von 14 Tagen zu. Bei bereits begonnenen Arbeiten kann eine angemessene Entschädigung für erbrachte Leistungen berechnet werden.""",
            
            "data_protection": """Datenschutz:
Die Verarbeitung personenbezogener Daten erfolgt gemäß DSGVO. Detaillierte Informationen finden Sie in unserer Datenschutzerklärung.""",
            
            "general_conditions": """Allgemeine Geschäftsbedingungen:
Es gelten unsere aktuellen AGB. Änderungen bedürfen der Schriftform. Erfüllungsort und Gerichtsstand ist unser Firmensitz."""
        },
        "calculation_settings": {
            "currency": "EUR",
            "tax_rate_percent": 19.0,
            "payment_processing_fee_percent": 1.5,
            "financing_processing_fee": 50.0,
            "round_to_cents": True,
            "show_net_prices": False
        },
        "display_settings": {
            "show_discounts": True,
            "show_financing_details": True,
            "show_monthly_rates": True,
            "highlight_recommended": True,
            "recommended_option": "installments_3",
            "color_scheme": {
                "primary": "#1E88E5",
                "success": "#43A047",
                "warning": "#FB8C00",
                "error": "#E53935"
            }
        }
    }


def render_payment_options_management(payment_options: List[Dict[str, Any]], widget_suffix: str) -> List[Dict[str, Any]]:
    """Erweiterte UI für die Verwaltung der Zahlungsoptionen."""
    st.subheader("💳 Zahlungsoptionen verwalten")
    st.markdown("Konfigurieren Sie die verfügbaren Zahlungsmodalitäten für Ihre Kunden.")
    
    # Buttons für das Hinzufügen neuer Optionen
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        if st.button("➕ Barzahlung", key=f"add_cash_{widget_suffix}"):
            new_option = {
                "id": f"cash_{len(payment_options)}_{datetime.now().strftime('%H%M%S')}",
                "name": "Neue Barzahlung",
                "description": "Sofortige Zahlung",
                "discount_percent": 2.0,
                "enabled": True,
                "icon": "💰",
                "payment_type": "immediate"
            }
            payment_options.append(new_option)
            st.rerun()
    
    with col2:
        if st.button("➕ Ratenzahlung", key=f"add_installment_{widget_suffix}"):
            new_option = {
                "id": f"installment_{len(payment_options)}_{datetime.now().strftime('%H%M%S')}",
                "name": "Neue Ratenzahlung",
                "description": "Zahlung in Raten",
                "discount_percent": 0.0,
                "enabled": True,
                "icon": "📊",
                "payment_type": "installments",
                "installment_schedule": [
                    {"percentage": 50.0, "due_days": 0, "description": "Anzahlung", "label": "Anzahlung"},
                    {"percentage": 50.0, "due_days": 30, "description": "Restzahlung", "label": "Restzahlung"}
                ]
            }
            payment_options.append(new_option)
            st.rerun()
    
    with col3:
        if st.button("➕ Finanzierung", key=f"add_financing_{widget_suffix}"):
            new_option = {
                "id": f"financing_{len(payment_options)}_{datetime.now().strftime('%H%M%S')}",
                "name": "Neue Finanzierung",
                "description": "Finanzierung über Bank",
                "discount_percent": 0.0,
                "enabled": True,
                "icon": "🏦",
                "payment_type": "financing",
                "financing_options": [
                    {"duration_months": 60, "interest_rate": 3.0, "monthly_fee": 0.0}
                ]
            }
            payment_options.append(new_option)
            st.rerun()
    
    with col4:
        if st.button("➕ Benutzerdefiniert", key=f"add_custom_{widget_suffix}"):
            new_option = {
                "id": f"custom_{len(payment_options)}_{datetime.now().strftime('%H%M%S')}",
                "name": "Benutzerdefinierte Option",
                "description": "Individuelle Zahlungsmodalität",
                "discount_percent": 0.0,
                "enabled": False,
                "icon": "⚙️",
                "payment_type": "custom"
            }
            payment_options.append(new_option)
            st.rerun()
    
    st.markdown("---")
    
    # Bestehende Optionen bearbeiten
    updated_options = []
    for i, option in enumerate(payment_options):
        option_id = option.get('id', f'option_{i}')
        
        with st.expander(f"{option.get('icon', '💳')} {option.get('name', 'Unbenannt')} ({'Aktiv' if option.get('enabled', True) else 'Inaktiv'})", expanded=False):
            
            # Grundeinstellungen
            col_basic1, col_basic2 = st.columns(2)
            
            with col_basic1:
                option['name'] = st.text_input(
                    "Name der Zahlungsoption", 
                    value=option.get('name', ''),
                    key=f"option_name_{option_id}_{widget_suffix}"
                )
                
                option['icon'] = st.selectbox(
                    "Icon",
                    options=["💰", "🚚", "📊", "🏦", "📋", "⚙️", "💳", "🎯", "⭐", "🔥"],
                    index=["💰", "🚚", "📊", "🏦", "📋", "⚙️", "💳", "🎯", "⭐", "🔥"].index(option.get('icon', '💳')) if option.get('icon', '💳') in ["💰", "🚚", "📊", "🏦", "📋", "⚙️", "💳", "🎯", "⭐", "🔥"] else 0,
                    key=f"option_icon_{option_id}_{widget_suffix}"
                )
                
                option['discount_percent'] = st.number_input(
                    "Rabatt (%)", 
                    value=float(option.get('discount_percent', 0.0)),
                    min_value=0.0,
                    max_value=50.0,
                    step=0.1,
                    key=f"option_discount_{option_id}_{widget_suffix}"
                )
            
            with col_basic2:
                option['description'] = st.text_area(
                    "Beschreibung", 
                    value=option.get('description', ''),
                    height=80,
                    key=f"option_desc_{option_id}_{widget_suffix}"
                )
                
                option['enabled'] = st.checkbox(
                    "Option aktiviert", 
                    value=option.get('enabled', True),
                    key=f"option_enabled_{option_id}_{widget_suffix}"
                )
                
                option['payment_type'] = st.selectbox(
                    "Zahlungstyp",
                    options=["immediate", "on_delivery", "installments", "financing", "leasing", "custom"],
                    index=["immediate", "on_delivery", "installments", "financing", "leasing", "custom"].index(option.get('payment_type', 'immediate')) if option.get('payment_type', 'immediate') in ["immediate", "on_delivery", "installments", "financing", "leasing", "custom"] else 0,
                    key=f"option_type_{option_id}_{widget_suffix}"
                )
            
            # Spezielle Konfigurationen je nach Zahlungstyp
            payment_type = option.get('payment_type', 'immediate')
            
            if payment_type == "installments":
                st.markdown("**📊 Ratenzahlungsplan konfigurieren:**")
                schedule = option.get('installment_schedule', [])
                
                # Button zum Hinzufügen einer neuen Rate
                if st.button(f"➕ Rate hinzufügen", key=f"add_installment_{option_id}_{widget_suffix}"):
                    schedule.append({
                        "percentage": 20.0,
                        "due_days": len(schedule) * 30,
                        "description": f"Rate {len(schedule) + 1}",
                        "label": f"Rate {len(schedule) + 1}"
                    })
                    option['installment_schedule'] = schedule
                    st.rerun()
                
                updated_schedule = []
                for j, installment in enumerate(schedule):
                    st.markdown(f"**Rate {j+1}:**")
                    col_inst1, col_inst2, col_inst3, col_inst4 = st.columns(4)
                    
                    installment['percentage'] = col_inst1.number_input(
                        f"Anteil (%)",
                        value=float(installment.get('percentage', 0.0)),
                        min_value=0.0,
                        max_value=100.0,
                        step=1.0,
                        key=f"installment_pct_{option_id}_{j}_{widget_suffix}"
                    )
                    
                    installment['due_days'] = col_inst2.number_input(
                        f"Fällig nach (Tagen)",
                        value=int(installment.get('due_days', 0)),
                        min_value=0,
                        max_value=365,
                        step=1,
                        key=f"installment_days_{option_id}_{j}_{widget_suffix}"
                    )
                    
                    installment['label'] = col_inst3.text_input(
                        f"Bezeichnung",
                        value=installment.get('label', ''),
                        key=f"installment_label_{option_id}_{j}_{widget_suffix}"
                    )
                    
                    if col_inst4.button(f"🗑️", key=f"del_installment_{option_id}_{j}_{widget_suffix}", help="Rate löschen"):
                        continue  # Rate wird nicht zu updated_schedule hinzugefügt
                    
                    installment['description'] = st.text_input(
                        f"Beschreibung Rate {j+1}",
                        value=installment.get('description', ''),
                        key=f"installment_desc_{option_id}_{j}_{widget_suffix}"
                    )
                    
                    updated_schedule.append(installment)
                
                option['installment_schedule'] = updated_schedule
                
                # Validierung der Prozentwerte
                total_percentage = sum(inst.get('percentage', 0) for inst in updated_schedule)
                if total_percentage != 100.0:
                    st.warning(f"⚠️ Summe der Raten: {total_percentage}% (sollte 100% sein)")
            
            elif payment_type == "financing":
                st.markdown("**🏦 Finanzierungsoptionen konfigurieren:**")
                financing_opts = option.get('financing_options', [])
                
                # Button zum Hinzufügen einer neuen Finanzierungsoption
                if st.button(f"➕ Finanzierungsoption hinzufügen", key=f"add_financing_{option_id}_{widget_suffix}"):
                    financing_opts.append({
                        "name": f"Option {len(financing_opts) + 1}",
                        "duration_months": 60,
                        "interest_rate": 3.0,
                        "monthly_fee": 0.0,
                        "min_amount": 5000.0,
                        "max_amount": 100000.0
                    })
                    option['financing_options'] = financing_opts
                    st.rerun()
                
                updated_financing = []
                for k, fin_opt in enumerate(financing_opts):
                    st.markdown(f"**Finanzierungsoption {k+1}:**")
                    col_fin1, col_fin2, col_fin3, col_fin4 = st.columns(4)
                    
                    fin_opt['name'] = col_fin1.text_input(
                        f"Name",
                        value=fin_opt.get('name', ''),
                        key=f"fin_name_{option_id}_{k}_{widget_suffix}"
                    )
                    
                    fin_opt['duration_months'] = col_fin2.number_input(
                        f"Laufzeit (Monate)",
                        value=int(fin_opt.get('duration_months', 60)),
                        min_value=12,
                        max_value=240,
                        step=12,
                        key=f"fin_duration_{option_id}_{k}_{widget_suffix}"
                    )
                    
                    fin_opt['interest_rate'] = col_fin3.number_input(
                        f"Zinssatz (%)",
                        value=float(fin_opt.get('interest_rate', 3.0)),
                        min_value=0.0,
                        max_value=20.0,
                        step=0.1,
                        key=f"fin_rate_{option_id}_{k}_{widget_suffix}"
                    )
                    
                    if col_fin4.button(f"🗑️", key=f"del_financing_{option_id}_{k}_{widget_suffix}", help="Finanzierungsoption löschen"):
                        continue  # Option wird nicht zu updated_financing hinzugefügt
                    
                    col_fee1, col_fee2, col_fee3 = st.columns(3)
                    
                    fin_opt['monthly_fee'] = col_fee1.number_input(
                        f"Monatl. Gebühr (€)",
                        value=float(fin_opt.get('monthly_fee', 0.0)),
                        min_value=0.0,
                        max_value=100.0,
                        step=1.0,
                        key=f"fin_fee_{option_id}_{k}_{widget_suffix}"
                    )
                    
                    fin_opt['min_amount'] = col_fee2.number_input(
                        f"Min. Betrag (€)",
                        value=float(fin_opt.get('min_amount', 5000.0)),
                        min_value=0.0,
                        step=1000.0,
                        key=f"fin_min_{option_id}_{k}_{widget_suffix}"
                    )
                    
                    fin_opt['max_amount'] = col_fee3.number_input(
                        f"Max. Betrag (€)",
                        value=float(fin_opt.get('max_amount', 100000.0)),
                        min_value=1000.0,
                        step=1000.0,
                        key=f"fin_max_{option_id}_{k}_{widget_suffix}"
                    )
                    
                    updated_financing.append(fin_opt)
                
                option['financing_options'] = updated_financing
            
            elif payment_type == "leasing":
                st.markdown("**📋 Leasing-Konfiguration:**")
                leasing_opts = option.get('leasing_options', [{}])
                
                if leasing_opts:
                    leasing_opt = leasing_opts[0]
                    
                    col_lease1, col_lease2 = st.columns(2)
                    
                    leasing_opt['duration_months'] = col_lease1.number_input(
                        "Laufzeit (Monate)",
                        value=int(leasing_opt.get('duration_months', 120)),
                        min_value=24,
                        max_value=240,
                        step=12,
                        key=f"lease_duration_{option_id}_{widget_suffix}"
                    )
                    
                    leasing_opt['monthly_rate_factor'] = col_lease2.number_input(
                        "Monatsfaktor (%)",
                        value=float(leasing_opt.get('monthly_rate_factor', 1.2)),
                        min_value=0.5,
                        max_value=5.0,
                        step=0.1,
                        key=f"lease_factor_{option_id}_{widget_suffix}",
                        help="Faktor zur Berechnung der monatlichen Leasingrate"
                    )
                    
                    leasing_opt['buyout_option'] = st.checkbox(
                        "Kaufoption am Ende",
                        value=leasing_opt.get('buyout_option', True),
                        key=f"lease_buyout_{option_id}_{widget_suffix}"
                    )
                    
                    if leasing_opt.get('buyout_option', True):
                        leasing_opt['buyout_percentage'] = st.number_input(
                            "Kaufpreis am Ende (%)",
                            value=float(leasing_opt.get('buyout_percentage', 10.0)),
                            min_value=1.0,
                            max_value=50.0,
                            step=1.0,
                            key=f"lease_buyout_pct_{option_id}_{widget_suffix}"
                        )
                    
                    option['leasing_options'] = [leasing_opt]
            
            # Option löschen
            st.markdown("---")
            if st.button(f"🗑️ Zahlungsoption '{option.get('name', 'Unbenannt')}' löschen", key=f"delete_option_{option_id}_{widget_suffix}"):
                if st.session_state.get(f"confirm_delete_{option_id}", False):
                    # Option nicht zu updated_options hinzufügen = löschen
                    st.session_state[f"confirm_delete_{option_id}"] = False
                    st.success(f"Option '{option.get('name', 'Unbenannt')}' wurde gelöscht.")
                    st.rerun()
                else:
                    st.session_state[f"confirm_delete_{option_id}"] = True
                    st.warning("Erneut klicken um zu bestätigen!")
                    st.rerun()
            
            if not st.session_state.get(f"confirm_delete_{option_id}", False):
                updated_options.append(option)
    
    return updated_options
def render_general_terms_management(general_terms: Dict[str, Any], widget_suffix: str) -> Dict[str, Any]:
    """Erweiterte UI für allgemeine Zahlungsbedingungen."""
    st.subheader("⚖️ Allgemeine Geschäftsbedingungen")
    st.markdown("Konfigurieren Sie die grundlegenden Bedingungen für alle Zahlungsmodalitäten.")
    
    # Hauptbedingungen
    st.markdown("**📋 Grundlegende Bedingungen:**")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        general_terms['warranty_years'] = st.number_input(
            "Produktgarantie (Jahre)",
            value=int(general_terms.get('warranty_years', 25)),
            min_value=1,
            max_value=50,
            step=1,
            key=f"warranty_years_{widget_suffix}",
            help="Herstellergarantie auf Solarmodule"
        )
        
        general_terms['installation_warranty_years'] = st.number_input(
            "Montagegarantie (Jahre)",
            value=int(general_terms.get('installation_warranty_years', 2)),
            min_value=1,
            max_value=10,
            step=1,
            key=f"install_warranty_{widget_suffix}",
            help="Garantie auf Montage und Installation"
        )
        
        general_terms['performance_warranty_years'] = st.number_input(
            "Leistungsgarantie (Jahre)",
            value=int(general_terms.get('performance_warranty_years', 10)),
            min_value=1,
            max_value=30,
            step=1,
            key=f"performance_warranty_{widget_suffix}",
            help="Garantie auf Mindestleistung der Module"
        )
    
    with col2:
        general_terms['payment_due_days'] = st.number_input(
            "Standard-Zahlungsziel (Tage)",
            value=int(general_terms.get('payment_due_days', 14)),
            min_value=1,
            max_value=90,
            step=1,
            key=f"payment_due_{widget_suffix}",
            help="Standardfrist für Rechnungszahlung"
        )
        
        general_terms['contract_validity_days'] = st.number_input(
            "Angebotsgültigkeit (Tage)",
            value=int(general_terms.get('contract_validity_days', 30)),
            min_value=1,
            max_value=365,
            step=1,
            key=f"contract_validity_{widget_suffix}",
            help="Gültigkeitsdauer von Angeboten"
        )
        
        general_terms['price_validity_days'] = st.number_input(
            "Preisgültigkeit (Tage)",
            value=int(general_terms.get('price_validity_days', 14)),
            min_value=1,
            max_value=90,
            step=1,
            key=f"price_validity_{widget_suffix}",
            help="Gültigkeitsdauer der angegebenen Preise"
        )
    
    with col3:
        general_terms['late_payment_fee_percent'] = st.number_input(
            "Verzugszinsen (% p.a.)",
            value=float(general_terms.get('late_payment_fee_percent', 8.0)),
            min_value=0.0,
            max_value=20.0,
            step=0.1,
            key=f"late_fee_{widget_suffix}",
            help="Jährlicher Zinssatz bei verspäteter Zahlung"
        )
        
        general_terms['installation_period_weeks'] = st.number_input(
            "Installationsdauer (Wochen)",
            value=int(general_terms.get('installation_period_weeks', 8)),
            min_value=1,
            max_value=52,
            step=1,
            key=f"install_period_{widget_suffix}",
            help="Geschätzte Dauer von Auftrag bis Fertigstellung"
        )
        
        general_terms['completion_bonus_percent'] = st.number_input(
            "Fertigstellungsbonus (%)",
            value=float(general_terms.get('completion_bonus_percent', 1.0)),
            min_value=0.0,
            max_value=10.0,
            step=0.1,
            key=f"completion_bonus_{widget_suffix}",
            help="Bonus bei termingerechter Fertigstellung"
        )
    
    # Anzahlungsregelungen
    st.markdown("**💰 Anzahlungsregelungen:**")
    col_deposit1, col_deposit2, col_deposit3 = st.columns(3)
    
    with col_deposit1:
        general_terms['deposit_required'] = st.checkbox(
            "Anzahlung erforderlich",
            value=general_terms.get('deposit_required', True),
            key=f"deposit_required_{widget_suffix}",
            help="Ist eine Anzahlung bei Auftragserteilung erforderlich?"
        )
    
    if general_terms.get('deposit_required', True):
        with col_deposit2:
            general_terms['deposit_percentage'] = st.number_input(
                "Anzahlung (%)",
                value=float(general_terms.get('deposit_percentage', 30.0)),
                min_value=0.0,
                max_value=100.0,
                step=1.0,
                key=f"deposit_pct_{widget_suffix}",
                help="Prozentualer Anteil der Anzahlung"
            )
        
        with col_deposit3:
            general_terms['min_deposit_amount'] = st.number_input(
                "Mindest-Anzahlung (€)",
                value=float(general_terms.get('min_deposit_amount', 1000.0)),
                min_value=0.0,
                step=100.0,
                key=f"min_deposit_{widget_suffix}",
                help="Minimaler Betrag für die Anzahlung"
            )
    
    return general_terms


def render_discount_rules_management(discount_rules: Dict[str, Any], widget_suffix: str) -> Dict[str, Any]:
    """UI für die Verwaltung von Rabattregeln."""
    st.subheader("🎯 Rabatt- und Bonusregelungen")
    st.markdown("Konfigurieren Sie automatische Rabatte basierend auf verschiedenen Kriterien.")
    
    # Mengenrabatte
    st.markdown("**📊 Mengenrabatte (nach kWp):**")
    volume_discounts = discount_rules.get('volume_discounts', [])
    
    if st.button("➕ Mengenstaffel hinzufügen", key=f"add_volume_discount_{widget_suffix}"):
        volume_discounts.append({"min_kwp": 10.0, "discount_percent": 1.0})
        discount_rules['volume_discounts'] = volume_discounts
        st.rerun()
    
    updated_volume_discounts = []
    for i, vd in enumerate(volume_discounts):
        col_vd1, col_vd2, col_vd3 = st.columns([2, 2, 1])
        
        vd['min_kwp'] = col_vd1.number_input(
            f"Ab kWp",
            value=float(vd.get('min_kwp', 10.0)),
            min_value=0.0,
            step=1.0,
            key=f"volume_kwp_{i}_{widget_suffix}"
        )
        
        vd['discount_percent'] = col_vd2.number_input(
            f"Rabatt (%)",
            value=float(vd.get('discount_percent', 1.0)),
            min_value=0.0,
            max_value=50.0,
            step=0.1,
            key=f"volume_discount_{i}_{widget_suffix}"
        )
        
        if col_vd3.button("🗑️", key=f"del_volume_{i}_{widget_suffix}", help="Mengenstaffel löschen"):
            continue  # Nicht zu updated_volume_discounts hinzufügen
        
        updated_volume_discounts.append(vd)
    
    discount_rules['volume_discounts'] = updated_volume_discounts
    
    # Saisonrabatt
    st.markdown("**🌟 Saisonaler Rabatt:**")
    seasonal = discount_rules.get('seasonal_discount', {})
    
    col_season1, col_season2, col_season3 = st.columns(3)
    
    with col_season1:
        seasonal['enabled'] = st.checkbox(
            "Saisonrabatt aktiviert",
            value=seasonal.get('enabled', False),
            key=f"seasonal_enabled_{widget_suffix}"
        )
    
    if seasonal.get('enabled', False):
        with col_season2:
            seasonal['discount_percent'] = st.number_input(
                "Saisonrabatt (%)",
                value=float(seasonal.get('discount_percent', 2.0)),
                min_value=0.0,
                max_value=20.0,
                step=0.1,
                key=f"seasonal_discount_{widget_suffix}"
            )
        
        with col_season3:
            seasonal['months'] = st.multiselect(
                "Gültige Monate",
                options=list(range(1, 13)),
                default=seasonal.get('months', [11, 12, 1, 2]),
                format_func=lambda x: [
                    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
                    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
                ][x-1],
                key=f"seasonal_months_{widget_suffix}"
            )
    
    discount_rules['seasonal_discount'] = seasonal
    
    # Empfehlungsrabatt
    st.markdown("**👥 Empfehlungsrabatt:**")
    referral = discount_rules.get('referral_discount', {})
    
    col_ref1, col_ref2, col_ref3 = st.columns(3)
    
    with col_ref1:
        referral['enabled'] = st.checkbox(
            "Empfehlungsrabatt aktiviert",
            value=referral.get('enabled', True),
            key=f"referral_enabled_{widget_suffix}"
        )
    
    if referral.get('enabled', True):
        with col_ref2:
            referral['discount_type'] = st.selectbox(
                "Rabatttyp",
                options=["percentage", "fixed_amount"],
                index=0 if referral.get('discount_type', 'percentage') == 'percentage' else 1,
                format_func=lambda x: "Prozentual" if x == "percentage" else "Fester Betrag",
                key=f"referral_type_{widget_suffix}"
            )
        
        with col_ref3:
            if referral.get('discount_type', 'percentage') == 'percentage':
                referral['discount_percent'] = st.number_input(
                    "Empfehlungsrabatt (%)",
                    value=float(referral.get('discount_percent', 5.0)),
                    min_value=0.0,
                    max_value=20.0,
                    step=0.1,
                    key=f"referral_discount_{widget_suffix}"
                )
            else:
                referral['discount_amount'] = st.number_input(
                    "Empfehlungsrabatt (€)",
                    value=float(referral.get('discount_amount', 500.0)),
                    min_value=0.0,
                    step=50.0,
                    key=f"referral_amount_{widget_suffix}"
                )
    
    discount_rules['referral_discount'] = referral
    
    return discount_rules


def render_legal_texts_management(legal_texts: Dict[str, str], widget_suffix: str) -> Dict[str, str]:
    """Erweiterte UI für rechtliche Texte und Bedingungen."""
    st.subheader("📋 Rechtliche Texte und Bedingungen")
    st.markdown("Bearbeiten Sie die standardmäßigen rechtlichen Texte für Angebote und Verträge.")
    
    # Tab-Navigation für verschiedene Textbereiche
    text_tabs = st.tabs([
        "💳 Zahlungsbedingungen",
        "🛡️ Garantien",
        "🚚 Lieferung",
        "↩️ Widerruf",
        "🔒 Datenschutz",
        "📄 AGB"
    ])
    
    with text_tabs[0]:
        legal_texts['payment_terms'] = st.text_area(
            "Zahlungsbedingungen",
            value=legal_texts.get('payment_terms', ''),
            height=150,
            key=f"legal_payment_{widget_suffix}",
            help="Allgemeine Zahlungsbedingungen für alle Zahlungsarten"
        )
    
    with text_tabs[1]:
        legal_texts['warranty_info'] = st.text_area(
            "Garantieinformationen",
            value=legal_texts.get('warranty_info', ''),
            height=150,
            key=f"legal_warranty_{widget_suffix}",
            help="Detaillierte Informationen zu Produkt- und Leistungsgarantien"
        )
    
    with text_tabs[2]:
        legal_texts['delivery_info'] = st.text_area(
            "Lieferinformationen",
            value=legal_texts.get('delivery_info', ''),
            height=150,
            key=f"legal_delivery_{widget_suffix}",
            help="Informationen zu Lieferzeiten und Installationsablauf"
        )
    
    with text_tabs[3]:
        legal_texts['cancellation_policy'] = st.text_area(
            "Widerrufsbelehrung",
            value=legal_texts.get('cancellation_policy', ''),
            height=150,
            key=f"legal_cancellation_{widget_suffix}",
            help="Gesetzliche Widerrufsbelehrung für Verbraucher"
        )
    
    with text_tabs[4]:
        legal_texts['data_protection'] = st.text_area(
            "Datenschutzhinweise",
            value=legal_texts.get('data_protection', ''),
            height=150,
            key=f"legal_data_protection_{widget_suffix}",
            help="Hinweise zur Datenverarbeitung gemäß DSGVO"
        )
    
    with text_tabs[5]:
        legal_texts['general_conditions'] = st.text_area(
            "Allgemeine Geschäftsbedingungen",
            value=legal_texts.get('general_conditions', ''),
            height=150,
            key=f"legal_general_{widget_suffix}",
            help="Verweis auf die vollständigen AGB"
        )
    
    return legal_texts


def render_calculation_settings(calc_settings: Dict[str, Any], widget_suffix: str) -> Dict[str, Any]:
    """UI für Berechnungseinstellungen."""
    st.subheader("🧮 Berechnungseinstellungen")
    st.markdown("Konfigurieren Sie die Parameter für Preisberechnungen und Darstellung.")
    
    col_calc1, col_calc2, col_calc3 = st.columns(3)
    
    with col_calc1:
        calc_settings['currency'] = st.selectbox(
            "Währung",
            options=["EUR", "USD", "CHF"],
            index=["EUR", "USD", "CHF"].index(calc_settings.get('currency', 'EUR')),
            key=f"calc_currency_{widget_suffix}"
        )
        
        calc_settings['tax_rate_percent'] = st.number_input(
            "Mehrwertsteuersatz (%)",
            value=float(calc_settings.get('tax_rate_percent', 19.0)),
            min_value=0.0,
            max_value=30.0,
            step=0.1,
            key=f"calc_tax_rate_{widget_suffix}"
        )
    
    with col_calc2:
        calc_settings['payment_processing_fee_percent'] = st.number_input(
            "Zahlungsgebühr (%)",
            value=float(calc_settings.get('payment_processing_fee_percent', 1.5)),
            min_value=0.0,
            max_value=10.0,
            step=0.1,
            key=f"calc_payment_fee_{widget_suffix}",
            help="Gebühr für Kartenzahlung o.ä."
        )
        
        calc_settings['financing_processing_fee'] = st.number_input(
            "Finanzierungsgebühr (€)",
            value=float(calc_settings.get('financing_processing_fee', 50.0)),
            min_value=0.0,
            step=10.0,
            key=f"calc_financing_fee_{widget_suffix}",
            help="Einmalige Bearbeitungsgebühr für Finanzierung"
        )
    
    with col_calc3:
        calc_settings['round_to_cents'] = st.checkbox(
            "Auf Cent runden",
            value=calc_settings.get('round_to_cents', True),
            key=f"calc_round_cents_{widget_suffix}"
        )
        
        calc_settings['show_net_prices'] = st.checkbox(
            "Nettopreise anzeigen",
            value=calc_settings.get('show_net_prices', False),
            key=f"calc_show_net_{widget_suffix}",
            help="Zusätzlich zu Bruttopreisen auch Nettopreise anzeigen"
        )
    
    return calc_settings


def render_display_settings(display_settings: Dict[str, Any], widget_suffix: str) -> Dict[str, Any]:
    """UI für Darstellungseinstellungen."""
    st.subheader("🎨 Darstellungseinstellungen")
    st.markdown("Konfigurieren Sie das Aussehen der Zahlungsmodalitäten in Angeboten.")
    
    col_display1, col_display2 = st.columns(2)
    
    with col_display1:
        display_settings['show_discounts'] = st.checkbox(
            "Rabatte hervorheben",
            value=display_settings.get('show_discounts', True),
            key=f"display_discounts_{widget_suffix}"
        )
        
        display_settings['show_financing_details'] = st.checkbox(
            "Finanzierungsdetails anzeigen",
            value=display_settings.get('show_financing_details', True),
            key=f"display_financing_{widget_suffix}"
        )
        
        display_settings['show_monthly_rates'] = st.checkbox(
            "Monatsraten anzeigen",
            value=display_settings.get('show_monthly_rates', True),
            key=f"display_monthly_{widget_suffix}"
        )
    
    with col_display2:
        display_settings['highlight_recommended'] = st.checkbox(
            "Empfohlene Option hervorheben",
            value=display_settings.get('highlight_recommended', True),
            key=f"display_highlight_{widget_suffix}"
        )
        
        if display_settings.get('highlight_recommended', True):
            # Hier könnte eine Dropdown-Liste der verfügbaren Zahlungsoptionen stehen
            display_settings['recommended_option'] = st.text_input(
                "ID der empfohlenen Option",
                value=display_settings.get('recommended_option', 'installments_3'),
                key=f"display_recommended_{widget_suffix}",
                help="ID der Zahlungsoption, die als empfohlen markiert werden soll"
            )
    
    # Farbschema
    st.markdown("**🎨 Farbschema:**")
    color_scheme = display_settings.get('color_scheme', {})
    
    col_color1, col_color2, col_color3, col_color4 = st.columns(4)
    
    with col_color1:
        color_scheme['primary'] = st.color_picker(
            "Primärfarbe",
            value=color_scheme.get('primary', '#1E88E5'),
            key=f"color_primary_{widget_suffix}"
        )
    
    with col_color2:
        color_scheme['success'] = st.color_picker(
            "Erfolgsfarbe",
            value=color_scheme.get('success', '#43A047'),
            key=f"color_success_{widget_suffix}"
        )
    
    with col_color3:
        color_scheme['warning'] = st.color_picker(
            "Warnfarbe",
            value=color_scheme.get('warning', '#FB8C00'),
            key=f"color_warning_{widget_suffix}"
        )
    
    with col_color4:
        color_scheme['error'] = st.color_picker(
            "Fehlerfarbe",
            value=color_scheme.get('error', '#E53935'),
            key=f"color_error_{widget_suffix}"
        )
    
    display_settings['color_scheme'] = color_scheme
    
    return display_settings


def render_payment_preview_detailed(payment_terms: Dict[str, Any], example_price: float = 25000.0) -> None:
    """Detaillierte Vorschau der konfigurierten Zahlungsmodalitäten."""
    st.subheader("👁️ Detaillierte Vorschau")
    st.markdown(f"Simulation für eine Beispielanlage im Wert von **{example_price:,.2f} €**")
    
    # Beispielpreis anpassbar machen
    example_price = st.slider(
        "Beispielpreis für Simulation (€)",
        min_value=5000.0,
        max_value=100000.0,
        value=example_price,
        step=1000.0,
        key="preview_example_price"
    )
    
    # Aktive Zahlungsoptionen filtern
    active_options = [
        opt for opt in payment_terms.get('payment_options', []) 
        if opt.get('enabled', True)
    ]
    
    if not active_options:
        st.warning("⚠️ Keine aktiven Zahlungsoptionen konfiguriert!")
        return
    
    # Rabattregeln anwenden
    volume_discounts = payment_terms.get('discount_rules', {}).get('volume_discounts', [])
    system_kwp = example_price / 1500  # Annahme: 1500€/kWp
    volume_discount = 0.0
    
    for vd in sorted(volume_discounts, key=lambda x: x.get('min_kwp', 0), reverse=True):
        if system_kwp >= vd.get('min_kwp', 0):
            volume_discount = vd.get('discount_percent', 0)
            break
    
    # Saisonaler Rabatt (für Demo immer aktiv)
    seasonal_discount = 0.0
    seasonal = payment_terms.get('discount_rules', {}).get('seasonal_discount', {})
    if seasonal.get('enabled', False):
        current_month = datetime.now().month
        if current_month in seasonal.get('months', []):
            seasonal_discount = seasonal.get('discount_percent', 0)
    
    if volume_discount > 0:
        st.info(f"📊 Mengenrabatt: {volume_discount}% (ab {volume_discounts[0].get('min_kwp', 0)} kWp)")
    
    if seasonal_discount > 0:
        st.info(f"🌟 Saisonrabatt: {seasonal_discount}% (aktueller Monat)")
    
    # Zahlungsoptionen darstellen
    recommended_id = payment_terms.get('display_settings', {}).get('recommended_option', '')
    
    for i, option in enumerate(active_options):
        is_recommended = option.get('id') == recommended_id
        
        # Container für jede Zahlungsoption
        container = st.container()
        if is_recommended:
            container.markdown("🌟 **EMPFOHLEN**")
        
        with container:
            col_main1, col_main2 = st.columns([2, 3])
            
            with col_main1:
                # Header mit Icon und Name
                st.markdown(f"### {option.get('icon', '💳')} {option.get('name', 'Unbenannt')}")
                st.markdown(f"*{option.get('description', '')}*")
                
                # Gesamtrabatt berechnen
                total_discount = (
                    option.get('discount_percent', 0) + 
                    volume_discount + 
                    seasonal_discount
                )
                
                if total_discount > 0:
                    discount_amount = example_price * total_discount / 100
                    final_price = example_price - discount_amount
                    st.success(f"💰 Gesamtrabatt: {total_discount:.1f}% (-{discount_amount:,.2f} €)")
                    st.markdown(f"**Endpreis: {final_price:,.2f} €**")
                else:
                    final_price = example_price
                    st.markdown(f"**Preis: {final_price:,.2f} €**")
            
            with col_main2:
                payment_type = option.get('payment_type', 'immediate')
                
                if payment_type == "installments":
                    st.markdown("**📊 Zahlungsplan:**")
                    schedule = option.get('installment_schedule', [])
                    
                    for j, installment in enumerate(schedule):
                        amount = final_price * installment.get('percentage', 0) / 100
                        due_date = datetime.now() + timedelta(days=installment.get('due_days', 0))
                        label = installment.get('label', f'Rate {j+1}')
                        description = installment.get('description', '')
                        
                        st.markdown(
                            f"- **{label}**: {amount:,.2f} € "
                            f"({installment.get('percentage', 0):.0f}%) - "
                            f"{description} "
                            f"(fällig: {due_date.strftime('%d.%m.%Y')})"
                        )
                
                elif payment_type == "financing":
                    st.markdown("**🏦 Finanzierungsoptionen:**")
                    financing_opts = option.get('financing_options', [])
                    
                    for fin_opt in financing_opts:
                        name = fin_opt.get('name', 'Standard')
                        months = fin_opt.get('duration_months', 60)
                        rate = fin_opt.get('interest_rate', 3.0)
                        fee = fin_opt.get('monthly_fee', 0.0)
                        
                        # Vereinfachte Monatsrate berechnen (Annuitätendarlehen)
                        if rate > 0:
                            monthly_rate = rate / 100 / 12
                            factor = (monthly_rate * (1 + monthly_rate)**months) / ((1 + monthly_rate)**months - 1)
                            monthly_payment = final_price * factor + fee
                        else:
                            monthly_payment = final_price / months + fee
                        
                        total_payment = monthly_payment * months
                        total_interest = total_payment - final_price
                        
                        st.markdown(
                            f"- **{name}**: {monthly_payment:,.2f} €/Monat "
                            f"({months} Monate, {rate}% Zins)"
                        )
                        st.caption(f"  Gesamtsumme: {total_payment:,.2f} € (Zinsen: {total_interest:,.2f} €)")
                
                elif payment_type == "leasing":
                    st.markdown("**📋 Leasing-Konditionen:**")
                    leasing_opts = option.get('leasing_options', [])
                    
                    if leasing_opts:
                        leasing_opt = leasing_opts[0]
                        months = leasing_opt.get('duration_months', 120)
                        factor = leasing_opt.get('monthly_rate_factor', 1.2) / 100
                        monthly_rate = final_price * factor
                        
                        st.markdown(f"- Monatliche Leasingrate: {monthly_rate:,.2f} €")
                        st.markdown(f"- Laufzeit: {months} Monate ({months/12:.1f} Jahre)")
                        
                        if leasing_opt.get('buyout_option', True):
                            buyout_price = final_price * leasing_opt.get('buyout_percentage', 10) / 100
                            st.markdown(f"- Kaufoption am Ende: {buyout_price:,.2f} €")
                
                elif payment_type in ["immediate", "on_delivery"]:
                    if payment_type == "immediate":
                        st.markdown("**💰 Sofortige Vollzahlung**")
                        st.markdown("- Zahlung bei Vertragsabschluss")
                    else:
                        st.markdown("**🚚 Zahlung bei Lieferung**")
                        st.markdown("- Zahlung bei Anlieferung der Komponenten")
                    
                    if total_discount > 0:
                        st.markdown("- Maximaler Rabatt durch Sofortzahlung")
            
            # Zusätzliche Informationen
            general_terms = payment_terms.get('general_terms', {})
            if general_terms:
                with st.expander("📋 Weitere Bedingungen", expanded=False):
                    col_terms1, col_terms2 = st.columns(2)
                    
                    with col_terms1:
                        st.markdown(f"- Produktgarantie: {general_terms.get('warranty_years', 25)} Jahre")
                        st.markdown(f"- Montagegarantie: {general_terms.get('installation_warranty_years', 2)} Jahre")
                        st.markdown(f"- Zahlungsziel: {general_terms.get('payment_due_days', 14)} Tage")
                    
                    with col_terms2:
                        st.markdown(f"- Angebotsgültigkeit: {general_terms.get('contract_validity_days', 30)} Tage")
                        st.markdown(f"- Installationsdauer: ca. {general_terms.get('installation_period_weeks', 8)} Wochen")
                        if general_terms.get('deposit_required', True):
                            st.markdown(f"- Anzahlung: {general_terms.get('deposit_percentage', 30)}%")
        
        st.markdown("---")


def render_import_export_tools(widget_suffix: str) -> Optional[Dict[str, Any]]:
    """Tools für Import und Export von Zahlungskonfigurationen."""
    st.subheader("📁 Import/Export")
    st.markdown("Exportieren Sie Ihre Konfiguration oder importieren Sie vorhandene Einstellungen.")
    
    col_ie1, col_ie2 = st.columns(2)
    
    with col_ie1:
        st.markdown("**📤 Export:**")
        if st.button("💾 Konfiguration exportieren", key=f"export_config_{widget_suffix}"):
            # Hier würde die aktuelle Konfiguration exportiert werden
            config_json = json.dumps(get_comprehensive_default_payment_terms(), indent=2, ensure_ascii=False)
            
            # Download-Button anbieten
            st.download_button(
                label="📁 Konfiguration herunterladen",
                data=config_json,
                file_name=f"payment_terms_config_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json",
                key=f"download_config_{widget_suffix}"
            )
    
    with col_ie2:
        st.markdown("**📥 Import:**")
        uploaded_file = st.file_uploader(
            "Konfigurationsdatei hochladen",
            type=["json"],
            key=f"import_config_{widget_suffix}",
            help="Laden Sie eine zuvor exportierte Konfigurationsdatei"
        )
        
        if uploaded_file is not None:
            try:
                config_data = json.loads(uploaded_file.getvalue().decode())
                st.success("✅ Konfiguration erfolgreich geladen!")
                
                if st.button("📥 Konfiguration übernehmen", key=f"apply_import_{widget_suffix}"):
                    return config_data
                
                # Vorschau der importierten Konfiguration
                with st.expander("👁️ Vorschau der importierten Konfiguration"):
                    st.json(config_data)
                    
            except json.JSONDecodeError:
                st.error("❌ Ungültige JSON-Datei!")
            except Exception as e:
                st.error(f"❌ Fehler beim Laden der Datei: {str(e)}")
    
    return None


def render_admin_payment_terms_settings() -> None:
    """Legacy-Funktion für Rückwärtskompatibilität."""
    render_comprehensive_admin_payment_terms_ui()


def render_comprehensive_admin_payment_terms_ui(
    load_admin_setting_func: Optional[Callable] = None,
    save_admin_setting_func: Optional[Callable] = None,
    widget_key_suffix: str = "_comprehensive_payment_terms"
) -> None:
    """Umfassende Hauptfunktion für die Zahlungsmodalitäten-Verwaltung im Admin-Bereich."""
    
    # Header
    st.header("💳 Zahlungsmodalitäten - Umfassende Verwaltung")
    st.markdown("""
    Hier können Sie alle Aspekte der Zahlungsmodalitäten für Ihre Angebote konfigurieren:
    - Verschiedene Zahlungsoptionen (Bar, Raten, Finanzierung, Leasing)
    - Rabatt- und Bonusregelungen
    - Rechtliche Texte und Bedingungen
    - Berechnungs- und Darstellungseinstellungen
    """)
    
    # Fallback-Funktionen für Admin-Settings
    if load_admin_setting_func is None:
        def load_admin_setting_func(key, default=None):
            return st.session_state.get(f"admin_setting_{key}", default)
    
    if save_admin_setting_func is None:
        def save_admin_setting_func(key, value):
            st.session_state[f"admin_setting_{key}"] = value
            return True
    
    # Aktuelle Einstellungen laden
    current_payment_terms = load_admin_setting_func('comprehensive_payment_terms', get_comprehensive_default_payment_terms())
    
    # Sicherstellen, dass die Struktur korrekt ist
    if not isinstance(current_payment_terms, dict):
        current_payment_terms = get_comprehensive_default_payment_terms()
    
    # Import-Funktion prüfen
    imported_config = render_import_export_tools(widget_key_suffix)
    if imported_config:
        current_payment_terms = imported_config
        st.success("✅ Importierte Konfiguration wurde geladen!")
        st.rerun()
    
    # Hauptnavigation
    main_tabs = st.tabs([
        "💳 Zahlungsoptionen", 
        "⚖️ Geschäftsbedingungen", 
        "🎯 Rabatte & Boni",
        "📋 Rechtliche Texte", 
        "🧮 Berechnungen",
        "🎨 Darstellung",
        "👁️ Vorschau"
    ])
    
    # Tab 1: Zahlungsoptionen
    with main_tabs[0]:
        payment_options = current_payment_terms.get('payment_options', [])
        updated_payment_options = render_payment_options_management(payment_options, widget_key_suffix)
        current_payment_terms['payment_options'] = updated_payment_options
    
    # Tab 2: Allgemeine Geschäftsbedingungen
    with main_tabs[1]:
        general_terms = current_payment_terms.get('general_terms', {})
        updated_general_terms = render_general_terms_management(general_terms, widget_key_suffix)
        current_payment_terms['general_terms'] = updated_general_terms
    
    # Tab 3: Rabatte und Boni
    with main_tabs[2]:
        discount_rules = current_payment_terms.get('discount_rules', {})
        updated_discount_rules = render_discount_rules_management(discount_rules, widget_key_suffix)
        current_payment_terms['discount_rules'] = updated_discount_rules
    
    # Tab 4: Rechtliche Texte
    with main_tabs[3]:
        legal_texts = current_payment_terms.get('legal_texts', {})
        updated_legal_texts = render_legal_texts_management(legal_texts, widget_key_suffix)
        current_payment_terms['legal_texts'] = updated_legal_texts
    
    # Tab 5: Berechnungseinstellungen
    with main_tabs[4]:
        calc_settings = current_payment_terms.get('calculation_settings', {})
        updated_calc_settings = render_calculation_settings(calc_settings, widget_key_suffix)
        current_payment_terms['calculation_settings'] = updated_calc_settings
    
    # Tab 6: Darstellungseinstellungen
    with main_tabs[5]:
        display_settings = current_payment_terms.get('display_settings', {})
        updated_display_settings = render_display_settings(display_settings, widget_key_suffix)
        current_payment_terms['display_settings'] = updated_display_settings
    
    # Tab 7: Vorschau
    with main_tabs[6]:
        render_payment_preview_detailed(current_payment_terms)
    
    # Speicher- und Reset-Buttons
    st.markdown("---")
    col_save1, col_save2, col_save3, col_save4 = st.columns([2, 2, 2, 1])
    
    with col_save1:
        if st.button("💾 Alle Einstellungen speichern", key=f"save_all_payment_terms{widget_key_suffix}", type="primary"):
            try:
                # Validierung vor dem Speichern
                validation_errors = validate_payment_terms_config(current_payment_terms)
                
                if validation_errors:
                    st.error("❌ Validierungsfehler gefunden:")
                    for error in validation_errors:
                        st.error(f"• {error}")
                else:
                    # Legacy-Format für Rückwärtskompatibilität auch speichern
                    legacy_config = convert_to_legacy_format(current_payment_terms)
                    
                    # Beide Formate speichern
                    success1 = save_admin_setting_func('comprehensive_payment_terms', current_payment_terms)
                    success2 = save_admin_setting_func('payment_terms', legacy_config) if PAYMENT_TERMS_AVAILABLE else True
                    
                    if success1 and success2:
                        st.success("✅ Zahlungsmodalitäten erfolgreich gespeichert!")
                        st.balloons()
                    else:
                        st.error("❌ Fehler beim Speichern der Zahlungsmodalitäten.")
                        
            except Exception as e:
                st.error(f"❌ Fehler beim Speichern: {str(e)}")
    
    with col_save2:
        if st.button("🔄 Auf Standard zurücksetzen", key=f"reset_payment_terms{widget_key_suffix}"):
            if st.session_state.get(f"confirm_reset{widget_key_suffix}", False):
                default_config = get_comprehensive_default_payment_terms()
                if save_admin_setting_func('comprehensive_payment_terms', default_config):
                    st.success("✅ Auf Standardwerte zurückgesetzt!")
                    st.session_state[f"confirm_reset{widget_key_suffix}"] = False
                    st.rerun()
                else:
                    st.error("❌ Fehler beim Zurücksetzen.")
            else:
                st.session_state[f"confirm_reset{widget_key_suffix}"] = True
                st.warning("⚠️ Erneut klicken um zu bestätigen!")
    
    with col_save3:
        if st.button("🔍 Konfiguration validieren", key=f"validate_payment_terms{widget_key_suffix}"):
            validation_errors = validate_payment_terms_config(current_payment_terms)
            
            if validation_errors:
                st.error("❌ Validierungsfehler gefunden:")
                for error in validation_errors:
                    st.error(f"• {error}")
            else:
                st.success("✅ Konfiguration ist gültig!")
    
    with col_save4:
        with st.expander("🔧 Debug"):
            st.json(current_payment_terms)


def validate_payment_terms_config(config: Dict[str, Any]) -> List[str]:
    """Validiert die Zahlungsmodalitäten-Konfiguration."""
    errors = []
    
    # Zahlungsoptionen validieren
    payment_options = config.get('payment_options', [])
    if not payment_options:
        errors.append("Keine Zahlungsoptionen konfiguriert")
    
    active_options = [opt for opt in payment_options if opt.get('enabled', True)]
    if not active_options:
        errors.append("Keine aktiven Zahlungsoptionen verfügbar")
    
    for i, option in enumerate(payment_options):
        option_id = option.get('id', f'option_{i}')
        
        if not option.get('name'):
            errors.append(f"Zahlungsoption {option_id}: Name fehlt")
        
        if option.get('payment_type') == 'installments':
            schedule = option.get('installment_schedule', [])
            if schedule:
                total_percentage = sum(inst.get('percentage', 0) for inst in schedule)
                if abs(total_percentage - 100.0) > 0.01:
                    errors.append(f"Zahlungsoption {option_id}: Ratensumme ist {total_percentage}% (sollte 100% sein)")
    
    # Allgemeine Bedingungen validieren
    general_terms = config.get('general_terms', {})
    if general_terms.get('deposit_required', True):
        deposit_pct = general_terms.get('deposit_percentage', 0)
        if deposit_pct <= 0 or deposit_pct > 100:
            errors.append("Anzahlungsprozentsatz muss zwischen 0 und 100% liegen")
    
    return errors


def convert_to_legacy_format(comprehensive_config: Dict[str, Any]) -> Dict[str, Any]:
    """Konvertiert das umfassende Format ins Legacy-Format für Rückwärtskompatibilität."""
    legacy_variants = []
    
    for option in comprehensive_config.get('payment_options', []):
        if not option.get('enabled', True):
            continue
            
        payment_type = option.get('payment_type', 'immediate')
        
        if payment_type == 'installments':
            schedule = option.get('installment_schedule', [])
            segments = []
            
            for i, installment in enumerate(schedule):
                segments.append({
                    "key": f"rate_{i+1}",
                    "label": installment.get('label', f"Rate {i+1}"),
                    "percent": installment.get('percentage', 0),
                    "amount": None
                })
            
            legacy_variants.append({
                "id": option.get('id', ''),
                "name": option.get('name', ''),
                "segments": segments,
                "text_template": f"Zahlung in {len(segments)} Raten"
            })
    
    return {"variants": legacy_variants}


# Hauptfunktion für Integration in Admin-Panel
def render_admin_payment_terms_ui(
    load_admin_setting_func: Callable,
    save_admin_setting_func: Callable,
    widget_key_suffix: str = "_payment_terms_admin"
) -> None:
    """Hauptfunktion für die Integration in das Admin-Panel."""
    render_comprehensive_admin_payment_terms_ui(
        load_admin_setting_func,
        save_admin_setting_func,
        widget_key_suffix
    )


if __name__ == "__main__":
    # Ermöglicht das eigenständige Starten dieses Moduls
    render_comprehensive_admin_payment_terms_ui()


# Export aller wichtigen Funktionen
__all__ = [
    'render_admin_payment_terms_ui',
    'render_comprehensive_admin_payment_terms_ui', 
    'render_admin_payment_terms_settings',
    'get_comprehensive_default_payment_terms',
    'validate_payment_terms_config',
    'convert_to_legacy_format'
]