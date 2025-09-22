"""
Example usage of the PriceMatrix class demonstrating INDEX/MATCH functionality.
"""

import pandas as pd
from price_matrix import PriceMatrix


def create_realistic_matrix():
    """Create a realistic price matrix similar to what would be used in production."""
    data = {
        'BYD Battery-Box Premium LVS 4.0': [13711.80, 13911.80, 14111.80, 14311.80, 14511.80, 14711.80],
        'BYD Battery-Box Premium LVS 8.0': [14311.80, 14511.80, 14711.80, 14911.80, 15111.80, 15311.80],
        'Huawei LUNA2000-5kWh': [13511.80, 13711.80, 13911.80, 14111.80, 14311.80, 14511.80],
        'Huawei LUNA2000-10kWh': [14111.80, 14311.80, 14511.80, 14711.80, 14911.80, 15111.80],
        'Ohne Speicher': [10711.80, 10911.80, 11111.80, 11311.80, 11511.80, 11711.80]
    }
    index = [7, 8, 9, 10, 11, 12]  # Module counts
    return pd.DataFrame(data, index=index)


def demonstrate_price_matrix():
    """Demonstrate PriceMatrix functionality with realistic scenarios."""
    print("=== PriceMatrix Demo ===\n")
    
    # Create and initialize matrix
    df = create_realistic_matrix()
    matrix = PriceMatrix(df)
    
    print("1. Matrix Information:")
    info = matrix.get_matrix_info()
    print(f"   Module range: {info['module_count_range'][0]}-{info['module_count_range'][1]} modules")
    print(f"   Storage options: {len(info['storage_models'])} models")
    print(f"   Available storage models: {info['storage_models']}")
    print(f"   Has 'Ohne Speicher' option: {info['has_no_storage']}")
    
    validation_errors = matrix.validate_structure()
    if validation_errors:
        print(f"   Validation errors: {validation_errors}")
    else:
        print("   ✓ Matrix structure is valid")
    
    print("\n2. Price Lookup Examples:")
    
    # Example 1: Exact match with storage
    price, errors = matrix.get_price(10, 'BYD Battery-Box Premium LVS 4.0', True)
    print(f"   10 modules + BYD LVS 4.0: €{price:,.2f}")
    if errors:
        print(f"   Errors: {errors}")
    
    # Example 2: Case insensitive matching
    price, errors = matrix.get_price(8, 'huawei luna2000-5kwh', True)
    print(f"   8 modules + Huawei 5kWh (case insensitive): €{price:,.2f}")
    if errors:
        print(f"   Errors: {errors}")
    
    # Example 3: No storage option
    price, errors = matrix.get_price(12, None, False)
    print(f"   12 modules without storage: €{price:,.2f}")
    if errors:
        print(f"   Errors: {errors}")
    
    # Example 4: Storage model not found (fallback)
    price, errors = matrix.get_price(9, 'Unknown Storage Model', True)
    print(f"   9 modules + Unknown Model (fallback): €{price:,.2f}")
    if errors:
        print(f"   Errors: {errors}")
    
    # Example 5: Module count not found
    price, errors = matrix.get_price(15, 'BYD Battery-Box Premium LVS 4.0', True)
    print(f"   15 modules + BYD LVS 4.0 (not found): €{price:,.2f}")
    if errors:
        print(f"   Errors: {errors}")
    
    print("\n3. Available Options:")
    print(f"   Module counts: {matrix.get_available_module_counts()}")
    print(f"   Storage models: {matrix.get_available_storage_models()}")
    
    print("\n=== Demo Complete ===")


if __name__ == "__main__":
    demonstrate_price_matrix()