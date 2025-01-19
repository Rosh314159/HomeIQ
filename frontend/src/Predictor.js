import React, { useState } from 'react';
import axios from 'axios';

const Predictor = () => {
    const [address, setAddress] = useState('');
    const [predictedPrice, setPredictedPrice] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5000/predict/', { address });
            setPredictedPrice(response.data.predicted_price);
        } catch (error) {
            console.error('Error fetching prediction:', error);
        }
    };

    return (
        <div>
            <h1>House Price Predictor</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter Address:
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Predict Price</button>
            </form>
            {predictedPrice !== null && (
                <div>
                    <h2>Predicted Price: £{predictedPrice.toFixed(2)}</h2>
                </div>
            )}
        </div>
    );
};

export default Predictor;
