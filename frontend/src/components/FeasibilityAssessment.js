import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  AlertTitle,
  Divider,
  Tabs,
  Tab,
  Skeleton,
  Chip,
  Collapse,
  useTheme
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MonthlyOutgoingsChart from './MonthlyOutgoingsChart';
import RatioChart from './RatioChart';

const FeasibilityAssessment = (houseData) => {
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeasibilityAssessment = async () => {
      try {
        setLoading(true);
        const userFinancialData = JSON.parse(localStorage.getItem("userFinancialData"));
        
        console.log(houseData.data.predicted_price);
        if (!userFinancialData || !houseData) {
          setError("Missing user financial data or house details.");
          setLoading(false);
          return;
        }
        
        // Calculate monthly utility bills from house data or use default values
        const calculateMonthlyUtilities = () => {
          const waterCost = houseData.data?.hot_water_cost_current || 0;
          const heatingCost = houseData.data?.heating_cost_current || 0;
          const lightingCost = houseData.data?.lighting_cost_current || 0; 
          // If both values are missing, use default of 150
          if (waterCost === 0 || lightingCost === 0 || heatingCost === 0) {
            return 150;
          }
          console.log(`Calculated monthly utilities: Water: £${waterCost}, Heating: £${heatingCost}, Lighting: £${lightingCost}`);
          return waterCost + lightingCost + heatingCost;
        };

        // Get monthly utility bills
        const monthlyUtilities = calculateMonthlyUtilities();
        // Construct inputs for feasibility assessment
        const systemInputs = {
          house_price: houseData.data.predicted_price,
          loan_term_years: 30,
          interest_rate: 3.5,
          property_tax: 200,
          insurance: 100,
          utility_bills: monthlyUtilities,
        };

        const userInputs = {
          annual_income: userFinancialData.annual_income,
          debt_obligations: userFinancialData.debt_obligations,
          savings: userFinancialData.savings,
          is_first_home: userFinancialData.is_first_home,
        };

        // Call the backend feasibility assessment API using axios
        const response = await axios.post("http://localhost:5000/feasibility", {
          system_inputs: systemInputs,
          user_inputs: userInputs,
        });
        setAssessment(response.data.result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to compute feasibility assessment.");
        setLoading(false);
      }
    };

    fetchFeasibilityAssessment();
  }, []);

  // Toggle information panel
  const toggleInfo = () => setShowInfo(!showInfo);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Loading state UI
  if (loading) {
    return (
      <Paper elevation={3} sx={{ maxWidth: '64rem', mx: 'auto', p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Feasibility Assessment
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rectangular" height={32} animation="wave" />
          <Skeleton variant="rectangular" height={32} animation="wave" />
          <Skeleton variant="rectangular" height={32} animation="wave" />
          <Skeleton variant="rectangular" height={256} animation="wave" />
          <Skeleton variant="rectangular" height={256} animation="wave" />
        </Box>
      </Paper>
    );
  }

  // Error state UI
  if (error) {
    return (
      <Paper elevation={3} sx={{ maxWidth: '64rem', mx: 'auto', p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Feasibility Assessment
        </Typography>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 1 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Paper>
    );
  }

  // No assessment data
  if (!assessment) {
    return (
      <Paper elevation={3} sx={{ maxWidth: '64rem', mx: 'auto', p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
          Feasibility Assessment
        </Typography>
        <Alert severity="info" sx={{ borderRadius: 1 }}>
          <AlertTitle>No Data Available</AlertTitle>
          We couldn't load the feasibility assessment. Please make sure you've entered all required information.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ maxWidth: '64rem', mx: 'auto', p: 3, borderRadius: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { sm: 'center' }, 
        justifyContent: { sm: 'space-between' },
        gap: 1, 
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {assessment.is_affordable ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="Affordable"
              color="success"
              size="small"
              sx={{ 
                px: 1,
                py: 0.5,
                borderRadius: 16,
                fontWeight: 500,
                '& .MuiChip-icon': { fontSize: 16 }
              }}
            />
          ) : (
            <Chip
              icon={<CancelIcon />}
              label="Not Affordable"
              color="error"
              size="small"
              sx={{ 
                px: 1,
                py: 0.5,
                borderRadius: 16,
                fontWeight: 500,
                '& .MuiChip-icon': { fontSize: 16 }
              }}
            />
          )}
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={1}
            sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Monthly Payment
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(assessment.monthly_payment)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={1}
            sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Total Monthly Housing Costs
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(assessment.total_housing_costs)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={1}
            sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Monthly Income
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(assessment.monthly_income || 0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Information Toggle */}
      <Box sx={{ mb: 3 }}>
        <Button 
          onClick={toggleInfo} 
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<InfoIcon />}
          endIcon={showInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ 
            justifyContent: 'space-between',
            textAlign: 'left',
            py: 1
          }}
        >
          How is feasibility calculated?
        </Button>
        
        <Collapse in={showInfo}>
          <Paper 
            elevation={0}
            sx={{ 
              mt: 1, 
              p: 2, 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              border: 1, 
              borderColor: 'primary.main',
              borderRadius: 1, 
              fontSize: '0.875rem'
            }}
          >
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
              Understanding Financial Ratios
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography fontWeight="medium">Debt-to-Income Ratio (DTI)</Typography>
              <Typography sx={{ mb: 0.5 }}>
                Measures the proportion of your gross monthly income that goes toward debt payments.
              </Typography>
              <Box sx={{ p: 0.5, borderRadius: 1, mb: 0.5}}>
                DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100%
              </Box>
              <Typography>
                Recommended: <Box component="span" fontWeight="medium">below 36%</Box>, 
                Maximum: <Box component="span" fontWeight="medium">43%</Box> for mortgage approval.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography fontWeight="medium">Loan-to-Value Ratio (LTV)</Typography>
              <Typography sx={{ mb: 0.5 }}>
                Compares the mortgage amount to the property's value.
              </Typography>
              <Box sx={{ p: 0.5, borderRadius: 1, mb: 0.5 }}>
                LTV = (Loan Amount / Property Value) × 100%
              </Box>
              <Typography>
                Preferred: <Box component="span" fontWeight="medium">80% or lower</Box>. 
                Higher ratios may require PMI and result in higher rates.
              </Typography>
            </Box>
            
            <Box>
              <Typography fontWeight="medium">Mortgage-to-Income Ratio</Typography>
              <Typography sx={{ mb: 0.5 }}>
                Assesses how much you need to borrow compared to your yearly income.
              </Typography>
              <Box sx={{ p: 0.5, borderRadius: 1, mb: 0.5 }}>
                Mortgage-to-Income Ratio = Mortgage Amount / Yearly Income
              </Box>
              <Typography>
                Recommended: <Box component="span" fontWeight="medium">28% or lower</Box>. 
                Higher ratios may indicate affordability issues.
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography fontWeight="medium">Bills-to-Income Ratio</Typography>
              <Typography sx={{ mb: 0.5 }}>
                Checks whether your total monthly housing bills (mortgage, water, heating and lighting) 
                are affordable relative to your take-home pay after UK Income Tax and National Insurance.
              </Typography>
              <Box sx={{ p: 0.5, borderRadius: 1, mb: 0.5 }}>
                Bills-to-Income = (Monthly Mortgage + Water + Heating + Lighting) / Monthly Post-Tax Income × 100%
              </Box>
              <Typography>
                Must be: <Box component="span" fontWeight="medium">below 50%</Box>. 
                Exceeding this means housing costs take up too large a share of your net income.
              </Typography>
            </Box>
          </Paper>
        </Collapse>
      </Box>
      
      {/* Tabs for Charts */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 'medium'
            }
          }}
        >
          <Tab label="Monthly Outgoings" />
          <Tab label="Financial Ratios" />
        </Tabs>
        
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <MonthlyOutgoingsChart feasibilityData={assessment} houseData={houseData.data} />
          )}
          
          {activeTab === 1 && (
            <RatioChart feasibilityData={assessment} houseData={houseData.data} />
          )}
        </Box>
      </Box>
      
      {/* Recommendations */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
            Recommendations
          </Typography>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              borderRadius: 1,
              bgcolor: assessment.is_affordable ? 'warning.light' : 'error.light',
              border: 1,
              borderColor: assessment.is_affordable ? 'warning.main' : 'error.main'
            }}
          >
            <Typography fontWeight="bold" sx={{ mb: 1 }}>
              Action Required
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              {assessment.recommendations.map((rec, index) => (
                <Box 
                  component="li" 
                  key={index} 
                  sx={{ 
                    color: assessment.is_affordable ? 'warning.dark' : 'error.dark',
                    mb: 0.5
                  }}
                >
                  {rec}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default FeasibilityAssessment;