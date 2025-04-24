import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Divider, 
  IconButton, Tooltip, useTheme
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const HouseTile = ({ house }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleTileClick = () => {
    navigate("/details", { state: { enrichedData: house } });
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Get property type full name
  const getPropertyTypeFull = (propertyType) => {
    switch (propertyType) {
      case "D": return "Detached";
      case "S": return "Semi-Detached";
      case "T": return "Terraced";
      case "F": return "Flat";
      default: return "Unknown Property Type";
    }
  };

  // Calculate price difference percentage
  const getPriceDifference = (askPrice, predictedPrice) => {
    if (!askPrice || !predictedPrice) return 0;
    return ((predictedPrice - askPrice) / askPrice) * 100;
  };

  // Get color based on price difference
  const getPriceComparisonColor = (difference) => {
    if (difference > 5) return theme.palette.success.main;
    if (difference < -5) return theme.palette.error.main;
    return theme.palette.warning.main;
  };

 // Generate a house placeholder color based on postcode
 const getHouseColor = (postcode) => {
  const colors = [
    '#4f46e5', '#14b8a6', '#f97316', '#8b5cf6',
    '#06b6d4', '#f59e0b', '#ec4899', '#10b981'
  ];
  
  const hash = postcode?.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + acc;
  }, 0) || 0;
  
  return colors[hash % colors.length];
};

  // Calculate values once for reuse
  const priceDifference = getPriceDifference(house.ask_price, house.predicted_price);
  const propertyTypeDisplay = getPropertyTypeFull(house.property_type);
  const houseColor = getHouseColor(house.postcode);
  const priceColor = getPriceComparisonColor(priceDifference);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          cursor: 'pointer'
        }
      }}
      onClick={handleTileClick}
    >
      {/* House Image or Placeholder */}
      <Box 
        sx={{ 
          height: 150, 
          bgcolor: houseColor,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <HomeIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.8)' }} />
        
        {/* Property Type Badge */}
        <Chip 
          label={propertyTypeDisplay}
          size="small"
          sx={{ 
            position: 'absolute', 
            left: 12,
            top: 12,
            bgcolor: 'rgba(255,255,255,0.85)',
            fontWeight: 500
          }}
        />
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Price Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Predicted: {formatCurrency(house.predicted_price)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Ask Price: {formatCurrency(house.ask_price)}
            </Typography>
            
            <Tooltip 
              title={priceDifference > 0 
                ? "This property may be undervalued" 
                : "This property may be overvalued"
              }
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: priceColor
                }}
              >
                {/* {priceDifference > 0 
                  ? <TrendingUpIcon fontSize="small" /> 
                  : <TrendingDownIcon fontSize="small" />}
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(priceDifference).toFixed(1)}%
                </Typography> */}
              </Box>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Property Details */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SquareFootIcon 
              fontSize="small" 
              sx={{ mr: 1, color: 'text.secondary' }}
            />
            <Typography variant="body2">
              {house.total_floor_area} m² floor area
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationOnIcon 
              fontSize="small" 
              sx={{ mr: 1, color: 'text.secondary', mt: 0.3 }}
            />
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {house.paon && `${house.paon}, `}
              {house.street && `${house.street}, `}
              {house.postcode}
            </Typography>
          </Box>
          
          {/* Additional details like EPC rating if available */}
          {house.current_energy_rating && (
            <Chip 
              label={`EPC: ${house.current_energy_rating}`}
              size="small"
              sx={{ 
                mt: 1,
                fontWeight: 500,
                bgcolor: house.current_energy_rating <= 'C' ? 'success.light' : 'warning.light'
              }}
            />
          )}
        </Box>
        
        {/* View Details Link */}
        <Box sx={{ mt: 'auto', pt: 2, textAlign: 'right' }}>
          <Typography 
            variant="body2" 
            color="primary.main" 
            fontWeight={500}
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              '&:hover': { textDecoration: 'underline' } 
            }}
          >
            View Details <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5 }} />
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default HouseTile;