import pandas as pd
from geopy.distance import geodesic
from scipy.spatial import cKDTree
import numpy as np
import re

# Load data files
def initialize_data():
    data_path = 'C:\\Users\\rosh0\\cs\\HomeIQ\\backend\\data'
    postcodeToLatLong = pd.read_csv(f'{data_path}\\ukpostcodes.csv')
    schools_df = pd.read_csv(f'{data_path}\\2022-2023_england_school_information.csv', encoding='ISO-8859-1')
    shopsData = pd.read_csv(f'{data_path}\\geolytix_retailpoints_v33_202408.csv')
    transportData = pd.read_csv(f'{data_path}\\Stops.csv')
    return postcodeToLatLong, schools_df, shopsData, transportData

# Extract area code from postcode
def extract_area_code(postcode):
    match = re.match(r"^[A-Za-z]+", postcode)
    return match.group(0) if match else None
def enrich_long_lat(epc_df, postcodeToLatLong):
    return epc_df.merge(postcodeToLatLong, on='postcode', how='left')
def enrich_schools(epc_df, schools_df, postcodeToLatLong):
    # Helper functions
    def getOfstedRating(ofsted_rating):
        if ofsted_rating == 'Outstanding':
            return 4
        elif ofsted_rating == 'Good':
            return 3
        elif ofsted_rating == 'Requires Improvement':
            return 2
        elif ofsted_rating == 'Inadequate':
            return 1
        else:
            return 0

    def find_nearest_school(house_location, school):
        try:
            if school == 'primary':
                distance, index = primary_tree.query(house_location, k=1)
                nearest_school_distance = geodesic(house_location, primary_coords[index]).kilometers
                nearest_school_ofsted = getOfstedRating(primary_schools.iloc[index]['ofstedrating'])
                school_name = primary_schools.iloc[index]['schname']
            else:
                distance, index = secondary_tree.query(house_location, k=1)
                nearest_school_distance = geodesic(house_location, secondary_coords[index]).kilometers
                nearest_school_ofsted = getOfstedRating(secondary_schools.iloc[index]['ofstedrating'])
                school_name = secondary_schools.iloc[index]['schname']
                school_phase = 'Primary' if school == 'primary' else 'Secondary'
                #print(f"Nearest {school_phase} School: {school_name}, Distance: {nearest_school_distance} km, Ofsted Rating: {nearest_school_ofsted}")
            return nearest_school_distance, nearest_school_ofsted, school_name
        except Exception as e:
            print(f"Error finding nearest school: {e}")
            return np.nan, np.nan, None

    # Rename columns to lowercase
    schools_df.columns = schools_df.columns.str.lower()
    # Perform a left join based on the postcode column
    schoolsLatLong = schools_df.merge(postcodeToLatLong, on='postcode', how='left')
    schoolsLatLong = schoolsLatLong.dropna(subset=['latitude', 'longitude'])
    # Filter for primary and secondary schools
    primary_schools = schoolsLatLong[schoolsLatLong['isprimary'] == 1]
    secondary_schools = schoolsLatLong[schoolsLatLong['issecondary'] == 1]
    # Extract latitude and longitude as a numpy array
    primary_coords = primary_schools[['latitude', 'longitude']].to_numpy()
    secondary_coords = secondary_schools[['latitude', 'longitude']].to_numpy()
    # Build a KDTree with school coordinates
    primary_tree = cKDTree(primary_coords)
    secondary_tree = cKDTree(secondary_coords)
    # Enrich with school data
    try:
        epc_df['nearest_primary_school_distance'], epc_df['nearest_primary_school_ofsted_rating'], epc_df['primary_school_name'] = zip(
            *epc_df.apply(lambda row: find_nearest_school((row['latitude'], row['longitude']), 'primary'), axis=1)
        )
    except Exception as e:
        print(f"Error enriching primary school data: {e}")
    epc_df['nearest_secondary_school_distance'], epc_df['nearest_secondary_school_ofsted_rating'], epc_df['secondary_school_name'] = zip(
        *epc_df.apply(lambda row: find_nearest_school((row['latitude'], row['longitude']), 'secondary'), axis=1)
    )
    # Add columns to indicate if the Ofsted rating for the nearest primary and secondary schools is outstanding
    epc_df['nearest_primary_school_outstanding'] = epc_df['nearest_primary_school_ofsted_rating'] == 4
    epc_df['nearest_secondary_school_outstanding'] = epc_df['nearest_secondary_school_ofsted_rating'] == 4

    # Add column to indicate if both primary and secondary schools are outstanding
    epc_df['both_schools_outstanding'] = (epc_df['nearest_primary_school_outstanding'] & epc_df['nearest_secondary_school_outstanding']).astype(int)

    # Convert boolean columns to 1s and 0s
    epc_df['nearest_primary_school_outstanding'] = epc_df['nearest_primary_school_outstanding'].astype(int)
    epc_df['nearest_secondary_school_outstanding'] = epc_df['nearest_secondary_school_outstanding'].astype(int)

    #print(epc_df.to_string())
    return epc_df
