"""
Demonstration of MatrixLoader integration with PriceMatrix class.

Shows how the unified MatrixLoader can be used to load and cache price matrices
from both CSV and Excel sources, then integrate with the PriceMatrix class.
"""

import pandas as pd
import io
from matrix_loader import MatrixLoader
from price_matrix import PriceMatrix


def create_sample_csv_data():
    """Create realistic CSV data for testing."""
    return """Anzahl Module;BYD Battery-Box Premium LVS 4.0;BYD Battery-Box Premium LVS 8.0;Huawei LUNA2000-5kWh;Huawei LUNA2000-10kWh;Ohne Speicher
7;13.711,80;14.311,80;13.511,80;14.111,80;10.711,80
8;13.911,80;14.511,80;13.711,80;14.311,80;10.911,80
9;14.111,80;14.711,80;13.911,80;14.511,80;11.111,80
10;14.311,80;14.911,80;14.111,80;14.711,80;11.311,80
11;14.511,80;15.111,80;14.311,80;14.911,80;11.511,80
12;14.711,80;15.311,80;14.511,80;15.111,80;11.711,80"""


def create_sample_excel_bytes():
    """Create sample Excel data as bytes."""
    df = pd.DataFrame({
        'BYD Battery-Box Premium LVS 4.0': [13711.80, 13911.80, 14111.80, 14311.80],
        'BYD Battery-Box Premium LVS 8.0': [14311.80, 14511.80, 14711.80, 14911.80],
        'Huawei LUNA2000-5kWh': [13511.80, 13711.80, 13911.80, 14111.80],
        'Huawei LUNA2000-10kWh': [14111.80, 14311.80, 14511.80, 14711.80],
        'Ohne Speicher': [10711.80, 10911.80, 11111.80, 11311.80]
    }, index=[7, 8, 9, 10])
    df.index.name = 'Anzahl Module'
    
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=True)
    return excel_buffer.getvalue()


