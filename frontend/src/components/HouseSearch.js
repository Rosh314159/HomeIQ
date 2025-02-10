import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./HouseSearch.css";

const HouseSearch = () => {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [predictedPrice, setPredictedPrice] = useState(null);
  const navigate = useNavigate();

  // Function to fetch addresses from Postcode.io
  const fetchAddresses = async () => {
    if (!postcode) {
      setErrorMessage("Please enter a valid postcode.");
      return;
    }

    setErrorMessage("");
    setAddresses([]);
    setLoading(true);

    try {
      const key = process.env.REACT_APP_POSTCODE_API
      console.log(key)
      const response = await axios.get(
        `https://api.getAddress.io/autocomplete/${postcode}?api-key=${key}`
        
      );
      const filteredAddresses = response.data.suggestions.map(suggestion => suggestion.address);
      setAddresses(filteredAddresses || []);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Could not fetch addresses. Please check the postcode.");
      setLoading(false);
    }
  };

  // Function to fetch enriched data
  const fetchEnrichedData = async () => {
    if (!postcode || !selectedAddress) {
      setErrorMessage("Please select a valid address.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Extract house number/name from the selected address
      const houseNumber = selectedAddress.split(",")[0];

      // Step 1: Fetch enriched data
      const enrichResponse = await axios.post("http://localhost:5000/fetch-and-enrich", {
        postcode,
        house_number_or_name: houseNumber,
      });

      if (enrichResponse.status === 200) {
        const enrichedData = enrichResponse.data.enriched_data;

        // Step 2: Predict house price using enriched data
        try {
          const predictResponse = await fetch("http://localhost:5000/predict-price", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enriched_data: enrichedData }),
          });

          const result = await predictResponse.json();
          if (result.status === "success") {
            enrichedData.predicted_price = result.predicted_price;
            // Store data in localStorage
            localStorage.setItem("houseData", JSON.stringify(enrichedData));
            // Navigate to the details page with enriched data and predicted price
            setLoading(false);
            navigate("/details", { state: { enrichedData } });
          } else {
            throw new Error(result.message || "Failed to predict house price.");
          }
        } catch (predictError) {
          console.error("Error predicting house price:", predictError);
          setErrorMessage("An error occurred while predicting house price.");
          setLoading(false);
        }
      } else {
        throw new Error(enrichResponse.statusText || "Failed to fetch enriched data.");
      }
    } catch (enrichError) {
      console.error("Error fetching enriched data:", enrichError);
      setErrorMessage("An error occurred while fetching enriched data.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <h1 className="text-xl font-bold mb-4 text-gray-800">
        Search for House Information
      </h1>

      {/* Postcode Input */}
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Postcode
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter postcode (e.g., RG31 6YP)"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
          <button
            onClick={fetchAddresses}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 shadow-md"
            disabled={loading}
          >
            {loading ? "Loading..." : "Find"}
          </button>
        </div>

        {errorMessage && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}

        {/* Address Dropdown */}
        {addresses.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select an Address
            </label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
            >
              <option value="">Select an address</option>
              {addresses.map((address, index) => (
                <option key={index} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Button */}
        {selectedAddress && (
          <button
            onClick={fetchEnrichedData}
            className="mt-4 w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Search"}
          </button>
        )}

        {/* Predicted Price */}
        {predictedPrice && (
          <p className="mt-4 text-green-700 font-bold">
            Predicted Price: £22{predictedPrice.toLocaleString()}
          </p>
        )}

        
      </div>
    </div>
  );
};

export default HouseSearch;


