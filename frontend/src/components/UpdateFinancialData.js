import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Paper, Typography, TextField, Box, Button, 
  Checkbox, FormControlLabel, Divider,
  InputAdornment, Alert, Fade, LinearProgress,
  FormHelperText, IconButton, Tooltip
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import HomeIcon from '@mui/icons-material/Home';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const UpdateFinancialData = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userData, setUserData] = useState({
    annual_income: "",
    debt_obligations: "",
    savings: "",
    credit_score: "",
    is_first_home: false,
  });
  
  const [errors, setErrors] = useState({
    annual_income: "",
    debt_obligations: "",
    savings: ""
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("userFinancialData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData({
        annual_income: parsedData.annual_income || "",
        debt_obligations: parsedData.debt_obligations || "",
        savings: parsedData.savings || "",
        credit_score: parsedData.credit_score || "",
        is_first_home: parsedData.is_first_home || false,
      });
    }
  }, []);

  // Format number with commas as user types
  const formatNumber = (value) => {
    if (!value) return "";
    // Remove any non-digit characters
    const num = value.toString().replace(/[^\d]/g, "");
    // Add commas for thousands
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setUserData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // For numeric fields, format with commas
      const formattedValue = formatNumber(value);
      setUserData((prev) => ({ ...prev, [name]: formattedValue }));
      
      // Clear error when field is filled
      if (formattedValue) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = { annual_income: "", debt_obligations: "", savings: "" };
    
    if (!userData.annual_income) {
      newErrors.annual_income = "Annual income is required";
      isValid = false;
    }
    
    if (!userData.debt_obligations) {
      newErrors.debt_obligations = "Monthly debt information is required";
      isValid = false;
    }
    
    if (!userData.savings) {
      newErrors.savings = "Savings amount is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Save data to localStorage
  const saveToLocalStorage = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert string values with commas to integers
      const parseValue = (val) => {
        if (!val) return 0;
        return parseInt(val.toString().replace(/,/g, ""), 10);
      };
      
      const dataToSave = {
        annual_income: parseValue(userData.annual_income),
        debt_obligations: parseValue(userData.debt_obligations),
        savings: parseValue(userData.savings),
        credit_score: parseValue(userData.credit_score),
        is_first_home: userData.is_first_home
      };
      
      localStorage.setItem("userFinancialData", JSON.stringify(dataToSave));
      
      // Simulate a brief delay to show the success message
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/your-financial-data");
      }, 1500);
      
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{
        maxWidth: 600,
        width: '100%',
        mx: 'auto',
        mt: 4,
        p: 4,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isSubmitting && (
        <LinearProgress 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }} 
        />
      )}
      
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          sx={{ mr: 2 }} 
          onClick={() => navigate("/your-financial-data")}
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600} component="h1">
          Your Financial Profile
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Enter your financial details below to get personalized home affordability insights.
      </Typography>
      
      <Divider sx={{ my: -3.1 }} />
      
      {/* Success message */}
      <Fade in={showSuccess}>
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setShowSuccess(false)}
        >
          Your financial data has been saved successfully!
        </Alert>
      </Fade>
      
      {/* Form fields */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            name="annual_income"
            label="Annual Income"
            value={userData.annual_income}
            onChange={handleChange}
            error={!!errors.annual_income}
            helperText={errors.annual_income}
            fullWidth
            variant="outlined"
            placeholder="e.g. 45,000"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceWalletIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">£</InputAdornment>
              ),
            }}
          />
          <FormHelperText>
            Your gross annual income before tax
          </FormHelperText>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            name="debt_obligations"
            label="Monthly Debt Obligations"
            value={userData.debt_obligations}
            onChange={handleChange}
            error={!!errors.debt_obligations}
            helperText={errors.debt_obligations}
            fullWidth
            variant="outlined"
            placeholder="e.g. 500"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon color="error" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">£</InputAdornment>
              ),
            }}
          />
          <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>
            Include all monthly payments: loans, credit cards, etc.
            <Tooltip title="Include all regular monthly payments such as car loans, student loans, credit card minimum payments, and other debt obligations." arrow>
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </FormHelperText>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            name="savings"
            label="Available Deposit"
            value={userData.savings}
            onChange={handleChange}
            error={!!errors.savings}
            helperText={errors.savings}
            fullWidth
            variant="outlined"
            placeholder="e.g. 20,000"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SavingsIcon color="success" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">£</InputAdornment>
              ),
            }}
          />
          <FormHelperText>
            Total deposit available for your home
          </FormHelperText>
        </Box>
        
        <FormControlLabel
          control={
            <Checkbox
              name="is_first_home"
              checked={userData.is_first_home}
              onChange={handleChange}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>First-time home buyer</Typography>
              <Tooltip title="First-time buyers may be eligible for special programs and incentives." arrow>
                <IconButton size="small">
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
      </Box>
    
      
      {/* Save Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={saveToLocalStorage}
        disabled={isSubmitting || !userData.annual_income || !userData.debt_obligations || !userData.savings}
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        {isSubmitting ? "Saving..." : "Save Financial Data"}
      </Button>
      
      {/* Additional info */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
        Your data is saved locally on your device and not sent to any server.
      </Typography>
    </Paper>
  );
};

export default UpdateFinancialData;

