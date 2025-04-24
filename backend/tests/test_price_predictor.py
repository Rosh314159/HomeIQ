import pytest
import pandas as pd

@pytest.fixture(scope="module")
def setup_models():
    """Fixture to load models once for all tests"""
    load_models()

def test_price_predictor_with_valid_data(setup_models):
    # Create a sample valid input dataframe
    input_data = pd.DataFrame({
        'age_in_years': [10],
        'postcode': ['AB1 2CD'],
        'property_type': ['Detached'],
        'local_authority_label': ['Manchester'],
        'total_floor_area': [150],
        'number_habitable_rooms': [5],
        'number_open_fireplaces': [1],
        'nearest_primary_school_distance': [0.5],
        'nearest_secondary_school_distance': [1.2],
        'nearest_primary_school_outstanding': [1],
        'nearest_secondary_school_outstanding': [0],
        'nearest_shop_distance': [0.3],
        'nearest_train_station_distance': [0.8],
        'nearest_bus_stop_distance': [0.2]
    })
    
    # Prediction should return a positive float value
    result = predict_house_price(input_data)
    assert isinstance(result, float)
    assert result > 0

def test_price_predictor_with_different_property_types(setup_models):
    # Test with different property types
    property_types = ['Detached', 'Semi-Detached', 'Terraced', 'Flat']
    
    for prop_type in property_types:
        input_data = pd.DataFrame({
            'age_in_years': [15],
            'postcode': ['AB1 2CD'],
            'property_type': [prop_type],
            'local_authority_label': ['London'],
            'total_floor_area': [120],
            'number_habitable_rooms': [4],
            'number_open_fireplaces': [0],
            'nearest_primary_school_distance': [0.4],
            'nearest_secondary_school_distance': [1.0],
            'nearest_primary_school_outstanding': [1],
            'nearest_secondary_school_outstanding': [1],
            'nearest_shop_distance': [0.2],
            'nearest_train_station_distance': [0.5],
            'nearest_bus_stop_distance': [0.1]
        })
        
        result = predict_house_price(input_data)
        assert isinstance(result, float)
        assert result > 0

def test_price_predictor_edge_cases(setup_models):
    # Test with extreme values
    edge_case_input = pd.DataFrame({
        'age_in_years': [100],  # Very old property
        'postcode': ['AB1 2CD'],
        'property_type': ['Detached'],
        'local_authority_label': ['Birmingham'],
        'total_floor_area': [500],  # Very large area
        'number_habitable_rooms': [10],
        'number_open_fireplaces': [5],
        'nearest_primary_school_distance': [5.0],  # Far from schools
        'nearest_secondary_school_distance': [10.0],
        'nearest_primary_school_outstanding': [0],
        'nearest_secondary_school_outstanding': [0],
        'nearest_shop_distance': [3.0],
        'nearest_train_station_distance': [7.0],
        'nearest_bus_stop_distance': [2.0]
    })
    
    result = predict_house_price(edge_case_input)
    assert isinstance(result, float)
    assert result > 0

def test_price_predictor_input_sensitivity(setup_models):
    # Base case
    base_input = pd.DataFrame({
        'age_in_years': [20],
        'postcode': ['AB1 2CD'],
        'property_type': ['Detached'],
        'local_authority_label': ['Leeds'],
        'total_floor_area': [150],
        'number_habitable_rooms': [4],
        'number_open_fireplaces': [1],
        'nearest_primary_school_distance': [0.5],
        'nearest_secondary_school_distance': [1.2],
        'nearest_primary_school_outstanding': [1],
        'nearest_secondary_school_outstanding': [1],
        'nearest_shop_distance': [0.3],
        'nearest_train_station_distance': [0.8],
        'nearest_bus_stop_distance': [0.2]
    })
    
    base_result = predict_house_price(base_input)
    
    # Test with larger floor area
    larger_area_input = base_input.copy()
    larger_area_input['total_floor_area'] = [300]
    larger_area_result = predict_house_price(larger_area_input)
    