import React, { useState } from 'react';
import HouseSearch from "../components/HouseSearch";
import NavBar from "../components/NavBar";
import PricePredictor from "../components/PricePredictor";
import HouseList from '../components/HouseList';
import DisplayFinancialData from '../components/DisplayFinancialData';

export default function Home() {
    const [enrichedData, setEnrichedData] = useState(null);
    const handleEnrichedDataFetched = (data) => {
    setEnrichedData(data);
    };
    return (
        <div class="">
            <NavBar />
            <HouseSearch onEnrichedDataFetched={handleEnrichedDataFetched} />
            {enrichedData && <PricePredictor enrichedData={enrichedData} />}
            <div>
                <DisplayFinancialData />
            </div>
        </div>
    )
}