import React, { useState } from 'react';
import HouseSearch from "../components/HouseSearch";
import NavBar from "../components/NavBar";
import PricePredictor from "../components/PricePredictor";
import { Box, Container, CssBaseline, useTheme } from "@mui/material";
import RecentSearches from '../components/RecentSearches';
import { Typography } from '@mui/material';

export default function Home() {
  const [enrichedData, setEnrichedData] = useState(null);
  const theme = useTheme();
  const handleEnrichedDataFetched = (data) => {
    setEnrichedData(data);
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <NavBar />
        <Container maxWidth="lg" sx={{ mt: 0, pb: 0 }}>
          <Box sx={{ position: 'relative' }}>
            <HouseSearch onEnrichedDataFetched={handleEnrichedDataFetched} />
            {enrichedData && <PricePredictor enrichedData={enrichedData} />}
          </Box>
          <Box sx={{ position: 'absolute', top: "10%", right: "5%", mt: 2 }}>
            <RecentSearches />
          </Box>
        </Container>
        
      </Box>
    </>
  );
}
