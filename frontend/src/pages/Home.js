import React, { useState } from 'react';
import HouseSearch from "../components/HouseSearch";
import NavBar from "../components/NavBar";
import PricePredictor from "../components/PricePredictor";

export default function Home() {
    const [enrichedData, setEnrichedData] = useState(null);
    const handleEnrichedDataFetched = (data) => {
    setEnrichedData(data);
    };
    return (
        <div class="">
            <h1>House Price Predictor</h1>
            <HouseSearch onEnrichedDataFetched={handleEnrichedDataFetched} />
            {enrichedData && <PricePredictor enrichedData={enrichedData} />}
        </div>
    )
}