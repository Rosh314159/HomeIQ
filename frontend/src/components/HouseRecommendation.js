import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HouseRecommendations = ({ houseAttributes }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
    const handleTileClick = (house) => {
      navigate("/details", { state: { enrichedData: house } });
    };
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.post("http://localhost:5000/recommendations", houseAttributes);
        setRecommendations(response.data.recommendations);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recommended houses.");
      } finally {
        setLoading(false);
      }
    };
    if (houseAttributes) {
        console.log("Fetching")
        fetchRecommendations();
    }
  }, [houseAttributes]);
  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (recommendations.length === 0) return <p>No similar houses found.</p>;
  const getPropertyTypeFull = (propertyType) => {
    switch (propertyType) {
      case "D":
        return "Detached";
      case "S":
        return "Semi-Detached";
      case "T":
        return "Terraced";
      case "F":
        return "Flat";
      case "B":
        return "Bungalow";
      default:
        return "Unknown";
    }
  };

//   const getStreetViewImageUrl = (address, postcode) => {
//     const apiKey = '';  // Replace with your actual API key
//     const formattedAddress = encodeURIComponent(`${address}, ${postcode}`);
//     return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${formattedAddress}&key=${apiKey}`;
//   };
return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Recommended Houses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((house, index) => (
                <div key={index} className="p-4 border rounded-lg shadow"
                onClick={() => handleTileClick(house)}
                >
                    {/* Street View Image */}
                    {/* <img
                    src={getStreetViewImageUrl(`${house.paon} ${house.street}`, house.postcode)}
                    alt="House Street View"
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    /> */}
                    {/* House Details */}
                    <p><strong>Asking dfdPrice:</strong> £{house.price}</p>
                    <p><strong>Predicted Price:</strong> £{house.predicted_price}</p>
                    <p><strong>Property Type:</strong> {getPropertyTypeFull(house.property_type)}</p>
                    <p><strong>Postcode:</strong> {house.postcode}</p>
                    <p><strong>Address:</strong> {house.paon}, {house.street}, {house.postcode}</p>
                </div>
            ))}
        </div>
    </div>
);
};

export default HouseRecommendations;
