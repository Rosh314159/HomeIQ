import pandas as pd
from geopy.distance import geodesic
from scipy.spatial import cKDTree
import numpy as np
import re
from joblib import load
from models import School, Shop, TransportStop, db

# Global variables to store preloaded data
initialised = False
primary_tree = None
secondary_tree = None
shops_tree = None
station_tree = None
stops_tree = None
primary_coords = None
secondary_coords = None
shopCoords = None
stationCoords = None
stopCoords = None
primary_schools = None
secondary_schools = None
shopsData = None
train_stations = None
bus_stops = None

# Initialize and preload data

def initialize_data():
    global postcodeToLatLong, schools_df, shopsData, transportData
    global primary_tree, secondary_tree, shops_tree, station_tree, stops_tree
    global primary_schools, secondary_schools, primary_coords, secondary_coords, shopCoords, stationCoords, stopCoords
    global initialised
    #Skip initalisation if already done
    if initialised:
        return 
    print("Loading data from database")

    # Load schools from database
    all_schools = pd.read_sql('SELECT * FROM school', db.engine)
    primary_schools = all_schools[all_schools['is_primary'] == True]
    secondary_schools = all_schools[all_schools['is_secondary'] == True]
    primary_coords = primary_schools[['latitude', 'longitude']].to_numpy()
    secondary_coords = secondary_schools[['latitude', 'longitude']].to_numpy()

    # Load shops from database
    shopsData = pd.read_sql('SELECT * FROM shop', db.engine)
    shopCoords = shopsData[['latitude', 'longitude']].to_numpy()

    # Load transport stops from database
    transport_stops = pd.read_sql('SELECT * FROM transport_stop', db.engine)
    train_stations = transport_stops[transport_stops['stop_type'] == 'RSE']
    stationCoords = train_stations[['latitude', 'longitude']].to_numpy()
    bus_stops = transport_stops[transport_stops['stop_type'].str.startswith('B')]
    stopCoords = bus_stops[['latitude', 'longitude']].to_numpy()

    # Build KDTrees for spatial querying
    primary_tree = cKDTree(primary_coords)
    secondary_tree = cKDTree(secondary_coords)
    shops_tree = cKDTree(shopCoords)
    station_tree = cKDTree(stationCoords)
    stops_tree = cKDTree(stopCoords)
    
    initialised = True
    print("Finished loading data from database")

# Utility functions

def extract_area_code(postcode):
    match = re.match(r"^[A-Za-z]+", postcode)
    return match.group(0) if match else None

def enrich_schools(epc_df):
    def getOfstedRating(ofsted_rating):
        return {
            'Outstanding': 4,
            'Good': 3,
            'Requires Improvement': 2,
            'Inadequate': 1
        }.get(ofsted_rating, 0)

    def find_nearest_school(house_location, school):
        try:
            if school == 'primary':
                distance, index = primary_tree.query(house_location, k=1)
                nearest_school_distance = geodesic(house_location, primary_coords[index]).kilometers
                nearest_school_ofsted = getOfstedRating(primary_schools.iloc[index]['ofsted_rating'])
                school_name = primary_schools.iloc[index]['name']
            else:
                distance, index = secondary_tree.query(house_location, k=1)
                nearest_school_distance = geodesic(house_location, secondary_coords[index]).kilometers
                nearest_school_ofsted = getOfstedRating(secondary_schools.iloc[index]['ofsted_rating'])
                school_name = secondary_schools.iloc[index]['name']
            return nearest_school_distance, nearest_school_ofsted, school_name
        except Exception as e:
            return np.nan, np.nan, None

    epc_df['nearest_primary_school_distance'], epc_df['nearest_primary_school_ofsted_rating'], epc_df['primary_school_name'] = zip(
        *epc_df.apply(lambda row: find_nearest_school((row['latitude'], row['longitude']), 'primary'), axis=1))
    epc_df['nearest_secondary_school_distance'], epc_df['nearest_secondary_school_ofsted_rating'], epc_df['secondary_school_name'] = zip(
        *epc_df.apply(lambda row: find_nearest_school((row['latitude'], row['longitude']), 'secondary'), axis=1))
     # Add columns to indicate if the Ofsted rating for the nearest primary and secondary schools is outstanding
    epc_df['nearest_primary_school_outstanding'] = epc_df['nearest_primary_school_ofsted_rating'] == 4
    epc_df['nearest_secondary_school_outstanding'] = epc_df['nearest_secondary_school_ofsted_rating'] == 4

    # Add column to indicate if both primary and secondary schools are outstanding
    epc_df['both_schools_outstanding'] = (epc_df['nearest_primary_school_outstanding'] & epc_df['nearest_secondary_school_outstanding']).astype(int)

    # Convert boolean columns to 1s and 0s
    epc_df['nearest_primary_school_outstanding'] = epc_df['nearest_primary_school_outstanding'].astype(int)
    epc_df['nearest_secondary_school_outstanding'] = epc_df['nearest_secondary_school_outstanding'].astype(int)

    return epc_df

