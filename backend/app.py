import json
from flask import Flask, request, jsonify
from epc_service import get_latest_epc
from flask_cors import CORS
from data_enricher import enrich_data
import pandas as pd

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

@app.route('/fetch-and-enrich', methods=['POST'])
def fetch_epc():
    try:
        # Parse request data
        data = request.json
        postcode = data.get('postcode')
        house_number_or_name = data.get('house_number_or_name')
        # Log the postcode and house number
        print(f"Postcode: {postcode}, House Number/Name: {house_number_or_name}")
        # Validate input
        if not postcode or not house_number_or_name:
            return jsonify({"error": "Postcode and house number/name are required"}), 400

        # Fetch EPC data
        epc_data = get_latest_epc(postcode, house_number_or_name)
        epc_data = enrich_data(epc_data)

        if epc_data.empty:
            return jsonify({"error": "No EPC certificate found for the given address"}), 404

        # Convert DataFrame to dictionary
        epc_dict = epc_data.to_dict(orient='records')[0]
        obj = jsonify({"enriched_data": epc_dict})
        return obj, 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
from price_predictor import predict_house_price 

# Endpoint to predict house price
@app.route('/predict-price', methods=['POST'])
def predict_price():
    try:
        # Parse the enriched data from the request
        enriched_data = request.json.get('enriched_data')
        if not enriched_data:
            return jsonify({'status': 'error', 'message': 'Enriched data is required'}), 400

        # Convert to a DataFrame
        enriched_df = pd.DataFrame([enriched_data])

        # Predict the house price
        predicted_price = predict_house_price(enriched_df)

        # Return the predicted price
        response = {
            'status': 'success',
            'predicted_price': predicted_price
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
