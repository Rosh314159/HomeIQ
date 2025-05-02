import React, { useState, useEffect } from "react";
import DisplayEnhancedSearch from "./DisplayEnhancedSearch";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Radio,
  Stack
} from "@mui/material";

const EnhancedSearchFields = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    priceMin: 0,
    priceMax: 1000000,
    propertyType: "",
    postcode: "",
    newBuild: "",
    townCity: "",
    undervalued: "", // "undervalued", "overvalued", or ""
    walkingTimeToPrimarySchool: "",
    walkingTimeToSecondarySchool: "",
    walkingTimeToTrainStation: "",
    onlyAffordable: false,
    annual_income: "",
    debt_obligations: "",
    deposit_amount: "",
    first_time_buyer: "",
  });

  // Check if financial data exists in localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("userFinancialData");
    if (storedData) {
      setFinancialData(JSON.parse(storedData));
    }
  }, []);

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [financialData, setFinancialData] = useState(null);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const resultsPerPage = 50;

  // Function to convert walking time (minutes) to distance (km)
  const convertWalkingTimeToDistance = (minutes) => {
    if (!minutes) { return null; }
    const avgWalkingSpeedKmPerMin = 0.08; // Avg human walking speed ~ 4.8 km/h
    return (minutes * avgWalkingSpeedKmPerMin).toFixed(2);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchCriteria((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSearch = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      setNoResultsMessage(""); // Clear previous no results message

      // Convert walking time inputs to distances
      const adjustedCriteria = {
        ...searchCriteria,
        nearestPrimarySchoolDistance: convertWalkingTimeToDistance(searchCriteria.walkingTimeToPrimarySchool),
        nearestSecondarySchoolDistance: convertWalkingTimeToDistance(searchCriteria.walkingTimeToSecondarySchool),
        nearestTrainStationDistance: convertWalkingTimeToDistance(searchCriteria.walkingTimeToTrainStation),
      };

      console.log(financialData.annual_income);
      // add affordability filtering
      if (searchCriteria.onlyAffordable && financialData) {
        console.log("Here");
        adjustedCriteria.onlyAffordable = true;
        adjustedCriteria.annual_income = financialData.annual_income;
        adjustedCriteria.debt_obligations = financialData.debt_obligations;
        adjustedCriteria.deposit_amount = financialData.savings;
        adjustedCriteria.is_first_home = financialData.is_first_home;
      }
  
      // Remove empty fields
      Object.keys(adjustedCriteria).forEach((key) => {
        if (!adjustedCriteria[key]) delete adjustedCriteria[key];
        console.log(adjustedCriteria);
      });

      const response = await axios.get("http://localhost:5000/enhanced_search", {
      params: { ...adjustedCriteria, page, limit: resultsPerPage },
      });
      if (response.data.houses.length === 0) {
        setNoResultsMessage("No houses found matching your criteria.");
      } else {
        setSearchResults(response.data.houses);
        setCurrentPage(page);
      }
    } catch (error) {
      setError("Error fetching search results.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (searchResults.length > 0) {
    return (
      <Box>
        {/* Pagination Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4 
        }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              setCurrentPage((prev) => {
                const newPage = Number(prev) - 1;
                handleSearch(newPage);
                return newPage
              });
            }}
            disabled={currentPage <= 1}
            sx={{ 
              px: 2, 
              py: 1,
              bgcolor: 'grey.300',
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'grey.400'
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              }
            }}
          >
            Previous
          </Button>
          {/* Page Number Display */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'medium',
            bgcolor: 'grey.100',
            px: 2,
            py: 1,
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          Page {currentPage}
        </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setCurrentPage((prev) => {
                const newPage = Number(prev) + 1;
                handleSearch(newPage);
                return newPage;
              });
            }}
            sx={{ 
              px: 2, 
              py: 1,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            Next
          </Button>
        </Box>
        <DisplayEnhancedSearch houses={searchResults} />
      </Box>
    )
  }
  return (
    <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3, width: "100%" }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Search Houses for Sale
        </Typography>

        <Grid container spacing={3}>
          {/* Min Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Min Price"
              type="number"
              fullWidth
              name="priceMin"
              value={searchCriteria.priceMin}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Max Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Max Price"
              type="number"
              fullWidth
              name="priceMax"
              value={searchCriteria.priceMax}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* Affordability Checkbox */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchCriteria.onlyAffordable}
                  onChange={handleChange}
                  name="onlyAffordable"
                  disabled={!financialData} // Disable if financial data is missing
                />
              }
              label="Only Show Houses I Can Afford"
            />
            {!financialData && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                You need to set your financial data first.
              </Alert>
            )}
          </Grid>

          {/* Property Type */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold">
              Property Type
            </Typography>
            <Grid container spacing={1}>
              {["Detached", "Semi-Detached", "Terraced", "Flat"].map((type) => (
                <Grid item key={type}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={searchCriteria.propertyType === type}
                        onChange={() => {
                          setSearchCriteria((prev) => ({
                            ...prev,
                            propertyType: type,
                          }));
                        }}
                      />
                    }
                    label={type}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Postcode */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Postcode"
              fullWidth
              name="postcode"
              value={searchCriteria.postcode}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          {/* New Build */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>New Build?</InputLabel>
              <Select name="newBuild" value={searchCriteria.newBuild} onChange={handleChange}>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Undervalued or Overvalued */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Price Valuation</InputLabel>
              <Select name="undervalued" value={searchCriteria.undervalued} onChange={handleChange}>
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="undervalued">Undervalued (Predicted {'<'} Ask Price)</MenuItem>
                <MenuItem value="overvalued">Overvalued (Ask Price {'>'} Predicted)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Walking Distance Inputs */}
          {[
            { label: "Max Walking Time to Primary School (min)", name: "walkingTimeToPrimarySchool" },
            { label: "Max Walking Time to Secondary School (min)", name: "walkingTimeToSecondarySchool" },
            { label: "Max Walking Time to Train Station (min)", name: "walkingTimeToTrainStation" },
          ].map(({ label, name }) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                label={label}
                type="number"
                fullWidth
                name={name}
                value={searchCriteria[name]}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          ))}
        </Grid>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3, py: 1.5, fontSize: "1.1rem" }}
          onClick={() => handleSearch(1)}
        >
          Search
        </Button>
      </Paper>

      {/* No Results Message Popup */}
      <Snackbar
        open={!!noResultsMessage}
        autoHideDuration={6000}
        onClose={() => setNoResultsMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setNoResultsMessage("")} severity="info" sx={{ width: "100%" }}>
          {noResultsMessage}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default EnhancedSearchFields;