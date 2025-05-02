import React from 'react';
import { Box, Typography, Paper, Grid, Skeleton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HouseTile from './HouseTile';

const DisplayEnhancedSearch = ({ houses, loading = false }) => {

  // Loading placeholder
  if (loading) {
    return (
      <Box sx={{ py: 4, px: { xs: 2, sm: 4 }, bgcolor: 'background.default' }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ height: 160, bgcolor: 'grey.200', borderRadius: 2, mb: 2 }} />
                <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={24} width="60%" sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="40%" />
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Skeleton variant="text" height={24} width="80%" />
                  <Skeleton variant="text" height={20} width="50%" />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // No results
  if (!houses || houses.length === 0) {
    return (
      <Box 
        sx={{ 
          py: 8, 
          px: 4, 
          textAlign: 'center',
          bgcolor: 'background.default',
          borderRadius: 2
        }}
      >
        <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No properties found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your search criteria or explore a different area.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      py: 4, 
      px: { xs: 2, sm: 4 }, 
      bgcolor: 'background.default'
    }}>
      
      <Grid container spacing={3}>
        {houses.map((house, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <HouseTile house={house} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DisplayEnhancedSearch;
