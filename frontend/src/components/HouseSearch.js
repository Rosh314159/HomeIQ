import React, { useState } from "react";
import axios from "axios";

const HouseSearch = ({ onEnrichedDataFetched }) => {
  const [postcode, setPostcode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [enrichedData, setEnrichedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchEnrichedData = async () => {
    try {
      const response = await axios.post("http://localhost:5000/fetch-and-enrich", {
        postcode,
        house_number_or_name: houseNumber,
      });

      console.log(response);

      if (response.status === 200) {
        setEnrichedData(response.data.enriched_data);
        setErrorMessage("");
        onEnrichedDataFetched(response.data.enriched_data);
      } else {
        setErrorMessage(response.statusText || "Failed to fetch enriched data.");
        setEnrichedData(null);
      }
    } catch (error) {
      console.error("Error fetching enriched data:", error);
      setErrorMessage("An error occurred while fetching enriched data.");
      setEnrichedData(null);
    }
  };

  return (
    <div>
      <h2>Search for House Information</h2>
      <input
        type="text"
        placeholder="Enter postcode"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter house number"
        value={houseNumber}
        onChange={(e) => setHouseNumber(e.target.value)}
      />
      <button onClick={fetchEnrichedData}>Search</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {enrichedData && (
        <div>
          <h3>Enriched Data</h3>
          <pre>{JSON.stringify(enrichedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HouseSearch;
