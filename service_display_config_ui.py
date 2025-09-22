import streamlit as st
from typing import Dict, Any

DEFAULT_SERVICE_DISPLAY_CONFIG = {
    "service_checkmarks_enabled": True,
    "service_symbol_style": "check",  # check|checkbox|dot|none
    "service_value_column_hidden": False,
    "service_symbol_color": "#000000",
    "service_label_color": "#000000",
}

def _ensure_defaults(cfg: Dict[str, Any]) -> None:
    # Ergänze fehlende Keys ohne bestehende Werte zu überschreiben
    for k, v in DEFAULT_SERVICE_DISPLAY_CONFIG.items():
        cfg.setdefault(k, v)


def reset_service_display_config(cfg: Dict[str, Any]) -> None:
    for k, v in DEFAULT_SERVICE_DISPLAY_CONFIG.items():
        cfg[k] = v


def render_service_display_config(pdf_design_config: Dict[str, Any]) -> None:
    """Zeigt die vereinheitlichte UI für die Dienstleistungs-Darstellung auf Seite 6.

    Erwartet ein dict pdf_design_config (aus st.session_state['pdf_design_config']).
    Aktualisiert Werte in-place und sorgt für Defaults.
    """
    if pdf_design_config is None:
        st.warning("pdf_design_config nicht initialisiert.")
        return

    _ensure_defaults(pdf_design_config)

    with st.expander("Darstellung Dienstleistungen (Seite 6)", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            symbol_options = ["check", "checkbox", "dot", "none"]
            labels_map = {
                "check": "Häkchen",
                "checkbox": "Checkbox",
                "dot": "Punkt",
                "none": "Kein Symbol"
            }
            current_style = pdf_design_config.get("service_symbol_style", "check")
            # Anzeige mit Labels, Speicherung des technischen Werts
            sel_label = st.selectbox(
                "Symbol-Stil",
                [labels_map[o] for o in symbol_options],
                index=symbol_options.index(current_style),
                help="Stil des Symbols vor jeder Dienstleistung."
            )
            # Reverse Mapping
            inv_map = {v: k for k, v in labels_map.items()}
            pdf_design_config["service_symbol_style"] = inv_map[sel_label]
            pdf_design_config["service_checkmarks_enabled"] = st.checkbox(
                "Dienstleistungen anzeigen (Symbolspalte)",
                value=pdf_design_config["service_checkmarks_enabled"],
                help="Deaktiviert die komplette Symbolspalte für Dienstleistungen."
            )
            pdf_design_config["service_value_column_hidden"] = st.checkbox(
                "Wertspalte bei Dienstleistungen & Produkten ausblenden",
                value=pdf_design_config["service_value_column_hidden"],
                help="Blendet die Werte (rechts) für Dienstleistungen UND Produkte aus."
            )
        with col2:
            pdf_design_config["service_symbol_color"] = st.color_picker(
                "Farbe Symbole",
                value=pdf_design_config["service_symbol_color"],
            )
            pdf_design_config["service_label_color"] = st.color_picker(
                "Farbe Texte",
                value=pdf_design_config["service_label_color"],
            )

        reset = st.button("Darstellungs-Optionen zurücksetzen", type="secondary")
        if reset:
            reset_service_display_config(pdf_design_config)
            st.rerun()

        st.caption(
            "Diese Optionen steuern die Darstellung der Dienstleistungen (und optional Produktwerte) auf Seite 6 des Angebots-PDF."
        )
