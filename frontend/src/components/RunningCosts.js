import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import OpacityIcon from '@mui/icons-material/Opacity';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PaidIcon from '@mui/icons-material/Paid';

const CostCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  height: '100%',
}));

const RunningCosts = ({ heatingCurrent, heatingPotential, waterCurrent, waterPotential, lightingCurrent, lightingPotential }) => {
  // Calculate total potential savings
  const totalSavings = (
    (heatingCurrent - heatingPotential) +
    (waterCurrent - waterPotential) +
    (lightingCurrent - lightingPotential)
  ).toFixed(2);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <CostCard>
          <Box display="flex" alignItems="center" mb={1}>
            <LocalFireDepartmentIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" fontWeight={500}>
              Heating
            </Typography>
          </Box>
          <Grid container>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Current
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                £{heatingCurrent}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Potential
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                £{heatingPotential}
              </Typography>
            </Grid>
          </Grid>
        </CostCard>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <CostCard>
          <Box display="flex" alignItems="center" mb={1}>
            <OpacityIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" fontWeight={500}>
              Hot Water
            </Typography>
          </Box>
          <Grid container>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Current
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                £{waterCurrent}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Potential
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                £{waterPotential}
              </Typography>
            </Grid>
          </Grid>
        </CostCard>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <CostCard>
          <Box display="flex" alignItems="center" mb={1}>
            <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="subtitle2" fontWeight={500}>
              Lighting
            </Typography>
          </Box>
          <Grid container>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Current
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                £{lightingCurrent}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Potential
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={600}>
                £{lightingPotential}
              </Typography>
            </Grid>
          </Grid>
        </CostCard>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <CostCard>
          <Box display="flex" alignItems="center" mb={1}>
            <PaidIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" fontWeight={500}>
              Total Savings
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Potential Annual Savings
          </Typography>
          <Typography variant="body1" color="success.main" fontWeight={600}>
            £{totalSavings}
          </Typography>
        </CostCard>
      </Grid>
    </Grid>
  );
};

export default RunningCosts;