def enrich_shops(epc_df):
    def find_nearest_shop(house_location):
        distance, index = shops_tree.query(house_location, k=1)
        nearest_shop_distance = geodesic(house_location, shopCoords[index]).kilometers
        nearest_shop_name = shopsData.iloc[index]['store_name']
        return nearest_shop_distance, nearest_shop_name

    epc_df['nearest_shop_distance'], epc_df['nearest_shop_name'] = zip(
        *epc_df.apply(lambda row: find_nearest_shop((row['latitude'], row['longitude'])), axis=1))
    return epc_df

def enrich_trains(epc_df):
    def find_nearest_station(house_location):
        distance, index = station_tree.query(house_location, k=1)
        return geodesic(house_location, stationCoords[index]).kilometers

    epc_df['nearest_train_station_distance'] = epc_df.apply(
        lambda row: find_nearest_station((row['latitude'], row['longitude'])), axis=1)
    return epc_df

def enrich_buses(epc_df):
    def find_nearest_stop(house_location):
        distance, index = stops_tree.query(house_location, k=1)
        return geodesic(house_location, stopCoords[index]).kilometers

    epc_df['nearest_bus_stop_distance'] = epc_df.apply(
        lambda row: find_nearest_stop((row['latitude'], row['longitude'])), axis=1)
    return epc_df

def enrich_house_type(epc_df):
    mapping = {
        'Mid-Terrace': 'T',
        'End-Terrace': 'T',
        'Enclosed End-Terrace': 'T',
        'Enclosed Mid-Terrace': 'T',
        'Semi-Detached': 'S',
        'Detached': 'D',
    }
    epc_df['property_type'] = epc_df['built-form'].map(mapping).fillna('F')
    return epc_df

def enrich_age(epc_df):
    def convert_age_band_to_years(age_band):
        if pd.isna(age_band) or age_band == 'NO DATA!' or age_band == 'INVALID!':
            return 50
        elif '-' in age_band:
            years = re.findall(r'\d{4}', age_band)
            if len(years) == 2:
                start_year, end_year = map(int, years)
                return 2023 - ((start_year + end_year) / 2)
        elif 'England and Wales' in age_band:
            match = re.search(r'\d{4}', age_band)
            return 2023 - int(match.group()) if match else np.nan
        return np.nan

    epc_df['age_in_years'] = epc_df['construction-age-band'].apply(convert_age_band_to_years)
    epc_df.columns = epc_df.columns.str.replace('-', '_')
    return epc_df

def enrich_data(epc_df):
    initialize_data()
    epc_df = enrich_schools(epc_df)
    epc_df = enrich_shops(epc_df)
    epc_df = enrich_trains(epc_df)
    epc_df = enrich_buses(epc_df)
    epc_df = enrich_house_type(epc_df)
    epc_df = enrich_age(epc_df)
    return epc_df

if __name__ == '__main__':
    epc_df = pd.DataFrame({
        'postcode': ['RG316YP', 'SW1A1AA'],
        'latitude': [51.5074, 51.5033],
        'longitude': [-0.1278, -0.1195]
    })
    enriched = enrich_data(epc_df)
    print(enriched.head())