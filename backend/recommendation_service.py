import numpy as np
import pandas as pd
from math import radians, degrees, sin, cos, atan2
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from sqlalchemy.exc import SQLAlchemyError
from models import House, db
from feasibility_model import get_feasibility
# Define the centre of England (adjust these coordinates as needed)
CENTRE_LAT = 52.561033
CENTRE_LON = -1.471875

def compute_polar_coordinates(lat, lon, centre_lat=CENTRE_LAT, centre_lon=CENTRE_LON):
    """
    Computes the Haversine distance (in km) and bearing (in degrees) from a given point (lat, lon)
    to the centre of England.
    """
    R = 6371  # Earth's radius in km

    # Convert latitudes/longitudes from degrees to radians
    lat1, lon1 = radians(centre_lat), radians(centre_lon)
    lat2, lon2 = radians(lat), radians(lon)

    # Haversine distance calculation
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    distance = R * c

    # Bearing calculation
    y = sin(lon2 - lon1) * cos(lat2)
    x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(lon2 - lon1)
    bearing = degrees(atan2(y, x))
    bearing = (bearing + 360) % 360  # Normalize to 0-360 degrees

    return distance, bearing

# Global variables to store the preprocessed data and k-NN model
nn_model = None
affordable_nn_model = None
scaler = None
house_data = None  # Original house data as a list of dictionaries
affordable_house_data = None
feature_matrix = None  # Array of computed features for each house
houses = None
def load_model(onlyAffordable = False):
    """
    Loads house data from the database, computes features for each house based on:
      - Distance from the centre of England,
      - Sine and cosine of the bearing (from the centre), and
      - Price,
    then scales these features and fits a k-NN model.
    This function should be run only once (or when the data changes).
    """
    global nn_model, scaler, house_data, feature_matrix, houses

    try:
        # Query houses from the database
        houses = House.query.all()
        if not houses:
            raise ValueError("No houses found in the database.")

        # Convert each SQLAlchemy object to a dictionary (removing metadata)
        house_data = [
            {k.lower(): v for k, v in house.__dict__.items() if k != '_sa_instance_state'}
            for house in houses
        ]

        # Compute features for each house: [distance, sin(bearing), cos(bearing), price]
        features_list = []
        for house in house_data:
            lat = house['latitude']
            lon = house['longitude']
            price = house['predicted_price']
            floor_area = house['total_floor_area']
            distance, bearing = compute_polar_coordinates(lat, lon)
            bearing_rad = np.radians(bearing)
            sin_bearing = sin(bearing_rad)
            cos_bearing = cos(bearing_rad)
            features_list.append([distance, sin_bearing, cos_bearing, price, floor_area])

        feature_matrix = np.array(features_list)

        # Standardize the features so that each contributes comparably
        scaler = StandardScaler()
        feature_matrix_scaled = scaler.fit_transform(feature_matrix)

        # Fit a Nearest Neighbors model (using Euclidean distance in the scaled feature space)
        nn_model = NearestNeighbors(n_neighbors=5, metric='euclidean')
        nn_model.fit(feature_matrix_scaled)

        print("✅ k-NN model (using polar coordinates and price) loaded successfully!")

    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {str(e)}")
    
