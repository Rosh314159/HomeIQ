import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HouseRecommendations from "../components/HouseRecommendation";
import Navbar from "../components/NavBar";
const HouseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const enrichedData = location.state?.enrichedData;
  const [showRecommendations, setShowRecommendations] = useState(false);

  if (!enrichedData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 font-sans">
        <p className="text-gray-500 text-lg mb-4">No data available. Please go back and try again.</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }
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
  const houseRecommendationAttributes = {
    predicted_price: enrichedData.predicted_price,
    latitude: enrichedData.latitude,
    longitude: enrichedData.longitude,
  };

  const fullPropertyType = getPropertyTypeFull(enrichedData.property_type);
 
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 text-center">
        <h1 className="text-3xl font-bold">{enrichedData.address}</h1>
        <h2 className="text-2xl font-semibold mt-2">
          Predicted Price: £{Math.round(enrichedData.predicted_price).toLocaleString()}
        </h2>
        <p className="mt-1 text-lg">
          {fullPropertyType} | {enrichedData.built_form} | {enrichedData.age_in_years} years old
        </p>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Overview Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-blue-600 border-b pb-2 mb-4">Overview</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Postcode:</strong> {enrichedData.postcode}
            </li>
            <li>
              <strong className="text-gray-900">Construction Age Band:</strong>{" "}
              {enrichedData["construction-age-band"]}
            </li>
            <li>
              <strong className="text-gray-900">Total Floor Area:</strong> {enrichedData["total-floor-area"]} sqm
            </li>
            <li>
              <strong className="text-gray-900">Habitable Rooms:</strong> {enrichedData["number-habitable-rooms"]}
            </li>
            <li>
              <strong className="text-gray-900">Heated Rooms:</strong> {enrichedData["number-heated-rooms"]}
            </li>
          </ul>
        </div>

        {/* Energy Ratings Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-purple-600 border-b pb-2 mb-4">Energy Efficiency</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Current Energy Rating:</strong>{" "}
              {enrichedData["current-energy-rating"]} ({enrichedData["current-energy-efficiency"]})
            </li>
            <li>
              <strong className="text-gray-900">Potential Energy Rating:</strong>{" "}
              {enrichedData["potential-energy-rating"]} ({enrichedData["potential-energy-efficiency"]})
            </li>
            <li>
              <strong className="text-gray-900">CO2 Emissions:</strong>{" "}
              {enrichedData["co2-emissions-current"]} tonnes (Current),{" "}
              {enrichedData["co2-emissions-potential"]} tonnes (Potential)
            </li>
          </ul>
        </div>

        {/* Nearby Locations Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-green-600 border-b pb-2 mb-4">Nearby Amenities</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Nearest Shop:</strong> {enrichedData.nearest_shop_name} (
              {enrichedData.nearest_shop_distance.toFixed(2)} km)
            </li>
            <li>
              <strong className="text-gray-900">Nearest Bus Stop:</strong>{" "}
              {enrichedData.nearest_bus_stop_distance.toFixed(2)} km
            </li>
            <li>
              <strong className="text-gray-900">Primary School:</strong> {enrichedData.primary_school_name} (
              {enrichedData.nearest_primary_school_distance.toFixed(2)} km)
            </li>
            <li>
              <strong className="text-gray-900">Secondary School:</strong> {enrichedData.secondary_school_name} (
              {enrichedData.nearest_secondary_school_distance.toFixed(2)} km)
            </li>
            <li>
              <strong className="text-gray-900">Train Station:</strong>{" "}
              {enrichedData.nearest_train_station_distance.toFixed(2)} km
            </li>
          </ul>
        </div>

        {/* Costs Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-red-600 border-b pb-2 mb-4">Costs</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Heating Costs:</strong> £{enrichedData["heating-cost-current"]}{" "}
              (Current), £{enrichedData["heating-cost-potential"]} (Potential)
            </li>
            <li>
              <strong className="text-gray-900">Hot Water Costs:</strong> £{enrichedData["hot-water-cost-current"]}{" "}
              (Current), £{enrichedData["hot-water-cost-potential"]} (Potential)
            </li>
            <li>
              <strong className="text-gray-900">Lighting Costs:</strong> £{enrichedData["lighting-cost-current"]}{" "}
              (Current), £{enrichedData["lighting-cost-potential"]} (Potential)
            </li>
          </ul>
        </div>
        {/* Button to Navigate to Feasibility Assessment */}
          <button
            onClick={() => navigate("/feasibility")}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Run Feasibility Assessment
          </button>
          {/* Button to Show Recommendations */}
        <button
          onClick={() => setShowRecommendations(true)}
          className="mt-4 w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
        >
          View Similar Houses
        </button>

        {/* Render Recommendations if Button Clicked */}
        {showRecommendations && <HouseRecommendations houseAttributes={houseRecommendationAttributes} />}
        {/* Go Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600"
          >
            Search Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default HouseDetails;
