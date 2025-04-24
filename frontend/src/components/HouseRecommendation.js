import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, CircularProgress, Alert,
  Container, Divider, Chip, Grid, Skeleton, 
  Paper, Fade, Tab, Tabs, useTheme
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import HouseTile from './HouseTile';

const HouseRecommendations = ({ houseAttributes, options }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Retrieve user financial data from local storage
        const storedData = localStorage.getItem("userFinancialData");
        const financialData = storedData ? JSON.parse(storedData) : {};
        
        const response = await axios.post("http://localhost:5000/recommendations", {
          houseAttributes,
          options,
          financialData, // Include financial data in the request body
        });
        
        setRecommendations(response.data.recommendations);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recommended houses.");
      } finally {
        setLoading(false);
      }
    };
    
    if (houseAttributes) {
      console.log("Fetching recommendations");
      fetchRecommendations();
    }
  }, [houseAttributes, options]);
    

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
            Finding Similar Properties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyzing property data to find the best matches for you...
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" height={32} sx={{ mt: 2, mb: 1 }} />
              <Skeleton variant="text" height={24} width="60%" />
              <Skeleton variant="text" height={24} width="80%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Alert 
          severity="error" 
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            '& .MuiAlert-message': { display: 'flex', alignItems: 'center' }
          }}
        >
          <Typography variant="body1" component="div" fontWeight={500}>
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (recommendations.error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: theme.palette.grey[50]
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: theme.palette.grey[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 40, color: theme.palette.grey[500] }} />
          </Box>
          <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
            No Similar Properties Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We couldn't find any properties that match your criteria.
            Try adjusting your search preferences or explore different areas.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Fade in={true}>
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
        {/* Header Section */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ThumbUpOutlinedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h4" component="h2" fontWeight="bold">
                  Recommended Properties
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Recommendations Grid */}
        <Grid container spacing={3}>
          {recommendations.map((house, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <HouseTile house={house} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Fade>
  );
};

export default HouseRecommendations;
