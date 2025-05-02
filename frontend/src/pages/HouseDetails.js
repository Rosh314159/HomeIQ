import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Grid, Button, Typography } from '@mui/material';

// Import custom components
import HouseRecommendations from "../components/HouseRecommendation";
import Navbar from "../components/NavBar";
import RecommendationModal from "../components/RecommendationModal";
import FeasibilityModal from "../components/FeasibilityModal";
import PropertyHeader from "../components/PropertyHeader";
import PropertySection, { PropertyListItem } from "../components/PropertySection";
import EnergyRating from "../components/EnergyRating";
import RunningCosts from "../components/RunningCosts";

// Import icons
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import SchoolIcon from '@mui/icons-material/School';
import TrainIcon from '@mui/icons-material/Train';
import PaidIcon from '@mui/icons-material/Paid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';



const HouseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const enrichedData = location.state?.enrichedData;
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isFeasibilityOpen, setIsFeasibilityOpen] = useState(false);
  const [isRecommendationOptionOpen, setIsRecommendationOptionOpen] = useState(false);
  const [options, setOptions] = useState({
    priority: "",
    affordableOnly: false
  });
  
  const handleGetRecommendations = () => {
    setIsRecommendationOptionOpen(false);
    setShowRecommendations(true);
    
    setTimeout(() => {
      const recommendationsElement = document.getElementById('recommendations-section');
      if (recommendationsElement) {
        recommendationsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Function to save recent searches in localStorage
  const saveRecentSearch = () => {
    if (!enrichedData) return;
    
    const house = enrichedData;
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    recentSearches = recentSearches.filter((recentHouse) => recentHouse.postcode !== house.postcode);
    recentSearches.unshift(house);
    
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
    
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  };

  useEffect(() => {
    saveRecentSearch();
    window.scrollTo(0, 0);
    
  }, [enrichedData]);
  
 // Helper function to get color based on Ofsted rating - using named colors
const getRatingColor = (rating) => {
  switch(rating) {
    case 4:
      return 'green';       // Outstanding
    case 3:
      return 'lightgreen';  // Good
    case 2: 
      return 'orange';      // Requires Improvement
    case 1:
      return 'red';         // Inadequate
    default:
      return 'gray';        // Unknown
  }
};
  
  const getOfstedRating = (rating) => {
    switch(rating) {
      case 4:
        return "Outstanding";
      case 3: 
        return "Good";
      case 2:
        return "Requires Improvement";
      case 1: 
        return "Inadequate";
      default:
        return "Unknown"
    }
  }

  if (!enrichedData) {
    return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          height="100vh" 
          bgcolor="background.default"
          px={3}
        >
          <Box 
            textAlign="center"
            p={6} 
            bgcolor="background.paper" 
            borderRadius={4} 
            boxShadow={3}
            maxWidth="sm"
            width="100%"
          >
            <Typography variant="h4" mb={2} color="text.primary">
              No Property Data
            </Typography>
            <Typography color="text.secondary" variant="body1" mb={4}>
              We couldn't find any data for this property. Please go back and try searching again.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Return to Search
            </Button>
          </Box>
        </Box>
    );
  }
  
  return (
      <Box minHeight="100vh" bgcolor="background.default">
        <Navbar />
        
        {/*Propertyh eader */}
        <PropertyHeader 
          property={enrichedData} 
          onBack={() => navigate("/")}
        />
        
        <Container maxWidth="lg" sx={{ py: 5 }}>
          {/* Action Buttons */}
          <Grid container spacing={3} mb={5}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PaidIcon />}
                onClick={() => setIsFeasibilityOpen(true)}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Run Affordability Analysis
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => setIsRecommendationOptionOpen(true)}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Find Similar Properties
              </Button>
            </Grid>
          </Grid>
          
          {/* Property Details Sections */}
          <Grid container spacing={4} mb={5}>
            {/* Overview Section */}
            <Grid item xs={12} md={6}>
              <PropertySection 
                title="Property Overview" 
                icon={<HomeIcon />} 
                bgcolor="dodgerblue"
                elevation={3}
              >
                <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                  <PropertyListItem
                    icon={<ViewInArIcon color="primary" />}
                    primary="Floor Area"
                    secondary={`${enrichedData.total_floor_area}m²`}
                  />
                  <PropertyListItem
                    icon={<MeetingRoomIcon color="primary" />}
                    primary="Habitable Rooms"
                    secondary={enrichedData.number_habitable_rooms}
                  />
                  <PropertyListItem
                    icon={<LocalFireDepartmentIcon color="primary" />}
                    primary="Heated Rooms"
                    secondary={enrichedData.number_heated_rooms}
                  />
                  <PropertyListItem
                    icon={<CalendarTodayIcon color="primary" />}
                    primary="Construction Age Band"
                    secondary={enrichedData.construction_age_band}
                  />
                </Box>
              </PropertySection>
            </Grid>
            
            {/* Energy Rating Section */}
            <Grid item xs={12} md={6}>
              <PropertySection 
                title="Energy Efficiency" 
                icon={<EnergySavingsLeafIcon />} 
                bgcolor="green"
                elevation={3}
              >
                <EnergyRating
                  currentRating={enrichedData.current_energy_rating}
                  potentialRating={enrichedData.potential_energy_rating}
                  currentScore={enrichedData.current_energy_efficiency}
                  potentialScore={enrichedData.potential_energy_efficiency}
                  co2Emissions={enrichedData.co2_emissions_current}
                />
              </PropertySection>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <PropertySection 
                title="Nearby Amenities" 
                icon={<LocationOnIcon />} 
                bgcolor="orange"
                elevation={3}
              >
                <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                  <PropertyListItem
                    icon={<ShoppingBagIcon sx={{ color: "orange" }} />}
                    primary="Nearest Shop"
                    secondary={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{enrichedData.nearest_shop_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {enrichedData.nearest_shop_distance.toFixed(2)} km away
                        </Typography>
                      </Box>
                    }
                  />
                  <PropertyListItem
                    icon={<DirectionsBusIcon sx={{ color: "orange" }} />}
                    primary="Bus Stop"
                    secondary={`${enrichedData.nearest_bus_stop_distance.toFixed(2)} km away`}
                  />
                  <PropertyListItem
                    icon={<TrainIcon sx={{ color: "orange" }} />}
                    primary="Train Station"
                    secondary={`${enrichedData.nearest_train_station_distance.toFixed(2)} km away`}
                  />
                  <PropertyListItem
                    icon={<SchoolIcon sx={{ color: "orange" }} />}
                    primary="Schools"
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {/* Primary School */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          borderRadius: 2,
                          p: 1.5,
                          bgcolor: 'rgba(255, 152, 0, 0.08)',
                        }}>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600}>{enrichedData.primary_school_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Primary: {enrichedData.nearest_primary_school_distance.toFixed(2)} km away
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            ml: 2, 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 1,
                            bgcolor: enrichedData.nearest_primary_school_ofsted_rating ? getRatingColor(enrichedData.nearest_primary_school_ofsted_rating) : 'grey.300',
                            minWidth: '36px',
                            textAlign: 'center',
                            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                          }}>
                            <Typography variant="caption" fontWeight="bold" color="white">
                              {getOfstedRating(enrichedData.nearest_primary_school_ofsted_rating) || "?"}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Secondary School */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          borderRadius: 2,
                          p: 1.5,
                          bgcolor: 'rgba(255, 152, 0, 0.08)',
                          
                        }}>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600}>{enrichedData.secondary_school_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Secondary: {enrichedData.nearest_secondary_school_distance.toFixed(2)} km away
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            ml: 2, 
                            px: 1.5, 
                            py: 0.5, 
                            borderRadius: 1,
                            bgcolor: enrichedData.nearest_secondary_school_ofsted_rating ? getRatingColor(enrichedData.nearest_secondary_school_ofsted_rating) : 'grey.300',
                            minWidth: '36px',
                            textAlign: 'center',
                            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                          }}>
                            <Typography variant="caption" fontWeight="bold" color="white">
                              {getOfstedRating(enrichedData.nearest_secondary_school_ofsted_rating) || "?"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </Box>
              </PropertySection>
            </Grid>
            
            {/* Running Costs Section */}
            <Grid item xs={12} md={6}>
              <PropertySection 
                title="Running Costs" 
                icon={<PaidIcon />} 
                bgcolor="crimson"
                elevation={3}
              >
                <RunningCosts
                  heatingCurrent={enrichedData.heating_cost_current}
                  heatingPotential={enrichedData.heating_cost_potential}
                  waterCurrent={enrichedData.hot_water_cost_current}
                  waterPotential={enrichedData.hot_water_cost_potential}
                  lightingCurrent={enrichedData.lighting_cost_current}
                  lightingPotential={enrichedData.lighting_cost_potential}
                />
              </PropertySection>
            </Grid>
          </Grid>
          
          {/* Search Again Button */}
          <Box textAlign="center" my={6}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                borderRadius: 28, 
                px: 6,
                py: 1.8, 
                fontSize: '1rem',
              }}
              onClick={() => { window.scrollTo({top:0}); navigate("/"); }}
            >
              Search Another Property
            </Button>
          </Box>
        </Container>
        
        {/* Feasibility  */}
        <FeasibilityModal 
          isOpen={isFeasibilityOpen}
          onClose={() => setIsFeasibilityOpen(false)}
          propertyData={enrichedData}
        />
        
        {/* Recommendations */}
        <RecommendationModal 
          isOpen={isRecommendationOptionOpen}
          onClose={() => setIsRecommendationOptionOpen(false)}
          options={options}
          setOptions={setOptions}
          onGetRecommendations={handleGetRecommendations}
        />
        
        {/* display recs at bottom of page */}
        <Box id="recommendations-section">
          {showRecommendations && <HouseRecommendations houseAttributes={enrichedData} options={options} />}
        </Box>
      </Box>
  );
};

export default HouseDetails;
