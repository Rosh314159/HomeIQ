import { Box, Typography, Paper, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useState } from 'react';
import ShapExplainer from './ShapExplainer';

const PropertyHeader = ({ property, onBack }) => {
  const [explainerOpen, setExplainerOpen] = useState(false);
  
  // Helper function to get full property type
  const getPropertyTypeFull = (propertyType) => {
    switch (propertyType) {
      case "D": return "Detached";
      case "S": return "Semi-Detached";
      case "T": return "Terraced";
      case "F": return "Flat";
      case "B": return "Bungalow";
      default: return "Unknown";
    }
  };
  
  // Format the address with title case
  const formatAddress = (address) => {
    if (!address) return '';
    return address
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  console.log(property)
  // Check if SHAP explanation data exists
  const hasShapData = property.feature_importance && 
                      property.expected_value && 
                      property.feature_values;

  const fullPropertyType = getPropertyTypeFull(property.property_type);
  const formattedAddress = formatAddress(property.address);

  return (
    <Box
      sx={{
        background: 'royalblue',
        padding: '24px 16px',
        color: 'white',
      }}
    >
      {/* Back button */}
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="contained"
        sx={{
          color: 'white',
          background: 'rgba(255, 255, 255, 0.2)',
          marginBottom: 2
        }}
      >
        Back
      </Button>
      
      {/* Main content */}
      <Box sx={{ 
        textAlign: 'center'
      }}>
        {/* property info with formatted address */}
        <Typography variant="h5" fontWeight="bold">
          {formattedAddress}, {property.postcode?.toUpperCase()}
        </Typography>
        
        <Typography sx={{ marginBottom: 2 }}>
          {fullPropertyType}
        </Typography>
        
        {/* display price with explainer button */}
        <Paper 
          sx={{ 
            padding: '16px',
            margin: '0 auto',
            maxWidth: '400px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            position: 'relative'
          }}
        >
          <Typography>Predicted Value</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" fontWeight="bold">
              £{Math.round(property.predicted_price).toLocaleString()}
            </Typography>
            {hasShapData && (
              <Tooltip title="View how we calculated this price">
                <IconButton 
                  onClick={() => setExplainerOpen(true)} 
                  sx={{ color: 'rgba(255,255,255,0.9)', ml: 1 }}
                  aria-label="View price calculation details"
                >
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Paper>
      </Box>
      
      {/* SHAP Explainer Dialog */}
      {hasShapData && (
        <ShapExplainer
          open={explainerOpen}
          onClose={() => setExplainerOpen(false)}
          property={property}
        />
      )}
    </Box>
  );
};

export default PropertyHeader;