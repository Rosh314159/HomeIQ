import React, { useMemo } from 'react';
import { 
  Box, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, IconButton, Paper,
  Grid, Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Feature name mapping for readability
const featureMap = {
  'total_floor_area': 'Floor Area',
  'multi_glaze_proportion': 'Multi-Glazed Windows',
  'nearest_train_station_distance': 'Distance to Train Station',
  'property_type': 'Property Type',
  'nearest_bus_stop_distance': 'Distance to Bus Stop',
  'number_open_fireplaces': 'Open Fireplaces',
  'nearest_secondary_school_outstanding': 'Outstanding Secondary School',
  'current_energy_rating': 'Energy Rating',
  'age_in_years': 'Property Age',
  'flat_top_storey': 'Top Floor Flat',
  'nearest_secondary_school_distance': 'Distance to Secondary School',
  'main_fuel': 'Main Heating Fuel',
  'nearest_primary_school_outstanding': 'Outstanding Primary School',
  'nearest_primary_school_ofsted_rating': 'Primary School Rating',
  'latitude': 'Location (Latitude)',
  'longitude': 'Location (Longitude)',
  'local_avg_price': 'Average Area Price'
};

// Format feature values appropriately
const formatFeatureValue = (name, value) => {
  if (name === 'total_floor_area') {
    return `${value} m²`;
  }
  if (name.includes('distance')) {
    return `${value.toFixed(2)} km`;
  }
  if (name === 'multi_glaze_proportion') {
    return `${(value * 100).toFixed(0)}%`;
  }
  if (name === 'age_in_years') {
    return `${value} years`;
  }
  if (name.includes('outstanding') && (value === 0 || value === 1)) {
    return value === 1 ? 'Yes' : 'No';
  }
  if (name === 'local_avg_price') {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      maximumFractionDigits: 0 
    }).format(value);
  }
  return String(value);
};

// Format currency values
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', { 
    style: 'currency', 
    currency: 'GBP',
    maximumFractionDigits: 0 
  }).format(value);
};

const ShapExplainer = ({ open, onClose, property }) => {
  // Extract feature_importance from props
  const feature_importance = property.feature_importance || {};
  
  // Process feature importance data for visualization
  const processedData = useMemo(() => {
    const features = Object.entries(feature_importance).map(([key, value]) => ({
      name: key,
      displayName: featureMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value,
      actualValue: property[key], // Get the actual feature value from property
      isPositive: value > 0
    }));
    
    // Sort by absolute value (highest impact first)
    features.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    
    return { features };
  }, [feature_importance, property]);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2,
        borderBottom: '1px solid #eee'
      }}>
        <Typography variant="h6" fontWeight="bold">
          Property Features Impact
        </Typography>
        <IconButton onClick={onClose} size="small" edge="end" aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          How each feature affects the house price:
        </Typography>
        
        <Box sx={{ mt: 3, mb: 4 }}>
          <Grid container spacing={2}>
            {processedData.features.map((feature) => (
              <Grid item xs={12} sm={6} key={feature.name}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #eee',
                    borderLeft: feature.isPositive ? '4px solid #4caf50' : '4px solid #f44336'
                  }}
                >
                  <Box>
                    <Typography variant="body1">
                      {feature.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.actualValue !== undefined ? formatFeatureValue(feature.name, feature.actualValue) : 'N/A'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        fontWeight: 'bold', 
                        color: feature.isPositive ? '#4caf50' : '#f44336' 
                      }}
                    >
                      {feature.isPositive ? '+' : '-'}{formatCurrency(Math.abs(feature.value))}
                    </Typography>
                  </Box>
                  
                  {feature.isPositive ? (
                    <Chip 
                      icon={<ArrowUpwardIcon />}
                      label="Increases"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      icon={<ArrowDownwardIcon />}
                      label="Decreases"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ borderRadius: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShapExplainer;