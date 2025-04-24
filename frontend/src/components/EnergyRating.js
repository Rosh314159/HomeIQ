import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const RatingCircle = styled(Box)(({ bgcolor }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: bgcolor,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.2rem',
}));

// Helper function to get energy rating color
const getEnergyRatingColor = (rating) => {
  switch (rating) {
    case 'A': return '#2e7d32'; // green[800]
    case 'B': return '#4caf50'; // green[500]
    case 'C': return '#81c784'; // green[300]
    case 'D': return '#ffeb3b'; // yellow[500]
    case 'E': return '#ffc107'; // amber[500]
    case 'F': return '#ff9800'; // orange[500]
    case 'G': return '#f44336'; // red[500]
    default: return '#9e9e9e'; // grey[500]
  }
};

const EnergyRating = ({ currentRating, potentialRating, currentScore, potentialScore, co2Emissions }) => {
  return (
    <Box>
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={3}>
        <Grid item xs={4} sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Rating
          </Typography>
          <RatingCircle bgcolor={getEnergyRatingColor(currentRating)}>
            {currentRating}
          </RatingCircle>
        </Grid>
        
        <Grid item xs={4} sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Potential Rating
          </Typography>
          <RatingCircle bgcolor={getEnergyRatingColor(potentialRating)}>
            {potentialRating}
          </RatingCircle>
        </Grid>
        
        <Grid item xs={4} sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            CO<sub>2</sub> Emissions
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {co2Emissions}<Typography component="span" variant="caption" color="text.secondary"> tonnes</Typography>
          </Typography>
        </Grid>
      </Grid>
      
      <Divider />
      
      <Box mt={2} sx={{ color: 'text.secondary' }}>
        <Typography variant="body2" gutterBottom>
          Current EPC Score: {currentScore}
        </Typography>
        <Typography variant="body2">
          Potential EPC Score: {potentialScore}
        </Typography>
      </Box>
    </Box>
  );
};

export default EnergyRating;