def enrich_shops(epc_df, shopsData):
    #filter out small shops
    shopsData = shopsData[shopsData['size_band'] != '< 3,013 ft2 (280m2)']
    def find_nearest_shop(house_location):
        # Query the KDTree for the nearest school to the given house location
        distance, index = shops_tree.query(house_location, k=1)
        # Get the distance in kilometers (approximate, as KDTree uses Euclidean distance)
        nearest_shop_distance = geodesic(house_location, shopCoords[index]).kilometers
        nearest_shop_name = shopsData.iloc[index]['store_name']
        
        return nearest_shop_distance, nearest_shop_name
    # Extract latitude and longitude as a numpy array
    shopCoords = shopsData[['lat_wgs', 'long_wgs']].to_numpy()

    # Build a KDTree with shop coordinates
    shops_tree = cKDTree(shopCoords)
    epc_df['nearest_shop_distance'], epc_df['nearest_shop_name'] = zip(
        *epc_df.apply(lambda row: find_nearest_shop((row['latitude'], row['longitude'])), axis=1)
    )

    return epc_df
def enrich_trains(epc_df, transportData):
    def find_nearest_station(house_location):
        # Query the KDTree for the nearest school to the given house location
        distance, index = station_tree.query(house_location, k=1)
        # Get the distance in kilometers (approximate, as KDTree uses Euclidean distance)
        nearest_station_distance = geodesic(house_location, stationCoords[index]).kilometers
        return nearest_station_distance
    trainStations = transportData[transportData['StopType'] == 'RSE']
    # Drop rows with null latitude and longitude
    trainStations = trainStations.dropna(subset=['Latitude', 'Longitude'])
    # Extract latitude and longitude as a numpy array
    stationCoords = trainStations[['Latitude', 'Longitude']].to_numpy()
    # Build a KDTree with shop coordinates
    station_tree = cKDTree(stationCoords)
    epc_df['nearest_train_station_distance'] = epc_df.apply(
    lambda row: find_nearest_station((row['latitude'], row['longitude'])), axis=1
    )
    return epc_df
def enrich_buses(epc_df, transportData):
    def find_nearest_stop(house_location):
        # Query the KDTree for the nearest school to the given house location
        distance, index = stops_tree.query(house_location, k=1)
        # Get the distance in kilometers (approximate, as KDTree uses Euclidean distance)
        nearest_stop_distance = geodesic(house_location, stopCoords[index]).kilometers
        return nearest_stop_distance
    busStops = transportData[transportData['StopType'].str.startswith('B')]
    # Drop rows with null latitude and longitude
    busStops = busStops.dropna(subset=['Latitude', 'Longitude'])

    # Extract latitude and longitude as a numpy array
    stopCoords = busStops[['Latitude', 'Longitude']].to_numpy()

    # Build a KDTree with shop coordinates
    stops_tree = cKDTree(stopCoords)
    epc_df['nearest_bus_stop_distance'] = epc_df.apply(
    lambda row: find_nearest_stop((row['latitude'], row['longitude'])), axis=1
    )
    return epc_df
def enrich_house_type(epc_df):
    # Map specific built forms to simplified property types
    mapping = {
        'Mid-Terrace': 'T',
        'End-Terrace': 'T',
        'Enclosed End-Terrace': 'T',
        'Enclosed Mid-Terrace': 'T',
        'Semi-Detached': 'S',
        'Detached': 'D',
    }
    # Apply mapping, NAN values get mapped to F (this has been verified)
    epc_df['property_type'] = epc_df['built-form'].map(mapping).fillna('F')
    return epc_df
def enrich_age(epc_df):
    def convert_age_band_to_years(age_band):
        if pd.isna(age_band) or age_band == 'NO DATA!' or age_band == 'INVALID!':
            return np.nan
        elif isinstance(age_band, str) and '-' in age_band:
            years = re.findall(r'\d{4}', age_band)
            if len(years) == 2:
                start_year, end_year = map(int, years)
            else:
                return np.nan
            average_year = (start_year + end_year) / 2
        elif isinstance(age_band, str) and age_band.startswith('England and Wales: '):
            match = re.search(r'\d{4}', age_band)
            if match:
                year = int(match.group())
                average_year = year
            else:
                return np.nan
        else:
            try:
                average_year = int(age_band)
            except ValueError:
                return np.nan
        return 2023 - average_year
    epc_df['age_in_years'] = epc_df['construction-age-band'].apply(convert_age_band_to_years)
    return epc_df

# Main enrichment function
def enrich_data(epc_df):
    postcodeToLatLong, schools_df, shopsData, transportData = initialize_data()
    epc_df = enrich_long_lat(epc_df, postcodeToLatLong)
    epc_df = enrich_schools(epc_df, schools_df, postcodeToLatLong)
    epc_df = enrich_shops(epc_df, shopsData)
    epc_df = enrich_trains(epc_df, transportData)
    epc_df = enrich_buses(epc_df, transportData)
    epc_df = enrich_house_type(epc_df)
    epc_df = enrich_age(epc_df)
    return epc_df


# Example usage
if __name__ == '__main__':
    epc_df = pd.DataFrame({
        'postcode': ['RG316YP', 'SW1A1AA'],
        'latitude': [51.5074, 51.5033],
        'longitude': [-0.1278, -0.1195]
    })
    enriched = enrich_data(epc_df)
    print(enriched.head())