def demonstrate_matrix_loader():
    """Demonstrate MatrixLoader functionality."""
    print("=== MatrixLoader Demonstration ===\n")
    
    # Initialize loader
    loader = MatrixLoader()
    
    # 1. Load from CSV
    print("1. Loading from CSV data:")
    csv_data = create_sample_csv_data()
    df_csv, source_csv, errors_csv = loader.load_matrix(csv_data=csv_data)
    
    print(f"   Source: {source_csv}")
    print(f"   Shape: {df_csv.shape}")
    print(f"   Errors: {len(errors_csv)} ({'None' if not errors_csv else 'Some warnings'})")
    print(f"   Module range: {min(df_csv.index)} - {max(df_csv.index)}")
    print(f"   Storage options: {list(df_csv.columns)}")
    
    # 2. Load from Excel (should use cache for CSV, then load Excel)
    print("\n2. Loading from Excel data:")
    excel_bytes = create_sample_excel_bytes()
    df_excel, source_excel, errors_excel = loader.load_matrix(excel_bytes=excel_bytes)
    
    print(f"   Source: {source_excel}")
    print(f"   Shape: {df_excel.shape}")
    print(f"   Errors: {len(errors_excel)} ({'None' if not errors_excel else 'Some warnings'})")
    
    # 3. Load with both (Excel should take priority)
    print("\n3. Loading with both CSV and Excel (Excel priority):")
    df_both, source_both, errors_both = loader.load_matrix(
        excel_bytes=excel_bytes, 
        csv_data=csv_data
    )
    
    print(f"   Source: {source_both}")
    print(f"   Shape: {df_both.shape}")
    print(f"   Excel priority confirmed: {source_both == 'Excel'}")
    
    # 4. Cache information
    print("\n4. Cache information:")
    cache_info = loader.get_cache_info()
    print(f"   Total cached entries: {cache_info['total_entries']}")
    for entry in cache_info['entries']:
        print(f"   - {entry['source']}: {entry['shape']}, {entry['error_count']} errors")
    
    # 5. Integration with PriceMatrix
    print("\n5. Integration with PriceMatrix class:")
    try:
        price_matrix = PriceMatrix(df_csv)
        
        # Test some price lookups
        test_cases = [
            (10, 'BYD Battery-Box Premium LVS 4.0', True),
            (8, 'Huawei LUNA2000-5kWh', True),
            (12, None, False),  # No storage
            (9, 'Unknown Storage', True),  # Should fallback to "Ohne Speicher"
        ]
        
        print("   Price lookup tests:")
        for modules, storage, include_storage in test_cases:
            price, lookup_errors = price_matrix.get_price(modules, storage, include_storage)
            storage_desc = storage if storage else "No storage"
            if include_storage and storage:
                storage_desc = storage
            elif not include_storage:
                storage_desc = "No storage"
            else:
                storage_desc = "No storage (fallback)"
            
            print(f"   - {modules} modules + {storage_desc}: €{price:,.2f}")
            if lookup_errors:
                for error in lookup_errors:
                    print(f"     Warning: {error}")
        
        # Matrix information
        matrix_info = price_matrix.get_matrix_info()
        print(f"\n   Matrix info:")
        print(f"   - Module range: {matrix_info['module_count_range']}")
        print(f"   - Storage models: {len(matrix_info['storage_models'])}")
        print(f"   - Has 'Ohne Speicher': {matrix_info['has_no_storage']}")
        print(f"   - Validation errors: {len(matrix_info['validation_errors'])}")
        
    except Exception as e:
        print(f"   Error integrating with PriceMatrix: {e}")
    
    # 6. Validation functionality
    print("\n6. Matrix validation:")
    
    # Valid matrix
    is_valid, validation_errors = loader.validate_matrix_file(csv_data=csv_data)
    print(f"   CSV validation: {'✓ Valid' if is_valid else '✗ Invalid'}")
    if validation_errors:
        print(f"   Validation issues: {len(validation_errors)}")
        for error in validation_errors[:3]:  # Show first 3 errors
            print(f"     - {error}")
    
    # Invalid matrix (missing "Ohne Speicher")
    invalid_csv = csv_data.replace("Ohne Speicher", "No Storage")
    is_valid_invalid, validation_errors_invalid = loader.validate_matrix_file(csv_data=invalid_csv)
    print(f"   Invalid CSV validation: {'✓ Valid' if is_valid_invalid else '✗ Invalid'}")
    if validation_errors_invalid:
        print(f"   Validation issues: {len(validation_errors_invalid)}")
        for error in validation_errors_invalid[:2]:  # Show first 2 errors
            print(f"     - {error}")
    
    print("\n=== Demonstration Complete ===")


def demonstrate_caching_performance():
    """Demonstrate caching performance benefits."""
    print("\n=== Caching Performance Demo ===")
    
    import time
    
    loader = MatrixLoader()
    csv_data = create_sample_csv_data()
    
    # First load (no cache)
    start_time = time.time()
    df1, source1, errors1 = loader.load_matrix(csv_data=csv_data)
    first_load_time = time.time() - start_time
    
    # Second load (from cache)
    start_time = time.time()
    df2, source2, errors2 = loader.load_matrix(csv_data=csv_data)
    cached_load_time = time.time() - start_time
    
    print(f"First load time: {first_load_time:.4f} seconds")
    print(f"Cached load time: {cached_load_time:.4f} seconds")
    print(f"Cache speedup: {first_load_time / cached_load_time:.1f}x faster")
    
    # Verify data is identical
    try:
        pd.testing.assert_frame_equal(df1, df2)
        print("✓ Cached data is identical to original")
    except AssertionError:
        print("✗ Cached data differs from original")
    
    print("=== Caching Demo Complete ===")


if __name__ == "__main__":
    demonstrate_matrix_loader()
    demonstrate_caching_performance()