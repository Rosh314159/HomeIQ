import pandas as pd
from app import app, db  # Import app to create context
from models import House
import sys

def upload_csv(file_path):
    try:
        df = pd.read_csv(file_path, low_memory=False)

        # Fill NaN values appropriately
        for column in df.select_dtypes(include=['float64', 'int64']).columns:
            df[column] = df[column].fillna(0)

        for column in df.select_dtypes(include=['object']).columns:
            df[column] = df[column].fillna("")

        batch_size = 500  
        records = []

        with app.app_context():
            for _, row in df.iterrows():
                house = House(
                    price=int(row['price']),
                    date_of_transfer=row['date_of_transfer'],
                    postcode=row['postcode'],
                    property_type=row['property_type'],
                    new_build=row['new_build'],
                    duration=row['duration'],
                    paon=row['paon'],
                    saon=row['saon'],
                    street=row['street'],
                    town_city=row['town_city'],
                    fullAddress=row['fullAddress'],
                    ADDRESS1=row['ADDRESS1'],
                    ADDRESS2=row['ADDRESS2'],
                    ADDRESS3=row['ADDRESS3'],
                    CURRENT_ENERGY_RATING=row['CURRENT_ENERGY_RATING'],
                    POTENTIAL_ENERGY_RATING=row['POTENTIAL_ENERGY_RATING'],
                    CURRENT_ENERGY_EFFICIENCY=row['CURRENT_ENERGY_EFFICIENCY'],
                    POTENTIAL_ENERGY_EFFICIENCY=row['POTENTIAL_ENERGY_EFFICIENCY'],
                    BUILT_FORM=row['BUILT_FORM'],
                    INSPECTION_DATE=row['INSPECTION_DATE'],
                    LOCAL_AUTHORITY=row['LOCAL_AUTHORITY'],
                    CONSTITUENCY=row['CONSTITUENCY'],
                    LODGEMENT_DATE=row['LODGEMENT_DATE'],
                    TRANSACTION_TYPE=row['TRANSACTION_TYPE'],
                    ENVIRONMENT_IMPACT_CURRENT=row['ENVIRONMENT_IMPACT_CURRENT'],
                    ENVIRONMENT_IMPACT_POTENTIAL=row['ENVIRONMENT_IMPACT_POTENTIAL'],
                    ENERGY_CONSUMPTION_CURRENT=row['ENERGY_CONSUMPTION_CURRENT'],
                    ENERGY_CONSUMPTION_POTENTIAL=row['ENERGY_CONSUMPTION_POTENTIAL'],
                    CO2_EMISSIONS_CURRENT=row['CO2_EMISSIONS_CURRENT'],
                    CO2_EMISS_CURR_PER_FLOOR_AREA=row['CO2_EMISS_CURR_PER_FLOOR_AREA'],
                    CO2_EMISSIONS_POTENTIAL=row['CO2_EMISSIONS_POTENTIAL'],
                    LIGHTING_COST_CURRENT=row['LIGHTING_COST_CURRENT'],
                    LIGHTING_COST_POTENTIAL=row['LIGHTING_COST_POTENTIAL'],
                    HEATING_COST_CURRENT=row['HEATING_COST_CURRENT'],
                    HEATING_COST_POTENTIAL=row['HEATING_COST_POTENTIAL'],
                    HOT_WATER_COST_CURRENT=row['HOT_WATER_COST_CURRENT'],
                    HOT_WATER_COST_POTENTIAL=row['HOT_WATER_COST_POTENTIAL'],
                    TOTAL_FLOOR_AREA=row['TOTAL_FLOOR_AREA'],
                    ENERGY_TARIFF=row['ENERGY_TARIFF'],
                    MAINS_GAS_FLAG=row['MAINS_GAS_FLAG'],
                    FLOOR_LEVEL=row['FLOOR_LEVEL'],
                    FLAT_TOP_STOREY=row['FLAT_TOP_STOREY'],
                    FLAT_STOREY_COUNT=int(row['FLAT_STOREY_COUNT']),
                    MAIN_HEATING_CONTROLS=row['MAIN_HEATING_CONTROLS'],
                    MULTI_GLAZE_PROPORTION=row['MULTI_GLAZE_PROPORTION'],
                    GLAZED_TYPE=row['GLAZED_TYPE'],
                    GLAZED_AREA=row['GLAZED_AREA'],
                    EXTENSION_COUNT=int(row['EXTENSION_COUNT']),
                    NUMBER_HABITABLE_ROOMS=int(row['NUMBER_HABITABLE_ROOMS']),
                    NUMBER_HEATED_ROOMS=int(row['NUMBER_HEATED_ROOMS']),
                    LOW_ENERGY_LIGHTING=row['LOW_ENERGY_LIGHTING'],
                    NUMBER_OPEN_FIREPLACES=int(row['NUMBER_OPEN_FIREPLACES']),
                    HOTWATER_DESCRIPTION=row['HOTWATER_DESCRIPTION'],
                    HOT_WATER_ENERGY_EFF=row['HOT_WATER_ENERGY_EFF'],
                    HOT_WATER_ENV_EFF=row['HOT_WATER_ENV_EFF'],
                    FLOOR_ENERGY_EFF=row['FLOOR_ENERGY_EFF'],
                    FLOOR_ENV_EFF=row['FLOOR_ENV_EFF'],
                    WINDOWS_ENERGY_EFF=row['WINDOWS_ENERGY_EFF'],
                    WINDOWS_ENV_EFF=row['WINDOWS_ENV_EFF'],
                    WALLS_ENERGY_EFF=row['WALLS_ENERGY_EFF'],
                    WALLS_ENV_EFF=row['WALLS_ENV_EFF'],
                    SHEATING_ENERGY_EFF=row['SHEATING_ENERGY_EFF'],
                    SHEATING_ENV_EFF=row['SHEATING_ENV_EFF'],
                    LIGHTING_DESCRIPTION=row['LIGHTING_DESCRIPTION'],
                    LIGHTING_ENERGY_EFF=row['LIGHTING_ENERGY_EFF'],
                    LIGHTING_ENV_EFF=row['LIGHTING_ENV_EFF'],
                    MAIN_FUEL=row['MAIN_FUEL'],
                    WIND_TURBINE_COUNT=int(row['WIND_TURBINE_COUNT']),
                    HEAT_LOSS_CORRIDOR=row['HEAT_LOSS_CORRIDOR'],
                    UNHEATED_CORRIDOR_LENGTH=row['UNHEATED_CORRIDOR_LENGTH'],
                    FLOOR_HEIGHT=row['FLOOR_HEIGHT'],
                    SOLAR_WATER_HEATING_FLAG=row['SOLAR_WATER_HEATING_FLAG'],
                    MECHANICAL_VENTILATION=row['MECHANICAL_VENTILATION'],
                    ADDRESS=row['ADDRESS'],
                    LOCAL_AUTHORITY_LABEL=row['LOCAL_AUTHORITY_LABEL'],
                    CONSTITUENCY_LABEL=row['CONSTITUENCY_LABEL'],
                    POSTTOWN=row['POSTTOWN'],
                    CONSTRUCTION_AGE_BAND=row['CONSTRUCTION_AGE_BAND'],
                    LODGEMENT_DATETIME=row['LODGEMENT_DATETIME'],
                    TENURE=row['TENURE'],
                    FIXED_LIGHTING_OUTLETS_COUNT=int(row['FIXED_LIGHTING_OUTLETS_COUNT']),
                    LOW_ENERGY_FIXED_LIGHT_COUNT=int(row['LOW_ENERGY_FIXED_LIGHT_COUNT']),
                    latitude=row['latitude'],
                    longitude=row['longitude'],
                    distance_to_london=row['distance_to_london'],
                    nearest_primary_school_distance=row['nearest_primary_school_distance'],
                    nearest_primary_school_ofsted_rating=int(row['nearest_primary_school_ofsted_rating']),
                    primary_school_name=row['primary_school_name'],
                    nearest_secondary_school_distance=row['nearest_secondary_school_distance'],
                    nearest_secondary_school_ofsted_rating=int(row['nearest_secondary_school_ofsted_rating']),
                    secondary_school_name=row['secondary_school_name'],
                    nearest_primary_school_outstanding=bool(row['nearest_primary_school_outstanding']),
                    nearest_secondary_school_outstanding=bool(row['nearest_secondary_school_outstanding']),
                    both_schools_outstanding=bool(row['both_schools_outstanding']),
                    area_code=row['area_code'],
                    nearest_shop_distance=row['nearest_shop_distance'],
                    nearest_shop_name=row['nearest_shop_name'],
                    nearest_train_station_distance=row['nearest_train_station_distance'],
                    nearest_bus_stop_distance=row['nearest_bus_stop_distance'],
                    orig_construction=row['orig-construction'],
                    age_in_years=int(row['age_in_years']),
                    predicted_price=int(row['predicted_price']),
                    ask_price=int(row['ask_price'])
                )
                records.append(house)

                if len(records) >= batch_size:
                    db.session.bulk_save_objects(records)
                    db.session.commit()
                    records = []

            if records:
                db.session.bulk_save_objects(records)
                db.session.commit()

            print("CSV data uploaded successfully!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python upload_mock_data.py <path_to_csv>")
    else:
        upload_csv(sys.argv[1])

