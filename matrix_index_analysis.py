#!/usr/bin/env python3
"""
Detaillierte Matrix-Index-Analyse
"""

import pandas as pd

def detailed_matrix_analysis():
    """Detaillierte Analyse der Matrix-Struktur"""
    print("🔍 DETAILLIERTE MATRIX-INDEX-ANALYSE")
    print("=" * 60)
    
    try:
        # Excel laden
        df = pd.read_excel('data/price_matrix.xlsx', index_col=0)
        
        print(f"📊 Matrix Shape: {df.shape}")
        print(f"📋 Index Typ: {type(df.index)}")
        print(f"📋 Index Values: {df.index.tolist()[:20]}...")
        
        # Zeige Index um 20 Module herum
        print(f"\n🎯 INDEX BEREICH UM 20 MODULE:")
        relevant_indices = [i for i in df.index if 15 <= i <= 25]
        print(f"Gefundene Indices: {relevant_indices}")
        
        # Zeige DataFrame-Inhalt um 20 Module
        print(f"\n📋 DATAFRAME INHALT (15-25 Module):")
        subset = df.loc[15:25, 'Ohne Speicher']
        for idx, value in subset.items():
            marker = "🎯" if idx == 20 else "  "
            print(f"{marker} Index {idx}: {value} €")
        
        # Direkte Position-Abfrage
        print(f"\n🔍 DIREKTE INDEX-ABFRAGEN:")
        print(f"df.loc[20, 'Ohne Speicher'] = {df.loc[20, 'Ohne Speicher']} €")
        print(f"df.iloc[13, df.columns.get_loc('Ohne Speicher')] = {df.iloc[13, df.columns.get_loc('Ohne Speicher')]} €")
        
        # Zeige was bei iloc Position 13 steht (20-7=13)
        iloc_13_index = df.index[13]
        print(f"iloc Position 13 entspricht Index: {iloc_13_index}")
        
        # Test: Was steht bei Index 25?
        if 25 in df.index:
            print(f"Index 25 ('Ohne Speicher'): {df.loc[25, 'Ohne Speicher']} €")
            if df.loc[25, 'Ohne Speicher'] == 15113.50:
                print("❓ Index 25 hat den erwarteten Preis für 20 Module!")
        
        # Index-Verschiebung Test
        print(f"\n🔍 VERSCHIEBUNGS-TEST:")
        target_price = 15113.50
        for idx in df.index:
            if abs(df.loc[idx, 'Ohne Speicher'] - target_price) < 0.1:
                print(f"✅ Preis {target_price} € gefunden bei Index {idx}")
                break
        
    except Exception as e:
        print(f"❌ Fehler: {e}")

if __name__ == "__main__":
    detailed_matrix_analysis()