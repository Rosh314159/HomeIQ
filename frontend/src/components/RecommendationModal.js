import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormGroup,
  Checkbox,
  Box,
  Paper,
  Stack,
  useTheme
} from '@mui/material';

const RecommendationModal = ({ 
  isOpen, 
  onClose, 
  options, 
  setOptions, 
  onGetRecommendations 
}) => {
  const theme = useTheme();
  
  const handleOptionChange = (e) => {
    const { name, type, value, checked } = e.target;
  
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog 
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Find Similar Properties
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Priority Selection */}
        <Box sx={{ mt: 1 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="medium" 
            color="text.primary" 
            sx={{ mb: 2 }}
          >
            Prioritization:
          </Typography>
          
          <FormControl component="fieldset">
            <RadioGroup 
              name="priority" 
              value={options.priority} 
              onChange={handleOptionChange}
            >
              <Stack spacing={1.5}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  <FormControlLabel 
                    value="location" 
                    control={
                      <Radio
                        color="primary"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          Prioritize Location
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Find properties in the same area
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  <FormControlLabel 
                    value="price" 
                    control={
                      <Radio
                        color="primary"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          Prioritize Price
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Find properties in a similar price range
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }}
                >
                  <FormControlLabel 
                    value="" 
                    control={
                      <Radio
                        color="primary"
                        sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          Balanced Search
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Equal consideration to all factors
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Paper>
              </Stack>
            </RadioGroup>
          </FormControl>
        </Box>
        
        {/* Options Form */}
        <Box sx={{ mt: 3 }}>
          <FormGroup>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1.5, 
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="affordableOnly"
                    checked={options.affordableOnly}
                    onChange={(e) => setOptions({...options, affordableOnly: e.target.checked})}
                    color="success"
                    sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      Only Show Affordable Properties
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on your financial profile
                    </Typography>
                  </Box>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          </FormGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ 
            px: 2, 
            py: 1,
            borderRadius: 1.5,
            bgcolor: 'grey.200',
            color: 'text.primary',
            fontWeight: 500,
            borderColor: 'grey.300',
            '&:hover': {
              bgcolor: 'grey.300',
            }
          }}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={onGetRecommendations}
          variant="contained"
          sx={{ 
            px: 3, 
            py: 1, 
            borderRadius: 1.5,
            fontWeight: 500,
            backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            '&:hover': {
              backgroundImage: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`
            }
          }}
        >
          Find Properties
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecommendationModal;