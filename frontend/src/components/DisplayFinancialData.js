import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Box, Divider, 
  Skeleton, Chip, useTheme, Grid,
  LinearProgress
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SavingsIcon from '@mui/icons-material/Savings';
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const DisplayFinancialData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Format currency with commas
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  // Calculate mortgage affordability (simplified estimate)
  const calculateAffordability = (income, deposit) => {
    // UK standard: ~4.5x annual income + deposit
    return Math.min(income * 4.5 + deposit, deposit * 20);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const storedData = localStorage.getItem('userFinancialData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Error loading financial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Loading state with nice skeleton effect
  if (loading) {
    return (
      <Paper elevation={3} sx={{ 
        maxWidth: "md", 
        mx: "auto", 
        p: 4, 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant="text" sx={{ fontSize: '2rem', width: '60%' }} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} key={item}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  // No data state
  if (!userData) {
    return (
      <Paper elevation={3} sx={{ 
        maxWidth: "md", 
        mx: "auto", 
        p: 4, 
        borderRadius: 3,
        textAlign: "center",
        background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'
      }}>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          No Financial Information Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          You need to enter your financial details before we can show affordability insights.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip 
            icon={<EditIcon />} 
            label="Add Financial Data" 
            color="primary" 
            clickable
            onClick={() => navigate('/update-financial-data')}
            sx={{ py: 2.5, px: 1, fontSize: '1rem' }}
          />
        </Box>
      </Paper>
    );
  }
  
  // Calculate home affordability
  const affordability = calculateAffordability(userData.annual_income, userData.savings);
  
  // Calculate debt-to-income ratio
  const monthlyIncome = userData.annual_income / 12;
  const dtiRatio = (userData.debt_obligations / monthlyIncome) * 100;
  const dtiHealth = dtiRatio <= 36 ? "good" : dtiRatio <= 43 ? "moderate" : "high";
  
  return (
    <Paper elevation={3} sx={{ 
      maxWidth: "md", 
      mx: "auto", 
      p: 4, 
      borderRadius: 3,
      overflow: "hidden",
      position: "relative",
      background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceIcon 
            sx={{ 
              fontSize: 36, 
              color: 'primary.main', 
              mr: 2 
            }} 
          />
          <Typography variant="h5" fontWeight="600">
            Your Financial Profile
          </Typography>
        </Box>
        <Chip 
          icon={<EditIcon />} 
          label="Update" 
          color="primary" 
          size="small"
          variant="outlined"
          clickable
          onClick={() => navigate('/update-financial-data')}
        />
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Financial Metrics Grid */}
      <Grid container spacing={3}>
        {/* Annual Income */}
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%',
                  p: 0.7,
                  mr: 1,
                  display: 'flex',
                }}
              >
                <SavingsIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" color="textSecondary">
                Annual Income
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              {formatCurrency(userData.annual_income)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monthly: {formatCurrency(userData.annual_income / 12)}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Savings/Deposit */}
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'success.main',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  bgcolor: 'success.main', 
                  borderRadius: '50%',
                  p: 0.7,
                  mr: 1,
                  display: 'flex',
                }}
              >
                <SavingsIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" color="textSecondary">
                Deposit Amount
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              {formatCurrency(userData.savings)}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Monthly Debt */}
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%',
              borderTop: '4px solid',
              borderColor: 
                dtiHealth === "good" ? "success.main" : 
                dtiHealth === "moderate" ? "warning.main" : "error.main",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  bgcolor: 
                    dtiHealth === "good" ? "success.main" : 
                    dtiHealth === "moderate" ? "warning.main" : "error.main", 
                  borderRadius: '50%',
                  p: 0.7,
                  mr: 1,
                  display: 'flex',
                }}
              >
                <CreditScoreIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" color="textSecondary">
                Monthly Debt
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              {formatCurrency(userData.debt_obligations)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">
                DTI Ratio: {Math.round(dtiRatio)}%
              </Typography>
              <Chip 
                label={dtiHealth === "good" ? "Healthy" : dtiHealth === "moderate" ? "Moderate" : "High"} 
                size="small"
                color={dtiHealth === "good" ? "success" : dtiHealth === "moderate" ? "warning" : "error"}
              />
            </Box>
            <Box sx={{ mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(dtiRatio, 100)}
                color={dtiHealth === "good" ? "success" : dtiHealth === "moderate" ? "warning" : "error"}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Mortgage Affordability */}
        <Grid item xs={12} sm={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              height: '100%',
              borderTop: '4px solid',
              borderColor: 'info.main',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box 
                sx={{ 
                  bgcolor: 'info.main', 
                  borderRadius: '50%',
                  p: 0.7,
                  mr: 1,
                  display: 'flex',
                }}
              >
                <HomeIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle1" color="textSecondary">
                What house price can I afford?
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
              {formatCurrency(affordability)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

              {userData.is_first_home && (
                <Chip 
                  label="First-time Buyer" 
                  size="small"
                  color="secondary"
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Information & Disclaimer */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mt: 3, 
          bgcolor: 'info.light',
          color: 'info.contrastText',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          This is an estimated overview of your financial profile. Actual mortgage eligibility and affordability 
          may vary based on lender criteria, interest rates, and other factors. The debt-to-income ratio is a key
          metric lenders use - keeping it below 36% is generally recommended.
        </Typography>
      </Paper>
    </Paper>
  );
};

export default DisplayFinancialData;
