import React, { useState } from "react";

const PricePredictor = ({ enrichedData }) => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const predictPrice = async () => {
    try {
      const response = await fetch("http://localhost:5000/predict-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enriched_data: enrichedData }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setPredictedPrice(result.predicted_price);
        setErrorMessage("");
      } else {
        setErrorMessage(result.message || "Failed to predict house price.");
        setPredictedPrice(null);
      }
    } catch (error) {
      console.error("Error predicting price:", error);
      setErrorMessage("An error occurred while predicting house price.");
      setPredictedPrice(null);
    }
  };

  return (
    <div>
      <h3>Predict House Price</h3>
      <button onClick={predictPrice}>Predict Price</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {predictedPrice && (
        <p style={{ color: "green" }}>
          Predicted Price: £{predictedPrice.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default PricePredictor;
