#!/usr/bin/env python3
"""
Überprüfe wann die Matrix zuletzt geändert wurde
"""

import sqlite3

# Verbindung zur Datenbank
conn = sqlite3.connect('crm_database.db')
cursor = conn.cursor()

# Überprüfe admin_settings Tabelle
cursor.execute("SELECT key, updated_at FROM admin_settings WHERE key LIKE '%matrix%' ORDER BY updated_at DESC")
results = cursor.fetchall()

print('Matrix-bezogene Einträge:')
for key, updated_at in results:
    print(f'  {key}: {updated_at}')

# Überprüfe Größe der Matrix-Daten
cursor.execute("SELECT key, LENGTH(value) as size FROM admin_settings WHERE key = 'price_matrix_excel_bytes'")
result = cursor.fetchone()
if result:
    print(f'\nMatrix-Datei Größe: {result[1]} Bytes')

conn.close()