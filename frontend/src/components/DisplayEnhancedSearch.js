import React from 'react';

const DisplayEnhancedSearch = ({ houses }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses.map((house, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-lg border">
            <h3 className="text-xl font-semibold mb-2">£{house.ask_price}</h3>
            <p><strong>Predicted Price:</strong> £{house.predicted_price}</p>
            <p><strong>Property Type:</strong> {house.property_type}</p>
            <p><strong>Postcode:</strong> {house.postcode}</p>
            <p><strong>Address:</strong> {house.paon}, {house.street}, {house.postcode}</p>
            <p><strong>Town/City:</strong> {house.town_city}</p>
            <p><strong>Latitude:</strong> {house.latitude}</p>
            <p><strong>Longitude:</strong> {house.nearest_shop_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayEnhancedSearch;
