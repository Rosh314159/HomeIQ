import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Divider,  useTheme
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const HouseTile = ({ house }) => {
  const navigate = useNavigate();

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
  const propertyTypeDisplay = getPropertyTypeFull(house.property_type);
  const houseColor = getHouseColor(house.postcode);

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
        <HomeIcon sx={{ fontSize: 80, color: 'lightgrey' }} />
        
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
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <LocationOnIcon 
              fontSize="small" 
              sx={{ mr: 1, color: 'text.secondary', mt: 0.3 }}
            />
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {house.address1 && `${house.address1}, `}
              {house.address2 && `${house.address2}, `}
              {house.address3 && `${house.address3}, `}
              {house.postcode}
            </Typography>
          </Box>
        
        {/* Property Details */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SquareFootIcon 
              fontSize="small" 
              sx={{ mr: 1, color: 'text.secondary' }}
            />
            <Typography variant="body2">
              {house.total_floor_area} m² Floor Area
            </Typography>
          </Box>
          

          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <DoorFrontIcon
              fontSize="small" 
              sx={{ mr: 1, color: 'text.secondary', mt: 0.3 }}
            />
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {house.number_habitable_rooms && `${house.number_habitable_rooms} Habitable Rooms `}
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
            color="primary.main" 
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              '&:hover': { textDecoration: 'underline' } 
            }}
          >
            View Details <InfoOutlinedIcon fontSize="small"/>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default HouseTile;