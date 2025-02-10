import { useEffect, useState } from "react";
import axios from "axios";
import "./HouseList.css"; // Import the CSS file

const HouseList = () => {
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/houses")
      .then((response) => setHouses(response.data))
      .catch((error) => console.error("Error fetching houses:", error));
  }, []);

  return (
    <div className="container">
      <h2 className="title">House Listings</h2>
      <div className="house-list">
        {houses.map((house) => (
          <div key={house.transaction_id} className="house-card">
            <h3>{house.property_type}</h3>
            <p><strong>Price:</strong> £{house.price}</p>
            <p><strong>Postcode:</strong> {house.postcode}</p>
            <p><strong>Date of Transfer:</strong> {house.date_of_transfer}</p>
            <p><strong>Asking Price:</strong> £{house.ask_price || "N/A"}</p>
            <p><strong>Predicted Price:</strong> £{house.predicted_price || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HouseList;
