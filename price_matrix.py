"""
Central PriceMatrix class with INDEX/MATCH logic for solar calculator pricing.

This module provides a robust implementation of Excel-like INDEX/MATCH functionality
for price lookups based on module count and storage model selection.
"""

import pandas as pd
from typing import Optional, List, Tuple, Union
import logging

logger = logging.getLogger(__name__)


class PriceMatrix:
    """
    Central price matrix class that implements Excel INDEX/MATCH logic.
    
    The matrix structure expects:
    - First column: "Anzahl Module" (module counts as index)
    - Additional columns: Battery storage model names
    - Last column: "Ohne Speicher" (without storage)
    """
    
    def __init__(self, dataframe: pd.DataFrame):
        """
        Initialize PriceMatrix with validated DataFrame.
        
        Args:
            dataframe: Pandas DataFrame with price matrix data
            
        Raises:
            ValueError: If matrix structure is invalid
        """
        self.df = dataframe.copy()
        self._validate_and_prepare_matrix()
        
        # Extract module counts and storage models for quick access
        self.module_counts = list(self.df.index)
        self.storage_models = list(self.df.columns)
        
        logger.info(f"PriceMatrix initialized with {len(self.module_counts)} module counts "
                   f"and {len(self.storage_models)} storage options")
    
    def _validate_and_prepare_matrix(self) -> None:
        """
        Validate matrix structure and prepare for INDEX/MATCH operations.
        
        Raises:
            ValueError: If matrix structure is invalid
        """
        if self.df.empty:
            raise ValueError("Price matrix cannot be empty")
        
        # Check if we have at least one column for "Ohne Speicher"
        if len(self.df.columns) == 0:
            raise ValueError("Price matrix must have at least one column")
        
        # Validate that last column is "Ohne Speicher" (case-insensitive)
        last_column = str(self.df.columns[-1]).strip().lower()
        if last_column != "ohne speicher":
            logger.warning(f"Last column '{self.df.columns[-1]}' is not 'Ohne Speicher'. "
                          "This may cause issues with 'no storage' lookups.")
        
        # Ensure all price values are numeric
        for col in self.df.columns:
            try:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
            except Exception as e:
                raise ValueError(f"Column '{col}' contains non-numeric values: {e}")
        
        # Check for any NaN values after conversion
        if self.df.isnull().any().any():
            nan_locations = self.df.isnull().sum()
            logger.warning(f"Matrix contains NaN values: {nan_locations.to_dict()}")
        
        # Ensure index (module counts) are integers
        try:
            self.df.index = pd.to_numeric(self.df.index, errors='coerce').astype('Int64')
        except Exception as e:
            raise ValueError(f"Module counts (index) must be numeric: {e}")
    
    def normalize_storage_model(self, storage_model: str) -> str:
        """
        Normalize storage model name for consistent matching.
        
        Args:
            storage_model: Raw storage model name
            
        Returns:
            Normalized storage model name (trimmed, lowercase)
        """
        if not storage_model:
            return ""
        return str(storage_model).strip().lower()
    
    def get_price(self, module_count: int, storage_model: Optional[str] = None, 
                  include_storage: bool = True) -> Tuple[float, List[str]]:
        """
        Get price using Excel INDEX/MATCH logic.
        
        Args:
            module_count: Number of PV modules
            storage_model: Battery storage model name (optional)
            include_storage: Whether to include storage in calculation
            
        Returns:
            Tuple of (price, error_messages)
            - price: Found price or 0.0 if not found
            - error_messages: List of any errors encountered
        """
        errors = []
        
        try:
            # Step 1: Find row index (MATCH on module count)
            if module_count not in self.df.index:
                available_counts = sorted([int(x) for x in self.df.index if pd.notna(x)])
                errors.append(f"Module count {module_count} not found in matrix. "
                             f"Available counts: {available_counts}")
                return 0.0, errors
            
            # Step 2: Determine column (MATCH on storage model)
            target_column = None
            
            if not include_storage or storage_model is None:
                # Use "Ohne Speicher" column (last column)
                target_column = self.df.columns[-1]
                logger.debug(f"Using 'no storage' column: {target_column}")
            else:
                # Normalize the input storage model
                normalized_input = self.normalize_storage_model(storage_model)
                
                # Find matching column (case-insensitive, trimmed)
                for col in self.df.columns:
                    normalized_col = self.normalize_storage_model(col)
                    if normalized_col == normalized_input:
                        target_column = col
                        break
                
                if target_column is None:
                    # Fallback to "Ohne Speicher" if storage model not found
                    target_column = self.df.columns[-1]
                    available_models = [col for col in self.df.columns if col != self.df.columns[-1]]
                    errors.append(f"Storage model '{storage_model}' not found in matrix. "
                                 f"Available models: {available_models}. "
                                 f"Using 'Ohne Speicher' as fallback.")
            
            # Step 3: Get price at intersection (INDEX operation)
            price = self.df.loc[module_count, target_column]
            
            # Handle NaN values
            if pd.isna(price):
                errors.append(f"No price found for {module_count} modules with {target_column}")
                return 0.0, errors
            
            logger.debug(f"Found price {price} for {module_count} modules, {target_column}")
            return float(price), errors
            
        except Exception as e:
            error_msg = f"Error during price lookup: {str(e)}"
            logger.error(error_msg)
            errors.append(error_msg)
            return 0.0, errors
    
    def get_available_module_counts(self) -> List[int]:
        """
        Get list of available module counts in the matrix.
        
        Returns:
            Sorted list of available module counts
        """
        return sorted([int(x) for x in self.module_counts if pd.notna(x)])
    
    def get_available_storage_models(self) -> List[str]:
        """
        Get list of available storage models (excluding "Ohne Speicher").
        
        Returns:
            List of storage model names
        """
        # Return all columns except the last one ("Ohne Speicher")
        return list(self.storage_models[:-1])
    
    def has_no_storage_option(self) -> bool:
        """
        Check if matrix has "Ohne Speicher" option.
        
        Returns:
            True if "Ohne Speicher" column exists
        """
        if not self.storage_models:
            return False
        last_column = self.normalize_storage_model(self.storage_models[-1])
        return last_column == "ohne speicher"
    
    def validate_structure(self) -> List[str]:
        """
        Validate matrix structure and return any issues found.
        
        Returns:
            List of validation error messages
        """
        errors = []
        
        # Check if matrix is empty
        if self.df.empty:
            errors.append("Matrix is empty")
            return errors
        
        # Check for minimum required columns
        if len(self.df.columns) < 1:
            errors.append("Matrix must have at least one column")
        
        # Check if last column is "Ohne Speicher"
        if not self.has_no_storage_option():
            errors.append("Last column should be 'Ohne Speicher'")
        
        # Check for duplicate module counts
        if len(self.df.index) != len(set(self.df.index)):
            duplicates = self.df.index[self.df.index.duplicated()].tolist()
            errors.append(f"Duplicate module counts found: {duplicates}")
        
        # Check for non-numeric prices
        for col in self.df.columns:
            non_numeric = self.df[col].apply(lambda x: not pd.api.types.is_numeric_dtype(type(x)) and pd.notna(x))
            if non_numeric.any():
                errors.append(f"Column '{col}' contains non-numeric values")
        
        # Check for missing values
        missing_count = self.df.isnull().sum().sum()
        if missing_count > 0:
            errors.append(f"Matrix contains {missing_count} missing values")
        
        return errors
    
    def get_matrix_info(self) -> dict:
        """
        Get information about the loaded matrix.
        
        Returns:
            Dictionary with matrix statistics
        """
        return {
            "module_count_range": (min(self.get_available_module_counts()), 
                                 max(self.get_available_module_counts())),
            "total_module_options": len(self.get_available_module_counts()),
            "storage_models": self.get_available_storage_models(),
            "total_storage_options": len(self.get_available_storage_models()),
            "has_no_storage": self.has_no_storage_option(),
            "matrix_shape": self.df.shape,
            "validation_errors": self.validate_structure()
        }