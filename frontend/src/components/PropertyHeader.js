import { Box, Typography, Paper, Button, Stack, Chip, Avatar} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1976d2 0%, #304ffe 100%)',
  padding: theme.spacing(4, 2),
  color: 'white',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5, 3),
  }
}));

const PriceCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.12)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius * 2,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.5, 3.5),
  }
}));

const PropertyTypeAvatar = styled(Avatar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.2)',
  width: 64,
  height: 64,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)', 
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  transition: 'all 0.2s',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.25)',
  }
}));

const PropertyHeader = ({ property, onBack }) => {
  // Helper function to get full property type
  console.log('Property data:', property);
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

  const fullPropertyType = getPropertyTypeFull(property.property_type);


  return (
    <GradientBox>
      <Box maxWidth="lg" mx="auto">
        {/* Back button - positioned at the top left */}
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="text"
            sx={{
              color: 'white',
              background: 'rgba(255, 255, 255, 0.15)',
              py: 0.75,
              px: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.25)',
                transform: 'translateX(-3px)',
              }
            }}
          >
            Back to search
          </Button>
        </Box>
        
        {/* Main content - centered */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          mt: -4
        }}>
          {/* Property type icon */}
          <PropertyTypeAvatar>
            <HomeIcon sx={{ fontSize: '2.2rem' }} />
          </PropertyTypeAvatar>
          
          {/* Location with emphasis */}
          <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: '1.2rem', mr: 0.5, color: 'rgba(255, 255, 255, 0.9)' }} />
            <Typography variant="h4"  sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 700 }}>
              {property.address}, {property.postcode}
            </Typography>
          </Stack>
  
          {/* Property type */}
          <Typography sx={{ opacity: 0.9, letterSpacing: 1, fontWeight: 500, mb: 0.5 }}>
            {fullPropertyType}
          </Typography>
          
          {/* Price card - centered and more prominent */}
          <PriceCard elevation={2} sx={{ minWidth: { xs: '80%', sm: '60%', md: '40%' }, mx: 'auto' }}>
            <Typography variant="body1" fontWeight={500} sx={{ opacity: 0.9, letterSpacing: 0.5 }}>
              Predicted Value
            </Typography>
            <Typography variant="h2" fontWeight={700} sx={{ mt: 1, mb: -2 }}>
              £{Math.round(property.predicted_price).toLocaleString()}
            </Typography>
          </PriceCard>
        </Box>
      </Box>
    </GradientBox>
  );
};

export default PropertyHeader;