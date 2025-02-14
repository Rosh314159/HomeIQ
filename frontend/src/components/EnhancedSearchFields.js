import React, { useState } from "react";
import DisplayEnhancedSearch from "./DisplayEnhancedSearch";
import axios from "axios";

const EnhancedSearchFields = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    priceMin: 0,
    priceMax: 1000000,
    propertyType: "",
    postcode: "",
    newBuild: "",
    townCity: "",
    nearestPrimarySchoolDistance: 5,
    nearestSecondarySchoolDistance: 5,
    nearestTrainStationDistance: 5
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria({ ...searchCriteria, [name]: value });
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/enhanced_search', { params: searchCriteria });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };
  if (searchResults.length > 0) {
    return <DisplayEnhancedSearch houses={searchResults} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Search Houses for Sale</h1>

      {/* Search Form */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="priceMin"
            placeholder="Min Price"
            value={searchCriteria.priceMin}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="priceMax"
            placeholder="Max Price"
            value={searchCriteria.priceMax}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="propertyType"
            placeholder="Property Type (D, S, T, F, B)"
            value={searchCriteria.propertyType}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="postcode"
            placeholder="Postcode"
            value={searchCriteria.postcode}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="newBuild"
            value={searchCriteria.newBuild}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">New Build?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <input
            type="text"
            name="townCity"
            placeholder="Town/City"
            value={searchCriteria.townCity}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            step="0.1"
            name="nearestPrimarySchoolDistance"
            placeholder="Max Distance to Primary School (km)"
            value={searchCriteria.nearestPrimarySchoolDistance}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            step="0.1"
            name="nearestSecondarySchoolDistance"
            placeholder="Max Distance to Secondary School (km)"
            value={searchCriteria.nearestSecondarySchoolDistance}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            step="0.1"
            name="nearestTrainStationDistance"
            placeholder="Max Distance to Train Station (km)"
            value={searchCriteria.nearestTrainStationDistance}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleSearch}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      <div className="max-w-4xl mx-auto mt-8 space-y-4">
        {loading && <p className="text-center text-blue-600">Loading results...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && results.length === 0 && <p className="text-center text-gray-500">No houses found.</p>}

        {results.map((house, index) => (
          <div key={index} className="p-4 bg-white shadow rounded-lg border">
            <h2 className="text-xl font-semibold">{house.paon}, {house.street}, {house.postcode}</h2>
            <p><strong>Price:</strong> £{house.price.toLocaleString()}</p>
            <p><strong>Asking Price:</strong> £{house.ask_price.toLocaleString()}</p>
            <p><strong>Predicted Price:</strong> £{house.predicted_price.toLocaleString()}</p>
            <p><strong>Property Type:</strong> {house.property_type}</p>
            <p><strong>New Build:</strong> {house.new_build}</p>
            <p><strong>Town/City:</strong> {house.town_city}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedSearchFields;
