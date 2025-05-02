import pytest
import pandas as pd
import numpy as np
from price_predictor import predict_house_price, initialise

@pytest.fixture(scope="module")
def setup_models():
    initialise()

@pytest.fixture
def realistic_property_data():
    #sample property data 
    return {
        'address': "47 Cecil Aldin Drive, Tilehurst",
        'address1': "47 Cecil Aldin Drive",
        'address2': "Tilehurst",
        'address3': "",
        'age_in_years': 52,
        'both_schools_outstanding': 0,
        'building_reference_number': "10006176924",
        'built_form': "Semi-Detached",
        'co2_emiss_curr_per_floor_area': "35",
        'co2_emissions_current': "4.4",
        'co2_emissions_potential': "2.5",
        'constituency': "E14000890",
        'constituency_label': "Reading West",
        'construction_age_band': "England and Wales: 1967-1975",
        'county': "",
        'current_energy_efficiency': "68",
        'current_energy_rating': "D",
        'energy_consumption_current': "200",
        'energy_consumption_potential': "110",
        'energy_tariff': "Unknown",
        'environment_impact_current': "62",
        'environment_impact_potential': "77",
        'extension_count': "3",
        'fixed_lighting_outlets_count': "16",
        'flat_storey_count': "",
        'flat_top_storey': "",
        'floor_description': "Solid, no insulation (assumed)",
        'floor_energy_eff': "N/A",
        'floor_env_eff': "N/A",
        'floor_height': "2.4",
        'floor_level': "",
        'glazed_area': "Normal",
        'glazed_type': "double glazing installed before 2002",
        'heat_loss_corridor': "",
        'heating_cost_current': "1363",
        'heating_cost_potential': "1098",
        'hot_water_cost_current': "196",
        'hot_water_cost_potential': "133",
        'hot_water_energy_eff': "Good",
        'hot_water_env_eff': "Good",
        'hotwater_description': "From main system",
        'inspection_date': "2024-06-27",
        'latitude': 51.478646,
        'lighting_cost_current': "135",
        'lighting_cost_potential': "135",
        'lighting_description': "Low energy lighting in all fixed outlets",
        'lighting_energy_eff': "Very Good",
        'lighting_env_eff': "Very Good",
        'lmk_key': "aa77f3b793c566262994b26fc37416836e3a039a282aed946bed2e78b05878af",
        'local_authority': "E06000037",
        'local_authority_label': "West Berkshire",
        'lodgement_date': "2024-06-27",
        'lodgement_datetime': "2024-06-27 17:22:55",
        'longitude': -1.049623,
        'low_energy_fixed_light_count': "",
        'low_energy_lighting': "100",
        'main_fuel': "mains gas (not community)",
        'main_heating_controls': "",
        'mainheat_description': "Boiler and radiators, mains gas",
        'mainheat_energy_eff': "Good",
        'mainheat_env_eff': "Good",
        'mainheatc_energy_eff': "Good",
        'mainheatc_env_eff': "Good",
        'mainheatcont_description': "Programmer, room thermostat and TRVs",
        'mains_gas_flag': "Y",
        'mechanical_ventilation': "natural",
        'multi_glaze_proportion': "100",
        'nearest_bus_stop_distance': 0.1198203060574743,
        'nearest_primary_school_distance': 0.24427699589743282,
        'nearest_primary_school_ofsted_rating': 3,
        'nearest_primary_school_outstanding': 0,
        'nearest_secondary_school_distance': 0.6299416374769284,
        'nearest_secondary_school_ofsted_rating': 4,
        'nearest_secondary_school_outstanding': 1,
        'nearest_shop_distance': 2.2273001228163682,
        'nearest_shop_name': "Co-op Tilehurst",
        'nearest_train_station_distance': 1.5977440704598072,
        'number_habitable_rooms': "6",
        'number_heated_rooms': "6",
        'number_open_fireplaces': "0",
        'photo_supply': "0.0",
        'postcode': "RG31 6YP",
        'posttown': "READING",
        'potential_energy_efficiency': "82",
        'potential_energy_rating': "B",
        'primary_school_name': "Long Lane Primary School",
        'property_type': "S",  # S for semi-detached
        'report_type': "100",
        'roof_description': "Pitched, 100 mm loft insulation",
        'roof_energy_eff': "Average",
        'roof_env_eff': "Average",
        'secondary_school_name': "Brookfields Special School",
        'secondheat_description': "None",
        'sheating_energy_eff': "N/A",
        'sheating_env_eff': "N/A",
        'solar_water_heating_flag': "N",
        'tenure': "Owner-occupied",
        'total_floor_area': "126.0",
        'transaction_type': "marketed sale",
        'unheated_corridor_length': "",
        'uprn': "100080238031",
        'uprn_source': "Energy Assessor",
        'walls_description': "Cavity wall, as built, no insulation (assumed)",
        'walls_energy_eff': "Poor",
        'walls_env_eff': "Poor",
        'wind_turbine_count': "0",
        'windows_description': "Fully double glazed",
        'windows_energy_eff': "Average",
        'windows_env_eff': "Average"
    }


#test price predictior works with real data
def test_price_predictor_with_realistic_data(setup_models, realistic_property_data):
    # Convert to DataFrame
    input_data = pd.DataFrame([realistic_property_data])
    
    # Make prediction
    result = predict_house_price(input_data)[0]
    
    # Verify result
    assert isinstance(result, float)
    assert result > 0
    print(f"Predicted price for sample property: £{result:,.2f}")

#Test that price predictior returns error for missing critical data
def test_price_predictor_with_critical_missing_data(setup_models, realistic_property_data):
    
    # Create a copy and remove critical fields
    incomplete_data = realistic_property_data.copy()
    
    del incomplete_data['property_type']
    del incomplete_data['total_floor_area']
    del incomplete_data['local_authority_label']
    
    input_data = pd.DataFrame([incomplete_data])
    
    # The model should raise an error when critical data is missing
    with pytest.raises(Exception) as excinfo:
        predict_house_price(input_data)
    
    # Check that the error message is appropriate
    assert str(excinfo.value) == "Prediction on this house could not occur"