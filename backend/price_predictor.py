import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from joblib import load  # To load your saved model
import shap
import time

DATA_PATH = 'C:\\Users\\rosh0\\cs\\HomeIQ\\backend\\data'

# Global variables
model_artifacts = None 

def initialise():
# Load the saved model artifacts
    global model_artifacts
    start_time = time.time()
    
    model_artifacts = load(f'{DATA_PATH}\\house_price_model_artifacts.joblib')
   
    load_time = time.time() - start_time
    print(f"Models artifacts loaded in {load_time:.2f} seconds")

def predict_house_price(data):
   
    if model_artifacts is None:
        initialise()

    start_time = time.time()

    try:
        # Extract components from model artifacts
        model = model_artifacts['model']
        label_encoders = model_artifacts['label_encoders']
        feature_columns = model_artifacts['feature_columns']
        kdtree = model_artifacts['kdtree']
        train_prices = model_artifacts['train_prices']
        shap_explainer = model_artifacts['shap_explainer']
        
        # Create input dataframe
        input_df = pd.DataFrame(data)

        # calculate local average price using KDTree
        if 'latitude' in input_df.columns and 'longitude' in input_df.columns:
            input_coords = input_df[['latitude', 'longitude']].astype(float).to_numpy()
            _, indices = kdtree.query(input_coords, k=50) 
            local_avg = np.array([train_prices[idx].mean() for idx in indices])
            input_df['local_avg_price'] = local_avg[0] 

        #get relevant columns
        input_df = input_df[feature_columns]

        # Initialize missing columns with NaN
        for col in feature_columns:
            if col not in input_df.columns and col != 'local_avg_price':
                input_df[col] = np.nan
        #Handle categorical features with label encoding
        for col, encoder in label_encoders.items():
            if col in input_df.columns:
                # Fill missing values
                input_df[col] = input_df[col].fillna('Unknown')
                
                # Handle unseen categories
                for cat in input_df[col].unique():
                    if cat not in encoder.classes_:
                        input_df.loc[input_df[col] == cat, col] = 'Unknown'
                
                # Apply encoding
                input_df[col] = encoder.transform(input_df[col])
        
        # Convert numeric columns that may have been imported as objects
        numeric_columns = ['total_floor_area', 'multi_glaze_proportion', 'number_open_fireplaces']
        for col in numeric_columns:
            if col in input_df.columns and input_df[col].dtype == 'object':
                # Replace any non-numeric values with NaN, then convert to float
                input_df[col] = pd.to_numeric(input_df[col], errors='coerce')
                # Fill NaN values with 0 or another appropriate value
                input_df[col] = input_df[col].fillna(0)

        # Reordering input features to match training data
        input_df = input_df[model_artifacts['feature_columns']]
        print(model_artifacts['feature_columns'])
        # Get prediction
        predicted_price = model_artifacts['model'].predict(input_df)[0]

        # Get SHAP values (ensures aligned with model's expected features)
        shap_values = model_artifacts['shap_explainer'](input_df)
        explainer = shap.Explainer(model_artifacts['model'])
        shap_values = explainer(input_df)
        # Processing SHAP values
        feature_importance = {}
        for i, feature in enumerate(model_artifacts['feature_columns']):
            feature_importance[feature] = float(shap_values.values[0][i])
        
        # Keep raw feature values
        feature_values = input_df.iloc[0].to_dict()

        # Predict
        predicted_price = model.predict(input_df)[0]

        # SHAP explanation
        shap_values = shap_explainer(input_df)
        print(feature_values)

        local_avg_price = input_df['local_avg_price']
    except Exception:
        # Catch anything and raise a uniform error
        raise Exception("Prediction on this house could not occur")

    finally:
        duration = time.time() - start_time
        print(f"Prediction completed in {duration:.2f} seconds")

    return float(predicted_price), float(shap_explainer.expected_value), feature_values, feature_importance, local_avg_price.item()

