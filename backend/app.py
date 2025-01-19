from flask import Flask, request, jsonify
from flask_cors import CORS
from joblib import load
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

model = load('house_price_model.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    #address = data.get('address')

    # Fetch EPC data (replace with actual API)
    #epc_data = requests.get(f"<EPC_API_URL>?address={address}").json()

    # # Extract features for prediction
    # features = [
    #     epc_data['feature1'],  # Replace with actual fields
    #     epc_data['feature2'],  
    # ]
    # prediction = model.predict([features])
    return jsonify({'predicted_price': 10000})

if __name__ == '__main__':
    app.run(debug=True)