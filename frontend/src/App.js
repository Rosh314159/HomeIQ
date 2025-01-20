import React, { useState } from "react";
import HouseSearch from "./components/HouseSearch";
import PricePredictor from "./components/PricePredictor";

const App = () => {
  const [enrichedData, setEnrichedData] = useState(null);

  const handleEnrichedDataFetched = (data) => {
    setEnrichedData(data);
  };

  return (
    <div>
      <h1>House Price Predictor</h1>
      <HouseSearch onEnrichedDataFetched={handleEnrichedDataFetched} />
      {enrichedData && <PricePredictor enrichedData={enrichedData} />}
    </div>
  );
};

export default App;


