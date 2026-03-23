import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, Paper, CircularProgress,
  Alert, Fade, Slide, InputAdornment, Divider
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import config from '../config';
const HouseSearch = () => {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [searchStage, setSearchStage] = useState("postcode"); // "postcode", "address", "results"
  const navigate = useNavigate();

  // Function to fetch addresses from Postcode.io
  const fetchAddresses = async () => {
    if (!postcode) {
      setErrorMessage("Please enter a valid postcode.");
      return;
    }

    setErrorMessage("");
    setAddresses([]);
    setLoading(true);

    try {
      const key = process.env.REACT_APP_POSTCODE_API;
      const response = await axios.get(
        `https://api.ideal-postcodes.co.uk/v1/autocomplete/addresses?query=${postcode}&api_key=${key}`
      );
      console.log(response);
      const filteredAddresses = response.data.result.hits.map(hit => hit.suggestion);
      setAddresses(filteredAddresses || []);
      setLoading(false);
      setSearchStage("address");
    } catch (error) {
      setErrorMessage("Could not fetch addresses. Please check the postcode.");
      setLoading(false);
    }
  };

  // Function to fetch enriched data
  const fetchEnrichedData = async () => {
    if (!postcode || !selectedAddress) {
      setErrorMessage("Please select a valid address.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Extract house number/name from the selected address
      const houseNumber = selectedAddress.split(",")[0];

      // Step 1: Fetch enriched data
      const enrichResponse = await axios.post(`${config.API_URL}/fetch-and-enrich`, {
        postcode,
        house_number_or_name: houseNumber,
      });

      if (enrichResponse.status === 200) {
        const enrichedData = enrichResponse.data.enriched_data;

        // Step 2: Predict house price using enriched data
        try {
          const predictResponse = await fetch(`${config.API_URL}/predict-price`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enriched_data: enrichedData }),
          });

          const result = await predictResponse.json();
          if (result.status === "success") {
            enrichedData.predicted_price = result.predicted_price;
            enrichedData.feature_values = result.feature_values;
            enrichedData.expected_value = result.expected_value;
            enrichedData.feature_importance = result.feature_importance;
            enrichedData.local_avg_price = result.local_avg_price;
            // Navigate to the details page with enriched data and predicted price
            setLoading(false);
            navigate("/details", { state: { enrichedData } });
          } else {
            throw new Error(result.message || "Failed to predict house price.");
          }
        } catch (predictError) {
          console.error("Error predicting house price:", predictError);
          setErrorMessage("An error occurred while predicting house price.");
          setLoading(false);
        }
      } else {
        throw new Error(enrichResponse.statusText || "Failed to fetch enriched data.");
      }
    } catch (enrichError) {
      console.error("Error fetching enriched data:", enrichError);
      setErrorMessage("This house cannot be viewed as a valid EPC certificate can not be found for it, please try a different house");
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{
        maxWidth: 600,
        width: '100%',
        mx: 'auto',
        p: 4,
        borderRadius: 2,
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <HomeIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
        <Typography variant="h5" fontWeight="600" color="text.primary">
          Find Your Dream Home
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Postcode Input Section */}
      <Fade in={true}>
        <Box>
          <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1.5 }}>
            Enter a UK postcode to begin your property search
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              placeholder="e.g. RG30 6XY"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && postcode.trim()) {
                  fetchAddresses();
                }
              }}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchAddresses}
              disabled={loading || !postcode.trim()}
              sx={{ 
                px: 3,
                borderRadius: 2,
                minWidth: '120px',
                boxShadow: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                }
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            >
              {loading ? "Searching..." : "Find"}
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Error Message */}
      {errorMessage && (
        <Fade in={!!errorMessage}>
          <Alert 
            severity="error" 
            onClose={() => setErrorMessage("")}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {errorMessage}
          </Alert>
        </Fade>
      )}

      {/* Address Selection Section */}
      <Slide direction="up" in={addresses.length > 0} mountOnEnter unmountOnExit>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 1.5 }}>
            Select your address from the list below
          </Typography>
          
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="address-select-label">Select Address</InputLabel>
            <Select
              labelId="address-select-label"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              label="Select Address"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="" disabled>Choose an address</MenuItem>
              {addresses.map((address, index) => (
                <MenuItem key={index} value={address} sx={{ py: 1.5 }}>
                  {address}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Fade in={!!selectedAddress}>
            <Box>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={fetchEnrichedData}
                disabled={loading || !selectedAddress}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" /> 
                    Retrieving Property Data...
                  </Box>
                ) : (
                  "Get Property Details"
                )}
              </Button>
            </Box>
          </Fade>
        </Box>
      </Slide>
    </Paper>
  );
};

export default HouseSearch;


