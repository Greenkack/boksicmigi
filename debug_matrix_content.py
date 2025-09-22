#!/usr/bin/env python3
"""
Debug-Skript um den tatsächlichen Inhalt der gespeicherten Matrix zu überprüfen
"""

import pandas as pd
import database

def check_matrix_content():
    # Matrix aus der Datenbank laden
    admin_settings = database.export_admin_settings()
    
    if admin_settings and admin_settings.get("price_matrix_excel_bytes"):
        print("✅ Excel-Matrix in Datenbank gefunden")
        
        try:
            # Excel aus Bytes laden
            excel_bytes = admin_settings["price_matrix_excel_bytes"]
            df = pd.read_excel(excel_bytes, index_col=0)
            
            print(f"\n📊 Matrix Struktur:")
            print(f"   Shape: {df.shape}")
            print(f"   Index range: {df.index.min()} - {df.index.max()}")
            print(f"   Columns: {len(df.columns)} Speicher-Optionen")
            
            # Überprüfe 'Ohne Speicher' Spalte
            if 'Ohne Speicher' in df.columns:
                print(f"\n💰 'Ohne Speicher' Preise:")
                ohne_speicher = df['Ohne Speicher']
                print(f"   7 Module: {ohne_speicher.get(7, 'N/A')} €")
                print(f"   10 Module: {ohne_speicher.get(10, 'N/A')} €")
                print(f"   15 Module: {ohne_speicher.get(15, 'N/A')} €")
                print(f"   20 Module: {ohne_speicher.get(20, 'N/A')} €")
                print(f"   25 Module: {ohne_speicher.get(25, 'N/A')} €")
                print(f"   30 Module: {ohne_speicher.get(30, 'N/A')} €")
                
                # Spezifisch 20 Module checken
                if 20 in ohne_speicher.index:
                    preis_20 = ohne_speicher.loc[20]
                    print(f"\n🎯 20 Module Preis: {preis_20} €")
                    if preis_20 == 13855.30:
                        print("❌ Das ist der ALTE Preis!")
                    elif preis_20 == 15113.50:
                        print("✅ Das ist der NEUE korrekte Preis!")
                    else:
                        print(f"❓ Unerwarteter Preis: {preis_20}")
                else:
                    print("❌ 20 Module nicht in Index gefunden!")
            else:
                print("❌ 'Ohne Speicher' Spalte nicht gefunden!")
                print(f"Verfügbare Spalten: {list(df.columns)}")
                
        except Exception as e:
            print(f"❌ Fehler beim Laden der Excel-Matrix: {e}")
            
    else:
        print("❌ Keine Excel-Matrix in Datenbank gefunden")

if __name__ == "__main__":
    check_matrix_content()