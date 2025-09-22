#!/usr/bin/env python3
"""
Matrix-Upload-Tool: Lädt eine Excel-Matrix direkt in die Datenbank
"""

import pandas as pd
import sqlite3
import hashlib
from typing import Optional

def upload_matrix_to_database(excel_file_path: str) -> bool:
    """
    Lädt eine Excel-Matrix direkt in die admin_settings Tabelle
    """
    try:
        # Excel-Datei lesen
        print(f"📁 Lade Excel-Datei: {excel_file_path}")
        
        # Datei als Bytes lesen
        with open(excel_file_path, 'rb') as f:
            excel_bytes = f.read()
        
        print(f"✅ Excel-Datei geladen: {len(excel_bytes)} Bytes")
        
        # Matrix parsen um zu validieren
        df = pd.read_excel(excel_file_path, index_col=0)
        print(f"📊 Matrix-Struktur: {df.shape} (Zeilen x Spalten)")
        print(f"   Module-Bereich: {df.index.min()} - {df.index.max()}")
        print(f"   Speicher-Optionen: {len(df.columns)}")
        
        # Überprüfe 'Ohne Speicher' Spalte
        if 'Ohne Speicher' not in df.columns:
            print("❌ 'Ohne Speicher' Spalte nicht gefunden!")
            print(f"Verfügbare Spalten: {list(df.columns)}")
            return False
        
        # Zeige Beispielpreise
        ohne_speicher = df['Ohne Speicher']
        print(f"\n💰 Beispielpreise 'Ohne Speicher':")
        for modules in [7, 10, 15, 20, 25, 30]:
            if modules in ohne_speicher.index:
                preis = ohne_speicher.loc[modules]
                print(f"   {modules} Module: {preis} €")
        
        # Hash berechnen
        hash_value = hashlib.sha256(excel_bytes).hexdigest()
        print(f"\n🔐 Matrix-Hash: {hash_value}")
        
        # In Datenbank speichern
        print("💾 Speichere in Datenbank...")
        conn = sqlite3.connect('crm_database.db')
        cursor = conn.cursor()
        
        # Admin settings einfügen/aktualisieren
        cursor.execute("""
            INSERT OR REPLACE INTO admin_settings (key, value, last_modified)
            VALUES (?, ?, datetime('now'))
        """, ('price_matrix_excel_bytes', excel_bytes))
        
        cursor.execute("""
            INSERT OR REPLACE INTO admin_settings (key, value, last_modified)
            VALUES (?, ?, datetime('now'))
        """, ('price_matrix_excel_hash', hash_value))
        
        cursor.execute("""
            INSERT OR REPLACE INTO admin_settings (key, value, last_modified)
            VALUES (?, ?, datetime('now'))
        """, ('price_matrix_source', 'Excel'))
        
        conn.commit()
        conn.close()
        
        print("✅ Matrix erfolgreich in Datenbank gespeichert!")
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim Upload: {e}")
        return False

def main():
    print("🚀 Matrix-Upload-Tool")
    print("=" * 50)
    
    import sys
    import os
    
    # Überprüfe Kommandozeilenargumente
    if len(sys.argv) > 1:
        selected_file = sys.argv[1]
        if not os.path.exists(selected_file):
            print(f"❌ Datei nicht gefunden: {selected_file}")
            return
        print(f"🎯 Verwende Datei aus Argument: {selected_file}")
    else:
        # Suche nach Excel-Dateien im aktuellen Verzeichnis
        excel_files = [f for f in os.listdir('.') if f.endswith(('.xlsx', '.xls'))]
        
        if not excel_files:
            print("❌ Keine Excel-Dateien im aktuellen Verzeichnis gefunden!")
            print("💡 Tipp: python upload_matrix.py <pfad_zur_excel_datei>")
            return
        
        print(f"📁 Gefundene Excel-Dateien:")
        for i, file in enumerate(excel_files):
            print(f"   {i+1}. {file}")
        
        if len(excel_files) == 1:
            selected_file = excel_files[0]
            print(f"\n🎯 Verwende automatisch: {selected_file}")
        else:
            try:
                choice = int(input(f"\nWähle eine Datei (1-{len(excel_files)}): ")) - 1
                if 0 <= choice < len(excel_files):
                    selected_file = excel_files[choice]
                else:
                    print("❌ Ungültige Auswahl!")
                    return
            except ValueError:
                print("❌ Ungültige Eingabe!")
                return
    
    # Upload durchführen
    success = upload_matrix_to_database(selected_file)
    
    if success:
        print("\n🎉 Matrix-Upload erfolgreich!")
        print("Die neue Matrix ist jetzt in der Datenbank und wird verwendet.")
    else:
        print("\n💥 Matrix-Upload fehlgeschlagen!")

if __name__ == "__main__":
    main()