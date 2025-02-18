import React, { useState } from 'react';
import HouseSearch from "../components/HouseSearch";
import NavBar from "../components/NavBar";
import PricePredictor from "../components/PricePredictor";
import HouseList from '../components/HouseList';
import DisplayFinancialData from '../components/DisplayFinancialData';
import { Box, Container, CssBaseline } from "@mui/material";
import RecentSearches from '../components/RecentSearches';


export default function Home() {
    const [enrichedData, setEnrichedData] = useState(null);

    const handleEnrichedDataFetched = (data) => {
        setEnrichedData(data);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                //background: "radial-gradient(circle, #F5F5F5 20%, #D3D3D3 80%)",
                color: "#fff",
                paddingBottom: "40px",
            }}
        >
            <CssBaseline />
            <NavBar />
            <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
                <HouseSearch onEnrichedDataFetched={handleEnrichedDataFetched} />
                {enrichedData && <PricePredictor enrichedData={enrichedData} />}
                <RecentSearches />
            </Container>
        </Box>
    );
}
