import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from sqlalchemy.exc import SQLAlchemyError
from models import House, db
from feasibility_model import get_feasibility

# Global variables to store models and data
# Standard models (no affordability filtering)
balanced_model = None
location_model = None
price_model = None

# Affordable models (with affordability filtering)
affordable_balanced_model = None
affordable_location_model = None
affordable_price_model = None

# Shared data
scaler = None
house_data = None
affordable_house_data = None
houses = None

# Feature weights for different prioritization options
WEIGHTS = {
    'balanced': np.array([1.0, 1.0, 1.0, 1.0]), 
    'location': np.array([2.0, 2.0, 0.5, 0.5]),  # Emphasize location
    'price':    np.array([0.5, 0.5, 2.0, 1.0])   # Emphasize price
}

def initialize_models():
    
    global balanced_model, location_model, price_model, scaler, house_data, houses
    
    try:
        # Query all houses from the database
        houses = House.query.all()
        if not houses:
            raise ValueError("No houses found in the database.")

        # Convert SQLAlchemy objects to dictionaries
        house_data = [
            {k.lower(): v for k, v in house.__dict__.items() if k != '_sa_instance_state'}
            for house in houses
        ]

        # Extract features
        features_list = []
        for house in house_data:
            lat = house['latitude']
            lon = house['longitude']
            price = house['predicted_price']
            floor_area = house['total_floor_area']
            features_list.append([lat, lon, price, floor_area])

        feature_matrix = np.array(features_list)

        # Standardize features
        scaler = StandardScaler()
        feature_matrix_scaled = scaler.fit_transform(feature_matrix)
        
        # Create base models with different priorities
        balanced_model = create_model(feature_matrix_scaled, 'balanced')
        location_model = create_model(feature_matrix_scaled, 'location')
        price_model = create_model(feature_matrix_scaled, 'price')

        print("All recommendation models initialized successfully")
        return True
        
    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error during model initialization: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error during model initialization: {str(e)}")

def create_model(feature_matrix, priority='balanced'):
    
    # Apply feature weighting
    weighted_features = feature_matrix * WEIGHTS[priority]
    
    # Create and fit model
    model = NearestNeighbors(n_neighbors=5, metric='euclidean')
    model.fit(weighted_features)
    
    return model

def build_affordable_model(financial_data, priority='balanced'):
   
    global affordable_house_data, houses
    
    try:
        # Filter houses based on affordability
        affordable_house_ids = []
        
        for house in houses:
            system_inputs = {
                "house_price": house.predicted_price,
                "loan_term_years": 30, 
                "interest_rate": 3.5,
                "property_tax": 200,
                "insurance": 100, 
                "utility_bills": 150, 
            }
            
            user_inputs = {
                "annual_income": int(financial_data.get("annual_income")),
                "debt_obligations": int(financial_data.get("debt_obligations")),
                "savings": int(financial_data.get("savings")),
                "is_first_home": bool(financial_data.get("is_first_home")),
            }
            
            feasibility = get_feasibility(system_inputs, user_inputs)
            if feasibility["is_affordable"]:
                affordable_house_ids.append(house.id)
        
        # Check if any houses are affordable
        if len(affordable_house_ids) == 0:
            print("No affordable houses found based on the provided financial data.")
            return None
        
        # Query affordable houses
        affordable_houses = House.query.filter(House.id.in_(affordable_house_ids)).all()
        
        # Convert to dictionaries
        affordable_house_data = [
            {k.lower(): v for k, v in house.__dict__.items() if k != '_sa_instance_state'}
            for house in affordable_houses
        ]
        
        # Extract features
        features_list = []
        for house in affordable_house_data:
            lat = house['latitude']
            lon = house['longitude']
            price = house['predicted_price']
            floor_area = house['total_floor_area']
            features_list.append([lat, lon, price, floor_area])
            
        affordable_feature_matrix = np.array(features_list)
        
        # Use the same scaler from the main model
        affordable_feature_matrix_scaled = scaler.transform(affordable_feature_matrix)
        
        # Create model with specified priority
        affordable_model = create_model(affordable_feature_matrix_scaled, priority)
        print(f"Affordable {priority} model built successfully")
        
        return affordable_model
        
    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error during affordable model creation: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error during affordable model creation: {str(e)}")

def get_similar_houses(request, k=5):
    
    global balanced_model, location_model, price_model
    global affordable_balanced_model, affordable_location_model, affordable_price_model
    global scaler, house_data, affordable_house_data
    
    # Initialize models if needed
    if balanced_model is None:
        success = initialize_models()
        if not success:
            return {'error': "Failed to initialize recommendation models."}
    
    try:
        # Extract request parameters
        target_house_features = request.get('houseAttributes')
        options = request.get('options')
        priority = options.get('priority', 'balanced') #default to balanced if not found
        only_affordable = options.get('affordableOnly', False)
        
        # Validate priority option
        if priority not in ['balanced', 'location', 'price']:
            priority = 'balanced' 
            
        # Extract target house features
        target_lat = target_house_features.get('latitude')
        target_lon = target_house_features.get('longitude')
        target_price = target_house_features.get('predicted_price', 
                                               target_house_features.get('price'))
        target_floor_area = target_house_features.get('total_floor_area')
        
        # Validate required features
        if target_lat is None or target_lon is None or target_price is None:
            raise ValueError("Target house must have 'latitude', 'longitude', and 'price' (or 'predicted_price').")
            
        # Prepare target features
        target_features = np.array([[target_lat, target_lon, target_price, target_floor_area]])
        target_features_scaled = scaler.transform(target_features)
        
        # Apply weighting based on priority
        weighted_target = target_features_scaled * WEIGHTS[priority]
        
        # Select appropriate model based on options
        if only_affordable:
            financial_data = request.get('financialData')
            if not financial_data:
                return {'error': "Financial data required for affordability filtering."}
                
            # Build or select appropriate affordable model
            if priority == 'balanced':
                if affordable_balanced_model is None:
                    affordable_balanced_model = build_affordable_model(financial_data, 'balanced')
                model = affordable_balanced_model
            elif priority == 'location':
                if affordable_location_model is None:
                    affordable_location_model = build_affordable_model(financial_data, 'location')
                model = affordable_location_model
            else:  # 'price'
                if affordable_price_model is None:
                    affordable_price_model = build_affordable_model(financial_data, 'price')
                model = affordable_price_model
                
            # Check if any affordable houses were found
            if model is None:
                return {'error': "No houses can be recommended. None of the houses are affordable based on your financial information."}
                
            # Find nearest neighbors
            distances, indices = model.kneighbors(weighted_target, n_neighbors=min(k, len(affordable_house_data)))
            
            # Retrieve recommended houses
            recommended_houses = [affordable_house_data[idx].copy() for idx in indices[0]]
        else:
            # Use standard non-affordable models
            if priority == 'balanced':
                model = balanced_model
            elif priority == 'location':
                model = location_model
            else:  
                model = price_model
                
            # Find nearest neighbors
            distances, indices = model.kneighbors(weighted_target, n_neighbors=k)
            
            # Retrieve recommended houses
            recommended_houses = [house_data[idx].copy() for idx in indices[0]]
            
        # Add distance metric to each recommendation
        for i, house in enumerate(recommended_houses):
            house['similarity_score'] = float(distances[0][i])
            
        return recommended_houses
        
    except ValueError as e:
        return {'error': str(e)}
    except Exception as e:
        return {'error': f"Unexpected error in recommendation service: {str(e)}"}