def load_only_affordable_model(financialData):
    """
    Loads house data from the database, computes features for each house based on:
      - Distance from the centre of England,
      - Sine and cosine of the bearing (from the centre), and
      - Price,
    then scales these features and fits a k-NN model.
    This function should be run only once (or when the data changes).
    """
    global affordable_nn_model, affordable_house_data, houses

    try:
        affordable_house_ids = []
        query = House.query
        for house in houses:
            system_inputs = {
                "house_price": house.predicted_price,
                "loan_term_years": 30,  # Default loan term
                "interest_rate": 3.5,  # Default interest rate
                "property_tax": 200,  # Estimated tax
                "insurance": 100,  # Estimated insurance
                "utility_bills": 150,  # Estimated bills
            }
            user_inputs = {
                "annual_income" : int(financialData.get("annual_income")),
                "debt_obligations" : int(financialData.get("debt_obligations")),
                "savings" : int(financialData.get("savings")),
                "is_first_home": bool(financialData.get("is_first_home")),
            }
            feasibility = get_feasibility(system_inputs, user_inputs)
            if feasibility["is_affordable"]:
                affordable_house_ids.append(house.id)
        #Check if any affordable houses
        if len(affordable_house_ids) == 0:
            print("No affordable houses found based on the provided financial data.")
            affordable_house_data = []  # Set to empty list for proper checking later
            return False  # Return False to indicate no affordable houses
        query = query.filter(House.id.in_(affordable_house_ids))
        if not houses:
            raise ValueError("No houses found in the database.")
        affordable_houses = query.all()

        # Convert each SQLAlchemy object to a dictionary (removing metadata)
        affordable_house_data = [
            {k.lower(): v for k, v in house.__dict__.items() if k != '_sa_instance_state'}
            for house in affordable_houses
        ]

        # Compute features for each house: [distance, sin(bearing), cos(bearing), price]
        features_list = []
        for house in affordable_house_data:
            lat = house['latitude']
            lon = house['longitude']
            price = house['predicted_price']  
            floor_area = house['total_floor_area']
            distance, bearing = compute_polar_coordinates(lat, lon)
            bearing_rad = np.radians(bearing)
            sin_bearing = sin(bearing_rad)
            cos_bearing = cos(bearing_rad)
            features_list.append([distance, sin_bearing, cos_bearing, price, floor_area])

        feature_matrix = np.array(features_list)

        # Standardize the features so that each contributes comparably
        scaler = StandardScaler()
        feature_matrix_scaled = scaler.fit_transform(feature_matrix)

        # Fit a Nearest Neighbors model (using Euclidean distance in the scaled feature space)
        affordable_nn_model = NearestNeighbors(n_neighbors=5, metric='euclidean')
        affordable_nn_model.fit(feature_matrix_scaled)

        print("✅ Affordable k-NN model (using polar coordinates and price) loaded successfully!")
        return True

    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error: {str(e)}")

def get_similar_houses(request, k=5):
    """
    Given a target house with at least 'latitude', 'longitude', and 'price' (or 'predicted_price'),
    this function computes its features (distance, sin(bearing), cos(bearing), price), scales them,
    and then uses the preloaded k-NN model to find the top k most similar houses.
    Returns all house features for the top k houses.
    """
    global nn_model, scaler, house_data, feature_matrix
    if nn_model is None or scaler is None or house_data is None or feature_matrix is None:
        load_model()
    try:
        target_house_features = request.get('houseAttributes')
        options = request.get('options')
        only_affordable = options.get('affordableOnly', False)
        target_lat = target_house_features.get('latitude')
        target_lon = target_house_features.get('longitude')
        target_floor_area = target_house_features.get('total_floor_area')
        # Support either 'price' or 'predicted_price'
        target_price = target_house_features.get('predicted_price', target_house_features.get('price'))
        if target_lat is None or target_lon is None or target_price is None:
            raise ValueError("Target house must have 'latitude', 'longitude', and 'price' (or 'predicted_price').")

        # Compute target house features: [distance, sin(bearing), cos(bearing), price]
        distance, bearing = compute_polar_coordinates(target_lat, target_lon)
        bearing_rad = np.radians(bearing)
        sin_bearing = sin(bearing_rad)
        cos_bearing = cos(bearing_rad)
        target_features = np.array([[distance, sin_bearing, cos_bearing, target_price, target_floor_area]])

        # Scale the target features using the previously fitted scaler
        target_features_scaled = scaler.transform(target_features)
        if (only_affordable):
            loaded = load_only_affordable_model(request.get('financialData'))
            if loaded:
                distances, indices = affordable_nn_model.kneighbors(target_features_scaled, n_neighbors=k)
            else:
                return {
                    'error': "No houses can be recommended. None of the houses are affordable based on your financial information."
                }
        else:
            # Query the k-NN model for the top k nearest neighbors
            distances, indices = nn_model.kneighbors(target_features_scaled, n_neighbors=k)

        # Retrieve and return the corresponding house data
        recommended_houses = []
        for i, idx in enumerate(indices[0]):
            if (only_affordable):
                house = affordable_house_data[idx].copy()
            else:
                house = house_data[idx].copy()  # Copy the house data dictionary
            # Optionally add computed features for reference:
            house['distance_from_centre_km'] = feature_matrix[idx, 0]
            house['geo_similarity'] = distances[0][i]  # Scaled Euclidean distance in feature space
            
            # Calculate percentage difference between asking price and predicted price
            if 'predicted_price' in house and 'ask_price' in house and house['ask_price'] > 0:
                house['price_difference_percent'] = abs((house['ask_price'] - house['predicted_price']) / house['ask_price'] * 100)
            else:
                house['price_difference_percent'] = float('inf')  # Handle missing data or zero asking price
                
            recommended_houses.append(house)

        # Sort recommended houses by price difference percentage (smaller values first)
        recommended_houses.sort(key=lambda x: x.get('price_difference_percent', float('inf')))

        return recommended_houses

    except Exception as e:
        return {'error': f"Unexpected error: {str(e)}"}
