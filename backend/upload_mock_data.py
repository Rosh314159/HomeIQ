import pandas as pd
from app import app, db  
from models import House, School, Shop, db, TransportStop
import sys

DATA_PATH = 'C:\\Users\\rosh0\\cs\\HomeIQ\\backend\\data'

def upload_csv():
    file_path = f'{DATA_PATH}\\mock_data.csv'
    df = pd.read_csv(file_path, low_memory=False)
    try:
        df = pd.read_csv(file_path, low_memory=False)

        # Fill nan values
        for column in df.select_dtypes(include=['float64', 'int64']).columns:
            df[column] = df[column].fillna(0)

        for column in df.select_dtypes(include=['object']).columns:
            df[column] = df[column].fillna("")

        batch_size = 500  
        records = []

        with app.app_context():
            for _, row in df.iterrows():
                house = House(
                    price=int(row['true_price']),
                    date_of_transfer=row['date_of_transfer'],
                    postcode=row['postcode'],
                    property_type=row['property_type'],
                    new_build=row['new_build'],
                    duration=row['duration'],
                    paon=row['paon'],
                    saon=row['saon'],
                    street=row['street'],
                    town_city=row['town_city'],
                    full_address=row['fulladdress'],
                    address1=row['address1'],
                    address2=row['address2'],
                    address3=row['address3'],
                    current_energy_rating=row['current_energy_rating'],
                    potential_energy_rating=row['potential_energy_rating'],
                    current_energy_efficiency=row['current_energy_efficiency'],
                    potential_energy_efficiency=row['potential_energy_efficiency'],
                    built_form=row['built_form'],
                    inspection_date=row['inspection_date'],
                    local_authority=row['local_authority'],
                    constituency=row['constituency'],
                    lodgement_date=row['lodgement_date'],
                    transaction_type=row['transaction_type'],
                    environment_impact_current=row['environment_impact_current'],
                    environment_impact_potential=row['environment_impact_potential'],
                    energy_consumption_current=row['energy_consumption_current'],
                    energy_consumption_potential=row['energy_consumption_potential'],
                    co2_emissions_current=row['co2_emissions_current'],
                    co2_emiss_curr_per_floor_area=row['co2_emiss_curr_per_floor_area'],
                    co2_emissions_potential=row['co2_emissions_potential'],
                    lighting_cost_current=row['lighting_cost_current'],
                    lighting_cost_potential=row['lighting_cost_potential'],
                    heating_cost_current=row['heating_cost_current'],
                    heating_cost_potential=row['heating_cost_potential'],
                    hot_water_cost_current=row['hot_water_cost_current'],
                    hot_water_cost_potential=row['hot_water_cost_potential'],
                    total_floor_area=row['total_floor_area'],
                    energy_tariff=row['energy_tariff'],
                    mains_gas_flag=row['mains_gas_flag'],
                    floor_level=row['floor_level'],
                    flat_top_storey=row['flat_top_storey'],
                    flat_storey_count=int(row['flat_storey_count']),
                    main_heating_controls=row['main_heating_controls'],
                    multi_glaze_proportion=row['multi_glaze_proportion'],
                    glazed_type=row['glazed_type'],
                    glazed_area=row['glazed_area'],
                    extension_count=int(row['extension_count']),
                    number_habitable_rooms=int(row['number_habitable_rooms']),
                    number_heated_rooms=int(row['number_heated_rooms']),
                    low_energy_lighting=row['low_energy_lighting'],
                    number_open_fireplaces=int(row['number_open_fireplaces']),
                    hotwater_description=row['hotwater_description'],
                    hot_water_energy_eff=row['hot_water_energy_eff'],
                    hot_water_env_eff=row['hot_water_env_eff'],
                    floor_energy_eff=row['floor_energy_eff'],
                    floor_env_eff=row['floor_env_eff'],
                    windows_energy_eff=row['windows_energy_eff'],
                    windows_env_eff=row['windows_env_eff'],
                    walls_energy_eff=row['walls_energy_eff'],
                    walls_env_eff=row['walls_env_eff'],
                    sheating_energy_eff=row['sheating_energy_eff'],
                    sheating_env_eff=row['sheating_env_eff'],
                    lighting_description=row['lighting_description'],
                    lighting_energy_eff=row['lighting_energy_eff'],
                    lighting_env_eff=row['lighting_env_eff'],
                    main_fuel=row['main_fuel'],
                    wind_turbine_count=int(row['wind_turbine_count']),
                    heat_loss_corridor=row['heat_loss_corridor'],
                    unheated_corridor_length=row['unheated_corridor_length'],
                    floor_height=row['floor_height'],
                    solar_water_heating_flag=row['solar_water_heating_flag'],
                    mechanical_ventilation=row['mechanical_ventilation'],
                    address=row['address'],
                    local_authority_label=row['local_authority_label'],
                    constituency_label=row['constituency_label'],
                    posttown=row['posttown'],
                    construction_age_band=row['construction_age_band'],
                    lodgement_datetime=row['lodgement_datetime'],
                    tenure=row['tenure'],
                    fixed_lighting_outlets_count=int(row['fixed_lighting_outlets_count']),
                    low_energy_fixed_light_count=int(row['low_energy_fixed_light_count']),
                    latitude=row['latitude'],
                    longitude=row['longitude'],
                    nearest_primary_school_distance=row['nearest_primary_school_distance'],
                    nearest_primary_school_ofsted_rating=int(row['nearest_primary_school_ofsted_rating']),
                    primary_school_name=row['primary_school_name'],
                    nearest_secondary_school_distance=row['nearest_secondary_school_distance'],
                    nearest_secondary_school_ofsted_rating=int(row['nearest_secondary_school_ofsted_rating']),
                    secondary_school_name=row['secondary_school_name'],
                    nearest_primary_school_outstanding=bool(row['nearest_primary_school_outstanding']),
                    nearest_secondary_school_outstanding=bool(row['nearest_secondary_school_outstanding']),
                    both_schools_outstanding=bool(row['both_schools_outstanding']),
                    nearest_shop_distance=row['nearest_shop_distance'],
                    nearest_shop_name=row['nearest_shop_name'],
                    nearest_train_station_distance=row['nearest_train_station_distance'],
                    nearest_bus_stop_distance=row['nearest_bus_stop_distance'],
                    orig_construction=row['orig-construction'],
                    age_in_years=int(row['age_in_years']),
                    local_avg_price=int(row['local_avg_price']),
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

            print("CSV data uploaded successfully")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
  
    with app.app_context():
        db.session.execute(db.text('DROP TABLE house'))
        db.session.commit()
        House.__table__.create(db.engine)
        db.session.commit()
        print("clearing all mock data from the database")
        db.session.query(House).delete()
        db.session.commit()
        print("mock data cleared.")
        upload_csv()
        ("mock data added")
        print(f"Number of houses in database: {House.query.count()}")