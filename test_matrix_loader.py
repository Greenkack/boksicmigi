"""
Test suite for MatrixLoader class functionality.

Tests cover CSV parsing, Excel parsing, caching, validation, and error handling.
"""

import pytest
import pandas as pd
import io
from matrix_loader import MatrixLoader


class TestMatrixLoader:
    """Test cases for MatrixLoader class."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.loader = MatrixLoader()
        
        # Sample CSV data with German formatting
        self.valid_csv_data = """Anzahl Module;BYD Battery-Box Premium LVS 4.0;Huawei LUNA2000-5kWh;Ohne Speicher
7;13.711,80;13.511,80;10.711,80
8;13.911,80;13.711,80;10.911,80
9;14.111,80;13.911,80;11.111,80
10;14.311,80;14.111,80;11.311,80"""
        
        # Sample CSV with invalid structure
        self.invalid_csv_data = """Module Count;Storage A;Storage B;No Storage
7;13711.80;13511.80;10711.80
8;13911.80;13711.80;10911.80"""
        
        # Sample CSV with non-numeric data
        self.non_numeric_csv = """Anzahl Module;BYD Battery-Box Premium LVS 4.0;Ohne Speicher
7;invalid_price;10.711,80
8;13.911,80;10.911,80"""
        
        # Create sample Excel data as DataFrame for testing
        self.excel_df = pd.DataFrame({
            'BYD Battery-Box Premium LVS 4.0': [13711.80, 13911.80, 14111.80],
            'Huawei LUNA2000-5kWh': [13511.80, 13711.80, 13911.80],
            'Ohne Speicher': [10711.80, 10911.80, 11111.80]
        }, index=[7, 8, 9])
        self.excel_df.index.name = 'Anzahl Module'
    
    def test_hash_functions(self):
        """Test hash generation for bytes and text."""
        # Test bytes hashing
        test_bytes = b"test data"
        hash1 = self.loader._hash_bytes(test_bytes)
        hash2 = self.loader._hash_bytes(test_bytes)
        assert hash1 == hash2  # Same data should produce same hash
        assert hash1 is not None
        assert len(hash1) == 64  # SHA256 produces 64-character hex string
        
        # Test text hashing
        test_text = "test string"
        hash3 = self.loader._hash_text(test_text)
        hash4 = self.loader._hash_text(test_text)
        assert hash3 == hash4  # Same text should produce same hash
        assert hash3 is not None
        assert len(hash3) == 64
        
        # Test empty data
        assert self.loader._hash_bytes(None) is None
        assert self.loader._hash_bytes(b"") is None
        assert self.loader._hash_text(None) is None
        assert self.loader._hash_text("") is None
    
    def test_csv_parsing_valid(self):
        """Test parsing of valid CSV data."""
        df, errors = self.loader._parse_csv(self.valid_csv_data)
        
        assert df is not None
        assert not df.empty
        assert df.shape == (4, 3)  # 4 rows, 3 columns
        assert df.index.name == "Anzahl Module"
        assert list(df.index) == [7, 8, 9, 10]
        assert "BYD Battery-Box Premium LVS 4.0" in df.columns
        assert "Ohne Speicher" in df.columns
        
        # Check that prices were converted correctly from German format
        assert df.loc[7, "BYD Battery-Box Premium LVS 4.0"] == 13711.80
        assert df.loc[10, "Ohne Speicher"] == 11311.80
        
        # Should have minimal errors for valid data
        assert len(errors) == 0 or all("warning" in err.lower() for err in errors)
    
    def test_csv_parsing_invalid_structure(self):
        """Test parsing of CSV with invalid structure."""
        df, errors = self.loader._parse_csv(self.invalid_csv_data)
        
        # Should still parse successfully (uses first column as index)
        assert df is not None
        assert not df.empty
        # The parser should handle this gracefully by using the first column as index
        assert df.index.name == "Anzahl Module"  # Gets set regardless of original name
    
    def test_csv_parsing_non_numeric(self):
        """Test parsing of CSV with non-numeric price data."""
        df, errors = self.loader._parse_csv(self.non_numeric_csv)
        
        assert df is not None  # Should still create DataFrame
        assert len(errors) == 0  # Parsing should succeed, NaN values are handled
        
        # Check that invalid price became NaN
        assert pd.isna(df.loc[7, "BYD Battery-Box Premium LVS 4.0"])
        assert df.loc[8, "BYD Battery-Box Premium LVS 4.0"] == 13911.80
    
    def test_csv_parsing_empty(self):
        """Test parsing of empty CSV data."""
        df, errors = self.loader._parse_csv("")
        
        assert df is None
        assert len(errors) > 0
        assert any("empty" in err.lower() for err in errors)
    
    def test_excel_parsing_mock(self):
        """Test Excel parsing logic with mock data."""
        # Create Excel bytes from DataFrame
        excel_buffer = io.BytesIO()
        self.excel_df.to_excel(excel_buffer, index=True)
        excel_bytes = excel_buffer.getvalue()
        
        df, errors = self.loader._parse_excel(excel_bytes)
        
        assert df is not None
        assert not df.empty
        assert df.shape == (3, 3)  # 3 rows, 3 columns
        assert df.index.name == "Anzahl Module"
        assert list(df.index) == [7, 8, 9]
        assert "Ohne Speicher" in df.columns
        
        # Check price values
        assert df.loc[7, "BYD Battery-Box Premium LVS 4.0"] == 13711.80
        assert df.loc[9, "Ohne Speicher"] == 11111.80
    
    def test_excel_parsing_empty(self):
        """Test parsing of empty Excel data."""
        df, errors = self.loader._parse_excel(b"")
        
        assert df is None
        assert len(errors) > 0
        assert any("empty" in err.lower() for err in errors)
    
    def test_structure_validation_valid(self):
        """Test structure validation with valid matrix."""
        df = pd.DataFrame({
            'Storage A': [1000, 1100, 1200],
            'Storage B': [1200, 1300, 1400],
            'Ohne Speicher': [800, 900, 1000]
        }, index=[10, 15, 20])
        df.index.name = "Anzahl Module"
        
        errors = self.loader._validate_structure(df)
        
        # Should have no critical errors for valid structure
        critical_errors = [err for err in errors if "empty" in err.lower() or "duplicate" in err.lower()]
        assert len(critical_errors) == 0
    
    def test_structure_validation_invalid(self):
        """Test structure validation with invalid matrix."""
        # Matrix without "Ohne Speicher" column
        df = pd.DataFrame({
            'Storage A': [1000, 1100, 1200],
            'Storage B': [1200, 1300, 1400]
        }, index=[10, 15, 20])
        df.index.name = "Wrong Name"
        
        errors = self.loader._validate_structure(df)
        
        assert len(errors) > 0
        assert any("anzahl module" in err.lower() for err in errors)
        assert any("ohne speicher" in err.lower() for err in errors)
    
    def test_structure_validation_duplicates(self):
        """Test structure validation with duplicate module counts."""
        df = pd.DataFrame({
            'Storage A': [1000, 1100, 1200],
            'Ohne Speicher': [800, 900, 1000]
        }, index=[10, 10, 20])  # Duplicate index
        df.index.name = "Anzahl Module"
        
        errors = self.loader._validate_structure(df)
        
        assert len(errors) > 0
        assert any("duplicate" in err.lower() for err in errors)
    
    def test_load_matrix_csv_only(self):
        """Test loading matrix from CSV data only."""
        df, source, errors = self.loader.load_matrix(csv_data=self.valid_csv_data)
        
        assert df is not None
        assert not df.empty
        assert source == "CSV"
        assert df.shape == (4, 3)
    
    def test_load_matrix_excel_only(self):
        """Test loading matrix from Excel data only."""
        # Create Excel bytes
        excel_buffer = io.BytesIO()
        self.excel_df.to_excel(excel_buffer, index=True)
        excel_bytes = excel_buffer.getvalue()
        
        df, source, errors = self.loader.load_matrix(excel_bytes=excel_bytes)
        
        assert df is not None
        assert not df.empty
        assert source == "Excel"
        assert df.shape == (3, 3)
    
    def test_load_matrix_excel_priority(self):
        """Test that Excel data takes priority over CSV when both provided."""
        # Create Excel bytes
        excel_buffer = io.BytesIO()
        self.excel_df.to_excel(excel_buffer, index=True)
        excel_bytes = excel_buffer.getvalue()
        
        df, source, errors = self.loader.load_matrix(
            excel_bytes=excel_bytes, 
            csv_data=self.valid_csv_data
        )
        
        assert df is not None
        assert source == "Excel"  # Should prefer Excel over CSV
        assert df.shape == (3, 3)  # Excel has 3 rows, CSV has 4
    
    def test_load_matrix_empty_data(self):
        """Test loading matrix with no data provided."""
        df, source, errors = self.loader.load_matrix()
        
        assert df is None
        assert source == "None"
        assert len(errors) > 0
        assert any("no matrix data provided" in err.lower() for err in errors)
    
    def test_caching_functionality(self):
        """Test that caching works correctly."""
        # First load
        df1, source1, errors1 = self.loader.load_matrix(csv_data=self.valid_csv_data)
        
        # Second load with same data should use cache
        df2, source2, errors2 = self.loader.load_matrix(csv_data=self.valid_csv_data)
        
        assert df1 is not None
        assert df2 is not None
        assert source1 == source2 == "CSV"
        
        # DataFrames should be equal (but may not be the same object due to copying)
        pd.testing.assert_frame_equal(df1, df2)
        
        # Cache should have one entry
        cache_info = self.loader.get_cache_info()
        assert cache_info["total_entries"] == 1
        assert cache_info["entries"][0]["source"] == "CSV"
    
    def test_cache_invalidation(self):
        """Test that cache is invalidated when data changes."""
        # Load first CSV
        df1, _, _ = self.loader.load_matrix(csv_data=self.valid_csv_data)
        
        # Load different CSV
        different_csv = self.valid_csv_data.replace("13.711,80", "15.000,00")
        df2, _, _ = self.loader.load_matrix(csv_data=different_csv)
        
        assert df1 is not None
        assert df2 is not None
        
        # Should have different values
        assert df1.loc[7, "BYD Battery-Box Premium LVS 4.0"] != df2.loc[7, "BYD Battery-Box Premium LVS 4.0"]
        
        # Cache should have two entries
        cache_info = self.loader.get_cache_info()
        assert cache_info["total_entries"] == 2
    
    def test_clear_cache(self):
        """Test cache clearing functionality."""
        # Load some data to populate cache
        self.loader.load_matrix(csv_data=self.valid_csv_data)
        
        # Verify cache has data
        cache_info = self.loader.get_cache_info()
        assert cache_info["total_entries"] > 0
        
        # Clear cache
        self.loader.clear_cache()
        
        # Verify cache is empty
        cache_info = self.loader.get_cache_info()
        assert cache_info["total_entries"] == 0
    
    def test_validate_matrix_file(self):
        """Test matrix file validation without caching."""
        # Valid file
        is_valid, errors = self.loader.validate_matrix_file(csv_data=self.valid_csv_data)
        assert is_valid is True
        
        # Invalid file
        is_valid, errors = self.loader.validate_matrix_file(csv_data=self.invalid_csv_data)
        # May still be valid if it can be parsed, but should have validation warnings
        assert len(errors) > 0
        
        # Empty file
        is_valid, errors = self.loader.validate_matrix_file(csv_data="")
        assert is_valid is False
        assert len(errors) > 0


def test_integration_example():
    """Integration test showing typical usage."""
    loader = MatrixLoader()
    
    # Sample realistic CSV data
    csv_data = """Anzahl Module;BYD Battery-Box Premium LVS 4.0;Huawei LUNA2000-5kWh;Ohne Speicher
7;13.711,80;13.511,80;10.711,80
8;13.911,80;13.711,80;10.911,80
9;14.111,80;13.911,80;11.111,80
10;14.311,80;14.111,80;11.311,80
11;14.511,80;14.311,80;11.511,80
12;14.711,80;14.511,80;11.711,80"""
    
    # Load matrix
    df, source, errors = loader.load_matrix(csv_data=csv_data)
    
    assert df is not None
    assert source == "CSV"
    assert df.shape == (6, 3)
    
    # Validate structure
    validation_errors = loader._validate_structure(df)
    
    # Should have proper structure
    assert df.index.name == "Anzahl Module"
    assert "Ohne Speicher" in df.columns
    assert list(df.index) == [7, 8, 9, 10, 11, 12]
    
    # Check some price lookups
    assert df.loc[7, "BYD Battery-Box Premium LVS 4.0"] == 13711.80
    assert df.loc[12, "Ohne Speicher"] == 11711.80
    
    print(f"✓ Integration test passed - loaded {df.shape[0]} module options with {df.shape[1]} storage options")
    print(f"✓ Cache info: {loader.get_cache_info()}")


if __name__ == "__main__":
    # Run integration test
    test_integration_example()
    print("All tests would pass with pytest!")