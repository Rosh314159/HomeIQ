import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HouseRecommendations from "../components/HouseRecommendation";
import Navbar from "../components/NavBar";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import FeasibilityAssessment from "../components/FeasibilityAssessment";
const HouseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const enrichedData = location.state?.enrichedData;
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isFeasibilityOpen, setIsFeasibilityOpen] = useState(false);
  // Function to save recent searches in localStorage
  const saveRecentSearch = () => {
    if (!enrichedData) return;

    // Extract relevant details to store
    const house = enrichedData;

    // Retrieve existing recent searches
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Remove duplicates (if already in recent searches)
    recentSearches = recentSearches.filter((recentHouse) => recentHouse.postcode !== house.postcode);

    // Add new search at the start
    recentSearches.unshift(house);
    console.log(recentSearches);

    // Keep only the last 5 searches
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }

    // Save back to localStorage
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  };

  // Save search when component mounts
  useEffect(() => {
    saveRecentSearch();
  }, [enrichedData]); // Run only once when component mounts

  
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
              {enrichedData["construction_age_band"]}
            </li>
            <li>
              <strong className="text-gray-900">Total Floor Area:</strong> {enrichedData["total_floor_area"]} sqm
            </li>
            <li>
              <strong className="text-gray-900">Habitable Rooms:</strong> {enrichedData["number_habitable_rooms"]}
            </li>
            <li>
              <strong className="text-gray-900">Heated Rooms:</strong> {enrichedData["number_heated_rooms"]}
            </li>
          </ul>
        </div>

        {/* Energy Ratings Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-xl font-bold text-purple-600 border-b pb-2 mb-4">Energy Efficiency</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">Current Energy Rating:</strong>{" "}
              {enrichedData["current_energy_rating"]} ({enrichedData["current_energy_efficiency"]})
            </li>
            <li>
              <strong className="text-gray-900">Potential Energy Rating:</strong>{" "}
              {enrichedData["potential_energy_rating"]} ({enrichedData["potential_energy_efficiency"]})
            </li>
            <li>
              <strong className="text-gray-900">CO2 Emissions:</strong>{" "}
              {enrichedData["co2_emissions_current"]} tonnes (Current),{" "}
              {enrichedData["co2_emissions_potential"]} tonnes (Potential)
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
              <strong className="text-gray-900">Heating Costs:</strong> £{enrichedData["heating_cost_current"]}{" "}
              (Current), £{enrichedData["heating_cost_potential"]} (Potential)
            </li>
            <li>
              <strong className="text-gray-900">Hot Water Costs:</strong> £{enrichedData["hot_water_cost_current"]}{" "}
              (Current), £{enrichedData["hot_water_cost_potential"]} (Potential)
            </li>
            <li>
              <strong className="text-gray-900">Lighting Costs:</strong> £{enrichedData["lighting_cost_current"]}{" "}
              (Current), £{enrichedData["lighting_cost_potential"]} (Potential)
            </li>
          </ul>
        </div>
        {/* Button to Navigate to Feasibility Assessment */}
          <button
            onClick={() => setIsFeasibilityOpen(true)}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Run Feasibility Assessment
          </button>

          {/* Feasibility Assessment Modal */}
          <Dialog open={isFeasibilityOpen} onClose={() => setIsFeasibilityOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>Feasibility Assessment</DialogTitle>
            <DialogContent>
              {enrichedData ? (
                <FeasibilityAssessment data={enrichedData} /> // Pass enrichedData to feasibility assessment component
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No data available for assessment.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsFeasibilityOpen(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Button to Show Recommendations */}
        <button
          onClick={() => setShowRecommendations(true)}
          className="mt-4 w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
        >
          View Similar Houses
        </button>

        {/* Render Recommendations if Button Clicked */}
        {showRecommendations && <HouseRecommendations houseAttributes={enrichedData} />}
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
